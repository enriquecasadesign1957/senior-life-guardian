<?php
/**
 * Aplica y deshace la limpieza de basura (InnoDB).
 *
 * @package CuidadoConector
 */

namespace CuidadoConector;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Cleanup {
	public static function register(): void {
		add_action( 'rest_api_init', array( self::class, 'routes' ) );
	}

	public static function routes(): void {
		register_rest_route(
			'cuidado/v1',
			'/cleanup/apply',
			array(
				'methods'             => 'POST',
				'callback'            => array( self::class, 'apply' ),
				'permission_callback' => array( Rest::class, 'authorize' ),
			)
		);
		register_rest_route(
			'cuidado/v1',
			'/cleanup/undo',
			array(
				'methods'             => 'POST',
				'callback'            => array( self::class, 'undo' ),
				'permission_callback' => array( Rest::class, 'authorize' ),
			)
		);
	}

	public static function ensure_table(): void {
		global $wpdb;
		$table   = self::table_name();
		$charset = $wpdb->get_charset_collate();
		$sql     = "CREATE TABLE {$table} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			batch_id char(36) NOT NULL,
			kind varchar(32) NOT NULL,
			payload longtext NOT NULL,
			created_gmt datetime NOT NULL,
			PRIMARY KEY  (id),
			KEY batch_id (batch_id)
		) {$charset};";
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $sql );
	}

	public static function apply( \WP_REST_Request $request ): \WP_REST_Response|\WP_Error {
		self::ensure_table();
		$existing = get_option( 'cuidado_conector_last_batch', null );
		if ( is_array( $existing ) && ! empty( $existing['batchId'] ) && ! empty( $existing['undoUntil'] ) ) {
			$until = strtotime( (string) $existing['undoUntil'] );
			if ( $until > time() ) {
				return new \WP_Error(
					'UNDO_PENDING',
					'Ya hay una limpieza pendiente de deshacer.',
					array( 'status' => 409 )
				);
			}
		}
		$payload = Rest::snapshot_payload();
		if ( $payload instanceof \WP_Error ) {
			return $payload;
		}

		$batch_id = self::uuid();
		$counts   = array(
			'revisions'         => 0,
			'expiredTransients' => 0,
			'spamComments'      => 0,
		);

		global $wpdb;
		$wpdb->query( 'START TRANSACTION' );
		try {
			$counts['revisions']         = self::purge_revisions( $batch_id );
			$counts['expiredTransients'] = self::purge_transients( $batch_id );
			$counts['spamComments']      = self::purge_spam( $batch_id );
			if ( $wpdb->last_error ) {
				throw new \RuntimeException( $wpdb->last_error );
			}
			$wpdb->query( 'COMMIT' );
		} catch ( \Throwable $error ) {
			$wpdb->query( 'ROLLBACK' );
			return new \WP_Error( 'CLEANUP_FAILED', 'No pudimos limpiar la base.', array( 'status' => 500 ) );
		}

		$undo_until = gmdate( 'c', time() + 7 * DAY_IN_SECONDS );
		update_option(
			'cuidado_conector_last_batch',
			array(
				'batchId'   => $batch_id,
				'undoUntil' => $undo_until,
				'counts'    => $counts,
			),
			false
		);

		return new \WP_REST_Response(
			array(
				'batchId'   => $batch_id,
				'undoUntil' => $undo_until,
				'counts'    => $counts,
				'bytes'     => $payload['bytes'],
			),
			200
		);
	}

	public static function undo( \WP_REST_Request $request ): \WP_REST_Response|\WP_Error {
		self::ensure_table();
		$params   = $request->get_json_params();
		$batch_id = isset( $params['batchId'] ) ? (string) $params['batchId'] : '';
		if ( 1 !== preg_match( '/^[a-f0-9-]{36}$/i', $batch_id ) ) {
			return new \WP_Error( 'INVALID_INPUT', 'Falta el lote.', array( 'status' => 400 ) );
		}

		$stored = get_option( 'cuidado_conector_last_batch', null );
		if ( ! is_array( $stored ) || (string) ( $stored['batchId'] ?? '' ) !== $batch_id ) {
			return new \WP_Error( 'UNDO_UNAVAILABLE', 'No hay un lote que se pueda deshacer.', array( 'status' => 409 ) );
		}
		$until = isset( $stored['undoUntil'] ) ? strtotime( (string) $stored['undoUntil'] ) : 0;
		if ( $until < time() ) {
			return new \WP_Error( 'UNDO_EXPIRED', 'El plazo de 7 días ya pasó.', array( 'status' => 409 ) );
		}

		global $wpdb;
		$table = self::table_name();
		$rows  = $wpdb->get_results(
			$wpdb->prepare( "SELECT id, kind, payload FROM {$table} WHERE batch_id = %s ORDER BY id ASC", $batch_id ),
			ARRAY_A
		);
		if ( ! is_array( $rows ) || array() === $rows ) {
			return new \WP_Error( 'UNDO_UNAVAILABLE', 'No hay un lote que se pueda deshacer.', array( 'status' => 409 ) );
		}

		$wpdb->query( 'START TRANSACTION' );
		try {
			foreach ( $rows as $row ) {
				$payload = json_decode( (string) $row['payload'], true );
				if ( ! is_array( $payload ) ) {
					throw new \RuntimeException( 'payload' );
				}
				$kind = (string) $row['kind'];
				if ( 'revision' === $kind ) {
					self::restore_post( $payload );
				} elseif ( 'transient' === $kind ) {
					self::restore_options( $payload );
				} elseif ( 'spam' === $kind ) {
					self::restore_comment( $payload );
				}
			}
			$wpdb->query( $wpdb->prepare( "DELETE FROM {$table} WHERE batch_id = %s", $batch_id ) );
			if ( $wpdb->last_error ) {
				throw new \RuntimeException( $wpdb->last_error );
			}
			$wpdb->query( 'COMMIT' );
		} catch ( \Throwable $error ) {
			$wpdb->query( 'ROLLBACK' );
			return new \WP_Error( 'UNDO_FAILED', 'No pudimos deshacer la limpieza.', array( 'status' => 500 ) );
		}

		delete_option( 'cuidado_conector_last_batch' );
		return new \WP_REST_Response( array( 'undone' => true, 'batchId' => $batch_id ), 200 );
	}

	/**
	 * @return int
	 */
	private static function purge_revisions( string $batch_id ): int {
		global $wpdb;
		$cutoff = gmdate( 'Y-m-d H:i:s', time() - 30 * DAY_IN_SECONDS );
		$ids    = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT ranked.ID
				FROM (
					SELECT ID, post_modified_gmt, ROW_NUMBER() OVER (PARTITION BY post_parent ORDER BY post_modified_gmt DESC, ID DESC) AS rn
					FROM {$wpdb->posts}
					WHERE post_type = 'revision'
				) ranked
				WHERE ranked.rn > 5 AND ranked.post_modified_gmt < %s
				LIMIT %d",
				$cutoff,
				MAX_ROWS
			)
		);
		if ( ! is_array( $ids ) || array() === $ids ) {
			return 0;
		}
		$deleted = 0;
		foreach ( $ids as $id ) {
			$post = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$wpdb->posts} WHERE ID = %d", (int) $id ), ARRAY_A );
			if ( ! is_array( $post ) ) {
				continue;
			}
			self::store_row( $batch_id, 'revision', $post );
			$wpdb->delete( $wpdb->posts, array( 'ID' => (int) $id ), array( '%d' ) );
			++$deleted;
		}
		return $deleted;
	}

	/**
	 * @return int
	 */
	private static function purge_transients( string $batch_id ): int {
		global $wpdb;
		$timeout = $wpdb->esc_like( '_transient_timeout_' ) . '%';
		$wc      = $wpdb->esc_like( '_transient_timeout_wc_session_' ) . '%';
		$as      = $wpdb->esc_like( '_transient_timeout_action_scheduler_' ) . '%';
		$rows    = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT option_id, option_name, option_value, autoload FROM {$wpdb->options}
				WHERE option_name LIKE %s AND option_name NOT LIKE %s AND option_name NOT LIKE %s
				AND option_value+0 > 0 AND option_value+0 < %d
				LIMIT %d",
				$timeout,
				$wc,
				$as,
				time(),
				MAX_ROWS
			),
			ARRAY_A
		);
		if ( ! is_array( $rows ) || array() === $rows ) {
			return 0;
		}
		$deleted = 0;
		foreach ( $rows as $timeout_row ) {
			$data_name = str_replace( '_transient_timeout_', '_transient_', (string) $timeout_row['option_name'] );
			$data_row  = $wpdb->get_row(
				$wpdb->prepare(
					"SELECT option_id, option_name, option_value, autoload FROM {$wpdb->options} WHERE option_name = %s",
					$data_name
				),
				ARRAY_A
			);
			self::store_row(
				$batch_id,
				'transient',
				array(
					'timeout' => $timeout_row,
					'data'    => is_array( $data_row ) ? $data_row : null,
				)
			);
			$wpdb->delete( $wpdb->options, array( 'option_id' => (int) $timeout_row['option_id'] ), array( '%d' ) );
			if ( is_array( $data_row ) ) {
				$wpdb->delete( $wpdb->options, array( 'option_id' => (int) $data_row['option_id'] ), array( '%d' ) );
			}
			++$deleted;
		}
		return $deleted;
	}

	/**
	 * @return int
	 */
	private static function purge_spam( string $batch_id ): int {
		global $wpdb;
		$cutoff = gmdate( 'Y-m-d H:i:s', time() - 30 * DAY_IN_SECONDS );
		$rows   = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM {$wpdb->comments}
				WHERE comment_approved = 'spam' AND comment_date_gmt < %s
				LIMIT %d",
				$cutoff,
				MAX_ROWS
			),
			ARRAY_A
		);
		if ( ! is_array( $rows ) || array() === $rows ) {
			return 0;
		}
		$deleted = 0;
		foreach ( $rows as $comment ) {
			self::store_row( $batch_id, 'spam', $comment );
			$wpdb->delete( $wpdb->comments, array( 'comment_ID' => (int) $comment['comment_ID'] ), array( '%d' ) );
			++$deleted;
		}
		return $deleted;
	}

	/**
	 * @param array<string,mixed> $payload
	 */
	private static function store_row( string $batch_id, string $kind, array $payload ): void {
		global $wpdb;
		$wpdb->insert(
			self::table_name(),
			array(
				'batch_id'    => $batch_id,
				'kind'        => $kind,
				'payload'     => wp_json_encode( $payload ),
				'created_gmt' => gmdate( 'Y-m-d H:i:s' ),
			),
			array( '%s', '%s', '%s', '%s' )
		);
	}

	/**
	 * @param array<string,mixed> $post
	 */
	private static function restore_post( array $post ): void {
		global $wpdb;
		$wpdb->insert( $wpdb->posts, $post );
	}

	/**
	 * @param array<string,mixed> $payload
	 */
	private static function restore_options( array $payload ): void {
		global $wpdb;
		if ( isset( $payload['timeout'] ) && is_array( $payload['timeout'] ) ) {
			$row = $payload['timeout'];
			unset( $row['option_id'] );
			$wpdb->insert( $wpdb->options, $row );
		}
		if ( isset( $payload['data'] ) && is_array( $payload['data'] ) ) {
			$row = $payload['data'];
			unset( $row['option_id'] );
			$wpdb->insert( $wpdb->options, $row );
		}
	}

	/**
	 * @param array<string,mixed> $comment
	 */
	private static function restore_comment( array $comment ): void {
		global $wpdb;
		$wpdb->insert( $wpdb->comments, $comment );
	}

	private static function table_name(): string {
		global $wpdb;
		return $wpdb->prefix . 'cuidado_undo';
	}

	private static function uuid(): string {
		$data = random_bytes( 16 );
		$data[6] = chr( ( ord( $data[6] ) & 0x0f ) | 0x40 );
		$data[8] = chr( ( ord( $data[8] ) & 0x3f ) | 0x80 );
		return vsprintf( '%s%s-%s-%s-%s-%s%s%s', str_split( bin2hex( $data ), 4 ) );
	}
}
