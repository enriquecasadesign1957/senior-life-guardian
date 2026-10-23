<?php
/**
 * Desinstalación de Cuidado Conector.
 *
 * @package CuidadoConector
 */

namespace CuidadoConector;

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

/**
 * Borra tabla, cron y opciones de un blog.
 */
function purge_blog(): void {
	global $wpdb;

	$table = $wpdb->prefix . 'cuidado_backups';
	if ( 1 === preg_match( '/^[A-Za-z0-9_]+$/', $table ) ) {
		$wpdb->query( "DROP TABLE IF EXISTS {$table}" );
	}

	unschedule( 'cuidado_conector_purge_backup' );
	unschedule( 'cuidado_conector_purge_expired_backups' );

	delete_like( $wpdb->options, 'option_name', 'cuidado_conector_' );
	delete_like( $wpdb->options, 'option_name', '_transient_cuidado_conector_' );
	delete_like( $wpdb->options, 'option_name', '_transient_timeout_cuidado_conector_' );
	delete_like( $wpdb->options, 'option_name', '_site_transient_cuidado_conector_' );
	delete_like( $wpdb->options, 'option_name', '_site_transient_timeout_cuidado_conector_' );
}

function unschedule( string $hook ): void {
	if ( function_exists( '\wp_unschedule_hook' ) ) {
		\wp_unschedule_hook( $hook );
		return;
	}

	$crons = \_get_cron_array();
	if ( ! is_array( $crons ) ) {
		return;
	}

	foreach ( $crons as $timestamp => $hooks ) {
		if ( isset( $hooks[ $hook ] ) ) {
			unset( $crons[ $timestamp ][ $hook ] );
			if ( array() === $crons[ $timestamp ] ) {
				unset( $crons[ $timestamp ] );
			}
		}
	}

	\_set_cron_array( $crons );
}

function delete_like( string $table, string $column, string $prefix ): void {
	global $wpdb;

	$allowed_tables = array( $wpdb->options, $wpdb->usermeta, $wpdb->sitemeta );
	if ( ! in_array( $table, $allowed_tables, true ) ) {
		return;
	}
	if ( ! in_array( $column, array( 'option_name', 'meta_key' ), true ) ) {
		return;
	}

	$like = $wpdb->esc_like( $prefix ) . '%';
	$wpdb->query( $wpdb->prepare( "DELETE FROM {$table} WHERE {$column} LIKE %s", $like ) );
}

function purge_network_meta(): void {
	global $wpdb;

	delete_like( $wpdb->usermeta, 'meta_key', 'cuidado_conector_' );
	if ( is_multisite() ) {
		delete_like( $wpdb->sitemeta, 'meta_key', 'cuidado_conector_' );
	}
}

function is_network_uninstall(): bool {
	if ( ! \is_multisite() ) {
		return false;
	}

	$marked             = (string) \get_site_option( 'cuidado_conector_network_active' );
	$from_network_admin = function_exists( '\is_network_admin' ) && \is_network_admin();

	return '1' === $marked || $from_network_admin;
}

global $wpdb;

if ( is_network_uninstall() ) {
	$blog_ids = $wpdb->get_col( "SELECT blog_id FROM {$wpdb->blogs}" );
	foreach ( $blog_ids as $blog_id ) {
		\switch_to_blog( (int) $blog_id );
		purge_blog();
		\restore_current_blog();
	}
	purge_network_meta();
} else {
	purge_blog();
	if ( ! \is_multisite() ) {
		purge_network_meta();
	}
}
