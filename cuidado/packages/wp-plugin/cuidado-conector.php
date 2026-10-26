<?php
/**
 * Plugin Name: Cuidado Conector
 * Description: Conecta el sitio con Cuidado. Lee el estado y no modifica el tema, los plugins ni wp-config.php.
 * Version: 0.2.0
 * Requires at least: 6.1
 * Requires PHP: 8.0
 * Author: Cuidado
 * License: GPLv2 or later
 * Text Domain: cuidado-conector
 *
 * @package CuidadoConector
 */

namespace CuidadoConector;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/includes/class-rest.php';

const PAIR_TTL_SECONDS = 600;
const MAX_ROWS          = 2000;
const MAX_BYTES         = 33554432;
const CARE_APP_URL      = 'https://cuidadoweb.com';

/**
 * @param bool $network_wide Whether the plugin is being network-activated.
 */
function activate( bool $network_wide ): void {
	if ( is_multisite() && $network_wide ) {
		update_site_option( 'cuidado_conector_network_active', '1' );
	}
}

function deactivate(): void {
}

add_action(
	'plugins_loaded',
	static function (): void {
		Rest::register();
	}
);

add_action(
	'admin_menu',
	static function (): void {
		add_options_page(
			'Cuidado Conector',
			'Cuidado Conector',
			'manage_options',
			'cuidado-conector',
			__NAMESPACE__ . '\\render_settings'
		);
	}
);

add_action(
	'admin_notices',
	static function (): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		if ( get_option( 'cuidado_conector_secret_hash' ) ) {
			return;
		}
		echo '<div class="notice notice-info"><p>Cuidado Conector está listo. Genera un código en Ajustes → Cuidado Conector.</p></div>';
	}
);

function render_settings(): void {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	$code    = '';
	$message = '';
	if ( isset( $_POST['cuidado_conector_pair'] ) ) {
		check_admin_referer( 'cuidado_conector_pair' );
		$code = bin2hex( random_bytes( 16 ) );
		update_option( 'cuidado_conector_pair_hash', hash( 'sha256', $code ), false );
		update_option( 'cuidado_conector_pair_expires', time() + PAIR_TTL_SECONDS, false );
		update_option( 'cuidado_conector_pair_code', $code, false );
	}

	if ( isset( $_POST['cuidado_conector_complete'] ) ) {
		check_admin_referer( 'cuidado_conector_complete' );
		$message = complete_outbound_pair();
	}

	$connected = (string) get_option( 'cuidado_conector_secret_hash', '' ) !== '';

	echo '<div class="wrap">';
	echo '<h1>Cuidado Conector</h1>';
	echo '<p>Este conector solo lee el sitio. No cambia el tema ni archivos PHP.</p>';
	if ( $connected ) {
		echo '<div class="notice notice-success"><p>El sitio ya está conectado con CuidadoWeb.</p></div>';
	}
	if ( '' !== $message ) {
		echo '<div class="notice notice-info"><p>' . esc_html( $message ) . '</p></div>';
	}

	echo '<h2>1. Generar código</h2>';
	echo '<form method="post">';
	wp_nonce_field( 'cuidado_conector_pair' );
	submit_button( 'Generar código de 10 minutos', 'primary', 'cuidado_conector_pair' );
	echo '</form>';
	if ( '' !== $code ) {
		echo '<p><strong>Código:</strong> <code>' . esc_html( $code ) . '</code></p>';
		echo '<p>Pégalo en cuidadoweb.com antes de 10 minutos. No se vuelve a mostrar.</p>';
	}

	echo '<h2>2. Completar conexión</h2>';
	echo '<p>Si cuidadoweb.com te pide completar aquí porque el hosting muestra una pantalla de espera, pulsa este botón después de pegar el código allí.</p>';
	echo '<form method="post">';
	wp_nonce_field( 'cuidado_conector_complete' );
	submit_button( 'Completar conexión', 'secondary', 'cuidado_conector_complete' );
	echo '</form>';
	echo '</div>';
}

function complete_outbound_pair(): string {
	$code = (string) get_option( 'cuidado_conector_pair_code', '' );
	$hash = (string) get_option( 'cuidado_conector_pair_hash', '' );
	$expires = (int) get_option( 'cuidado_conector_pair_expires', 0 );
	if ( '' === $code || '' === $hash || $expires < time() ) {
		return 'Genera un código nuevo y pégalo primero en cuidadoweb.com.';
	}
	if ( ! hash_equals( $hash, hash( 'sha256', $code ) ) ) {
		return 'El código guardado no sirve. Genera otro.';
	}

	$response = wp_remote_post(
		CARE_APP_URL . '/api/pair/complete',
		array(
			'timeout' => 20,
			'headers' => array( 'content-type' => 'application/json' ),
			'body'    => wp_json_encode(
				array(
					'homeUrl' => home_url(),
					'code'    => $code,
				)
			),
		)
	);
	if ( is_wp_error( $response ) ) {
		return 'No pudimos hablar con cuidadoweb.com. Reintenta en un minuto.';
	}
	$status = (int) wp_remote_retrieve_response_code( $response );
	$body   = json_decode( (string) wp_remote_retrieve_body( $response ), true );
	if ( 200 !== $status || ! is_array( $body ) || empty( $body['secret'] ) || empty( $body['siteId'] ) ) {
		return 'El código no sirve o ya venció. Genera otro y pégalo otra vez en cuidadoweb.com.';
	}

	$secret  = (string) $body['secret'];
	$site_id = (string) $body['siteId'];
	$base    = isset( $body['baseUrl'] ) ? (string) $body['baseUrl'] : home_url();
	update_option( 'cuidado_conector_secret_hash', hash( 'sha256', $secret ), false );
	update_option( 'cuidado_conector_site_id', $site_id, false );
	delete_option( 'cuidado_conector_pair_code' );
	delete_option( 'cuidado_conector_pair_hash' );
	delete_option( 'cuidado_conector_pair_expires' );

	$push = push_snapshot( $secret, $site_id, $base );
	if ( '' !== $push ) {
		return 'Conectado. ' . $push;
	}
	return 'Conectado con CuidadoWeb. La lectura de la base ya se envió.';
}

/**
 * @return string Empty on success, or a short note.
 */
function push_snapshot( string $secret, string $site_id, string $home_url ): string {
	$snapshot = Rest::snapshot_payload();
	if ( $snapshot instanceof \WP_Error ) {
		return 'El sitio quedó conectado, pero no se pudo leer la base ahora.';
	}
	$snapshot['siteId']  = $site_id;
	$snapshot['homeUrl'] = $home_url;
	$response            = wp_remote_post(
		CARE_APP_URL . '/api/connector/snapshot',
		array(
			'timeout' => 30,
			'headers' => array(
				'content-type'  => 'application/json',
				'authorization' => 'Bearer ' . $secret,
			),
			'body'    => wp_json_encode( $snapshot ),
		)
	);
	if ( is_wp_error( $response ) || 200 !== (int) wp_remote_retrieve_response_code( $response ) ) {
		return 'El sitio quedó conectado, pero no se pudo enviar la lectura de la base.';
	}
	return '';
}

register_activation_hook( __FILE__, __NAMESPACE__ . '\\activate' );
register_deactivation_hook( __FILE__, __NAMESPACE__ . '\\deactivate' );
