<?php
/**
 * Rutas de solo lectura y emparejamiento.
 *
 * @package CuidadoConector
 */

namespace CuidadoConector;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Rest {
	public static function register(): void {
		add_action( 'rest_api_init', array( self::class, 'routes' ) );
	}

	public static function routes(): void {
		register_rest_route(
			'cuidado/v1',
			'/health',
			array(
				'methods'             => 'GET',
				'callback'            => array( self::class, 'health' ),
				'permission_callback' => '__return_true',
			)
		);

		register_rest_route(
			'cuidado/v1',
			'/pair/redeem',
			array(
				'methods'             => 'POST',
				'callback'            => array( self::class, 'redeem' ),
				'permission_callback' => '__return_true',
			)
		);

		register_rest_route(
			'cuidado/v1',
			'/snapshot',
			array(
				'methods'             => 'GET',
				'callback'            => array( self::class, 'snapshot' ),
				'permission_callback' => array( self::class, 'authorize' ),
			)
		);
	}

	public static function health(): \WP_REST_Response {
		return new \WP_REST_Response(
			array(
				'ok'      => true,
				'version' => '0.1.0',
			),
			200
		);
	}

	/**
	 * @return true|\WP_Error
	 */
	public static function authorize() {
		$secret = self::bearer();
		$stored = (string) get_option( 'cuidado_conector_secret_hash', '' );
		if ( '' === $secret || '' === $stored ) {
			return new \WP_Error( 'UNAUTHORIZED', 'Falta la autorización.', array( 'status' => 401 ) );
		}
		$given = hash( 'sha256', $secret );
		if ( ! hash_equals( $stored, $given ) ) {
			return new \WP_Error( 'UNAUTHORIZED', 'La autorización no coincide.', array( 'status' => 401 ) );
		}
		return true;
	}

	public static function redeem( \WP_REST_Request $request ): \WP_REST_Response|\WP_Error {
		$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? (string) $_SERVER['REMOTE_ADDR'] : 'unknown';
		$key = 'cuidado_conector_redeem_' . md5( $ip );
		$hits = (int) get_transient( $key );
		if ( $hits > 20 ) {
			return new \WP_Error( 'PAIR_INVALID', 'Demasiados intentos.', array( 'status' => 429 ) );
		}
		set_transient( $key, $hits + 1, 10 * MINUTE_IN_SECONDS );

		$params = $request->get_json_params();
		$code   = isset( $params['code'] ) ? (string) $params['code'] : '';
		$secret = isset( $params['secret'] ) ? (string) $params['secret'] : '';
		if ( 1 !== preg_match( '/^[a-f0-9]{32}$/', $code ) || strlen( $secret ) < 32 || strlen( $secret ) > 200 ) {
			return new \WP_Error( 'PAIR_INVALID', 'El código no sirve.', array( 'status' => 401 ) );
		}

		$expires = (int) get_option( 'cuidado_conector_pair_expires', 0 );
		$hash    = (string) get_option( 'cuidado_conector_pair_hash', '' );
		if ( '' === $hash || ! hash_equals( $hash, hash( 'sha256', $code ) ) ) {
			return new \WP_Error( 'PAIR_INVALID', 'El código no sirve.', array( 'status' => 401 ) );
		}
		if ( $expires < time() ) {
			delete_option( 'cuidado_conector_pair_hash' );
			delete_option( 'cuidado_conector_pair_expires' );
			return new \WP_Error( 'PAIR_EXPIRED', 'El código venció.', array( 'status' => 401 ) );
		}

		global $wpdb;
		$deleted = $wpdb->query(
			$wpdb->prepare(
				"DELETE FROM {$wpdb->options} WHERE option_name = %s AND option_value = %s",
				'cuidado_conector_pair_hash',
				$hash
			)
		);
		if ( 1 !== (int) $deleted ) {
			return new \WP_Error( 'PAIR_INVALID', 'El código ya se usó.', array( 'status' => 401 ) );
		}

		delete_option( 'cuidado_conector_pair_expires' );
		update_option( 'cuidado_conector_secret_hash', hash( 'sha256', $secret ), false );

		return new \WP_REST_Response(
			array(
				'siteName'  => get_bloginfo( 'name' ),
				'homeUrl'   => home_url(),
				'wpVersion' => get_bloginfo( 'version' ),
				'phpVersion' => PHP_VERSION,
			),
			200
		);
	}

	public static function snapshot(): \WP_REST_Response|\WP_Error {
		$engine = self::posts_engine();
		if ( 0 !== strcasecmp( $engine, 'InnoDB' ) ) {
			return new \WP_Error(
				'INNODB_REQUIRED',
				'La base del sitio no usa InnoDB.',
				array( 'status' => 422 )
			);
		}

		$revisions = self::capped_revisions();
		$transients = self::capped_transients();
		$spam       = self::capped_spam();
		if ( $revisions instanceof \WP_Error ) {
			return $revisions;
		}
		if ( $transients instanceof \WP_Error ) {
			return $transients;
		}
		if ( $spam instanceof \WP_Error ) {
			return $spam;
		}

		$counts = array(
			'revisions'         => $revisions,
			'expiredTransients' => $transients,
			'spamComments'      => $spam,
		);
		$revision_bytes = $revisions > MAX_ROWS ? MAX_BYTES + 1 : self::revision_bytes();
		$transient_bytes = $transients > MAX_ROWS ? MAX_BYTES + 1 : self::transient_bytes();
		$spam_bytes      = $spam > MAX_ROWS ? MAX_BYTES + 1 : self::spam_bytes();
		foreach ( array( $revision_bytes, $transient_bytes, $spam_bytes ) as $measured ) {
			if ( $measured instanceof \WP_Error ) {
				return $measured;
			}
		}

		$bytes = array(
			'revisions'         => $revision_bytes,
			'expiredTransients' => $transient_bytes,
			'spamComments'      => $spam_bytes,
		);

		$over = $counts['revisions'] > MAX_ROWS
			|| $counts['expiredTransients'] > MAX_ROWS
			|| $counts['spamComments'] > MAX_ROWS
			|| $bytes['revisions'] > MAX_BYTES
			|| $bytes['expiredTransients'] > MAX_BYTES
			|| $bytes['spamComments'] > MAX_BYTES;

		if ( $over ) {
			return new \WP_Error(
				'PAYLOAD_LIMIT',
				'La limpieza supera 2000 filas o 32 MB.',
				array(
					'status' => 409,
					'counts' => $counts,
				)
			);
		}

		return new \WP_REST_Response(
			array(
				'siteName'   => get_bloginfo( 'name' ),
				'homeUrl'    => home_url(),
				'wpVersion'  => get_bloginfo( 'version' ),
				'phpVersion' => PHP_VERSION,
				'engine'     => 'InnoDB',
				'innodb'     => true,
				'counts'     => $counts,
				'bytes'      => $bytes,
			),
			200
		);
	}

	private static function bearer(): string {
		$header = isset( $_SERVER['HTTP_AUTHORIZATION'] ) ? (string) $_SERVER['HTTP_AUTHORIZATION'] : '';
		if ( '' === $header && function_exists( 'getallheaders' ) ) {
			$headers = getallheaders();
			if ( isset( $headers['Authorization'] ) ) {
				$header = (string) $headers['Authorization'];
			}
		}
		if ( str_starts_with( $header, 'Bearer ' ) ) {
			return substr( $header, 7 );
		}
		return '';
	}

	private static function posts_engine(): string {
		global $wpdb;
		$row = $wpdb->get_row( $wpdb->prepare( 'SHOW TABLE STATUS WHERE Name = %s', $wpdb->posts ), ARRAY_A );
		if ( ! is_array( $row ) || empty( $row['Engine'] ) ) {
			return '';
		}
		return (string) $row['Engine'];
	}

	/**
	 * @return int|\WP_Error
	 */
	private static function capped_revisions() {
		global $wpdb;
		$cutoff = gmdate( 'Y-m-d H:i:s', time() - 30 * DAY_IN_SECONDS );
		$sql    = $wpdb->prepare(
			"SELECT COUNT(*) FROM (
				SELECT ranked.ID
				FROM (
					SELECT ID, post_modified_gmt, ROW_NUMBER() OVER (PARTITION BY post_parent ORDER BY post_modified_gmt DESC, ID DESC) AS rn
					FROM {$wpdb->posts}
					WHERE post_type = 'revision'
				) ranked
				WHERE ranked.rn > 5 AND ranked.post_modified_gmt < %s
				LIMIT %d
			) cuidado_cap",
			$cutoff,
			MAX_ROWS + 1
		);
		return self::int_query( $sql );
	}

	/**
	 * @return int|\WP_Error
	 */
	private static function revision_bytes() {
		global $wpdb;
		$cutoff = gmdate( 'Y-m-d H:i:s', time() - 30 * DAY_IN_SECONDS );
		$sql    = $wpdb->prepare(
			"SELECT COALESCE(SUM(octet_len), 0) FROM (
				SELECT OCTET_LENGTH(posts.post_content) AS octet_len
				FROM (
					SELECT ID, post_modified_gmt, ROW_NUMBER() OVER (PARTITION BY post_parent ORDER BY post_modified_gmt DESC, ID DESC) AS rn
					FROM {$wpdb->posts}
					WHERE post_type = 'revision'
				) ranked
				INNER JOIN {$wpdb->posts} posts ON posts.ID = ranked.ID
				WHERE ranked.rn > 5 AND ranked.post_modified_gmt < %s
				LIMIT %d
			) cuidado_bytes",
			$cutoff,
			MAX_ROWS
		);
		return self::int_query( $sql );
	}

	/**
	 * @return int|\WP_Error
	 */
	private static function capped_transients() {
		global $wpdb;
		$timeout = $wpdb->esc_like( '_transient_timeout_' ) . '%';
		$wc      = $wpdb->esc_like( '_transient_timeout_wc_session_' ) . '%';
		$as      = $wpdb->esc_like( '_transient_timeout_action_scheduler_' ) . '%';
		$sql     = $wpdb->prepare(
			"SELECT COUNT(*) FROM (
				SELECT option_id FROM {$wpdb->options}
				WHERE option_name LIKE %s AND option_name NOT LIKE %s AND option_name NOT LIKE %s
				AND option_value+0 > 0 AND option_value+0 < %d
				LIMIT %d
			) cuidado_cap",
			$timeout,
			$wc,
			$as,
			time(),
			MAX_ROWS + 1
		);
		return self::int_query( $sql );
	}

	/**
	 * @return int|\WP_Error
	 */
	private static function transient_bytes() {
		global $wpdb;
		$timeout = $wpdb->esc_like( '_transient_timeout_' ) . '%';
		$wc      = $wpdb->esc_like( '_transient_timeout_wc_session_' ) . '%';
		$as      = $wpdb->esc_like( '_transient_timeout_action_scheduler_' ) . '%';
		$sql     = $wpdb->prepare(
			"SELECT COALESCE(SUM(octet_len), 0) FROM (
				SELECT OCTET_LENGTH(data_row.option_value) AS octet_len
				FROM {$wpdb->options} timeout_row
				INNER JOIN {$wpdb->options} data_row
					ON data_row.option_name = REPLACE(timeout_row.option_name, '_transient_timeout_', '_transient_')
				WHERE timeout_row.option_name LIKE %s
					AND timeout_row.option_name NOT LIKE %s
					AND timeout_row.option_name NOT LIKE %s
					AND timeout_row.option_value+0 > 0
					AND timeout_row.option_value+0 < %d
				LIMIT %d
			) cuidado_bytes",
			$timeout,
			$wc,
			$as,
			time(),
			MAX_ROWS
		);
		return self::int_query( $sql );
	}

	/**
	 * @return int|\WP_Error
	 */
	private static function capped_spam() {
		global $wpdb;
		$cutoff = gmdate( 'Y-m-d H:i:s', time() - 30 * DAY_IN_SECONDS );
		$sql    = $wpdb->prepare(
			"SELECT COUNT(*) FROM (
				SELECT comment_ID FROM {$wpdb->comments}
				WHERE comment_approved = 'spam' AND comment_date_gmt < %s
				LIMIT %d
			) cuidado_cap",
			$cutoff,
			MAX_ROWS + 1
		);
		return self::int_query( $sql );
	}

	/**
	 * @return int|\WP_Error
	 */
	private static function spam_bytes() {
		global $wpdb;
		$cutoff = gmdate( 'Y-m-d H:i:s', time() - 30 * DAY_IN_SECONDS );
		$sql    = $wpdb->prepare(
			"SELECT COALESCE(SUM(octet_len), 0) FROM (
				SELECT OCTET_LENGTH(comment_content) AS octet_len
				FROM {$wpdb->comments}
				WHERE comment_approved = 'spam' AND comment_date_gmt < %s
				LIMIT %d
			) cuidado_bytes",
			$cutoff,
			MAX_ROWS
		);
		return self::int_query( $sql );
	}

	/**
	 * @return int|\WP_Error
	 */
	private static function int_query( string $sql ) {
		global $wpdb;
		$wpdb->last_error = '';
		$value            = $wpdb->get_var( $sql );
		if ( '' !== $wpdb->last_error ) {
			return new \WP_Error( 'SNAPSHOT_FAILED', 'No pudimos leer la base.', array( 'status' => 500 ) );
		}
		return (int) $value;
	}
}
