<?php
/**
 * Plugin Name: Cuidado Conector
 * Description: Conecta el sitio con Cuidado. Lee el estado y no modifica el tema, los plugins ni wp-config.php.
 * Version: 0.1.0
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

	$code = '';
	if ( isset( $_POST['cuidado_conector_pair'] ) ) {
		check_admin_referer( 'cuidado_conector_pair' );
		$code = bin2hex( random_bytes( 16 ) );
		update_option( 'cuidado_conector_pair_hash', hash( 'sha256', $code ), false );
		update_option( 'cuidado_conector_pair_expires', time() + PAIR_TTL_SECONDS, false );
	}

	echo '<div class="wrap">';
	echo '<h1>Cuidado Conector</h1>';
	echo '<p>Este conector solo lee el sitio. No cambia el tema ni archivos PHP.</p>';
	echo '<form method="post">';
	wp_nonce_field( 'cuidado_conector_pair' );
	submit_button( 'Generar código de 10 minutos', 'primary', 'cuidado_conector_pair' );
	echo '</form>';
	if ( '' !== $code ) {
		echo '<p><strong>Código:</strong> <code>' . esc_html( $code ) . '</code></p>';
		echo '<p>Pégalo en cuidadoweb.com antes de 10 minutos. No se vuelve a mostrar.</p>';
	}
	echo '</div>';
}

register_activation_hook( __FILE__, __NAMESPACE__ . '\\activate' );
register_deactivation_hook( __FILE__, __NAMESPACE__ . '\\deactivate' );
