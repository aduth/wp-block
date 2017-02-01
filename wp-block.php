<?php

/**
 * Plugin Name: WP Block
 * Plugin URI: https://github.com/aduth/wp-block.git
 * Description: Post editor blocks support for WordPress
 * Version: 1.0.0
 * Author: Andrew Duthie
 * Author URI: http://andrewduthie.com
 * License: GPL2+
 */

/**
 * Registers block scripts to be used as dependencies in block implementations.
 */
function wp_block_register_scripts() {
	wp_register_script( 'virtual-dom', 'https://wzrd.in/standalone/virtual-dom@latest' );
	wp_register_script( 'wp-blocks', plugins_url( 'js/wp-blocks.js', __FILE__ ), array( 'virtual-dom', 'mce-view', 'underscore' ) );
	wp_localize_script( 'wp-blocks', '_wpBlocksL10n', array(
		'noDisplayError' => __( 'Must include display implementation in block options' ),
		'conflictError'  => __( 'A block with this identifier has already been registered' ),
		'noBlockError'   => __( 'Attempted to render a block which does not exist' ),
	) );
}
add_action( 'init', 'wp_block_register_scripts' );
