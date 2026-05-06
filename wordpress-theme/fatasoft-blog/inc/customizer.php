<?php
/**
 * Fatasoft Blog — Customizer WordPress
 * Options de personnalisation du thème depuis Apparence > Personnaliser
 * @package fatasoft-blog
 */

defined('ABSPATH') || exit;

function fatasoft_customize_register(WP_Customize_Manager $wp_customize): void {

    // -------------------------------------------------------
    // Section : Identité du blog
    // -------------------------------------------------------
    $wp_customize->add_section('fatasoft_identity', [
        'title'    => __('Identité Fatasoft Blog', 'fatasoft-blog'),
        'priority' => 25,
    ]);

    // Tagline sous le logo
    $wp_customize->add_setting('fatasoft_show_tagline', [
        'default'           => true,
        'sanitize_callback' => 'rest_sanitize_boolean',
        'transport'         => 'refresh',
    ]);
    $wp_customize->add_control('fatasoft_show_tagline', [
        'label'   => __('Afficher la description du site dans l\'en-tête', 'fatasoft-blog'),
        'section' => 'fatasoft_identity',
        'type'    => 'checkbox',
    ]);

    // -------------------------------------------------------
    // Section : Couleurs
    // -------------------------------------------------------
    $wp_customize->add_section('fatasoft_colors', [
        'title'    => __('Couleurs du thème', 'fatasoft-blog'),
        'priority' => 30,
    ]);

    $color_settings = [
        'fatasoft_color_primary'   => ['default' => '#4F46E5', 'label' => __('Couleur primaire (indigo)', 'fatasoft-blog')],
        'fatasoft_color_bg_dark'   => ['default' => '#0F172A', 'label' => __('Fond sombre', 'fatasoft-blog')],
        'fatasoft_color_paper_dark'=> ['default' => '#1E293B', 'label' => __('Fond carte (sombre)', 'fatasoft-blog')],
    ];

    foreach ($color_settings as $key => $args) {
        $wp_customize->add_setting($key, [
            'default'           => $args['default'],
            'sanitize_callback' => 'sanitize_hex_color',
            'transport'         => 'postMessage',
        ]);
        $wp_customize->add_control(new WP_Customize_Color_Control($wp_customize, $key, [
            'label'   => $args['label'],
            'section' => 'fatasoft_colors',
        ]));
    }

    // -------------------------------------------------------
    // Section : Blog
    // -------------------------------------------------------
    $wp_customize->add_section('fatasoft_blog', [
        'title'    => __('Réglages du blog', 'fatasoft-blog'),
        'priority' => 40,
    ]);

    // Nombre d'articles par page
    $wp_customize->add_setting('fatasoft_posts_per_page', [
        'default'           => 9,
        'sanitize_callback' => 'absint',
        'transport'         => 'refresh',
    ]);
    $wp_customize->add_control('fatasoft_posts_per_page', [
        'label'       => __('Articles par page', 'fatasoft-blog'),
        'section'     => 'fatasoft_blog',
        'type'        => 'number',
        'input_attrs' => ['min' => 1, 'max' => 50, 'step' => 1],
    ]);

    // Afficher l'article vedette (featured)
    $wp_customize->add_setting('fatasoft_featured_first', [
        'default'           => true,
        'sanitize_callback' => 'rest_sanitize_boolean',
        'transport'         => 'refresh',
    ]);
    $wp_customize->add_control('fatasoft_featured_first', [
        'label'   => __('Afficher le premier article en grand format', 'fatasoft-blog'),
        'section' => 'fatasoft_blog',
        'type'    => 'checkbox',
    ]);

    // Sidebar activée
    $wp_customize->add_setting('fatasoft_sidebar_position', [
        'default'           => 'right',
        'sanitize_callback' => fn($v) => in_array($v, ['right', 'none'], true) ? $v : 'right',
        'transport'         => 'refresh',
    ]);
    $wp_customize->add_control('fatasoft_sidebar_position', [
        'label'   => __('Position de la barre latérale', 'fatasoft-blog'),
        'section' => 'fatasoft_blog',
        'type'    => 'select',
        'choices' => [
            'right' => __('Droite', 'fatasoft-blog'),
            'none'  => __('Aucune', 'fatasoft-blog'),
        ],
    ]);

    // -------------------------------------------------------
    // Section : Footer
    // -------------------------------------------------------
    $wp_customize->add_section('fatasoft_footer', [
        'title'    => __('Pied de page', 'fatasoft-blog'),
        'priority' => 50,
    ]);

    $wp_customize->add_setting('fatasoft_footer_copyright', [
        'default'           => '',
        'sanitize_callback' => 'wp_kses_post',
        'transport'         => 'postMessage',
    ]);
    $wp_customize->add_control('fatasoft_footer_copyright', [
        'label'       => __('Texte personnalisé du copyright', 'fatasoft-blog'),
        'description' => __('Laissez vide pour utiliser le texte par défaut.', 'fatasoft-blog'),
        'section'     => 'fatasoft_footer',
        'type'        => 'textarea',
    ]);

    // -------------------------------------------------------
    // CSS inline généré depuis les settings Customizer
    // -------------------------------------------------------
    $wp_customize->add_setting('fatasoft_custom_css_vars', [
        'default'           => '',
        'sanitize_callback' => 'wp_strip_all_tags',
        'transport'         => 'postMessage',
    ]);
}
add_action('customize_register', 'fatasoft_customize_register');

/**
 * Injecter les CSS variables custom en tête de page.
 */
function fatasoft_customizer_css(): void {
    $primary    = get_theme_mod('fatasoft_color_primary',    '#4F46E5');
    $bg_dark    = get_theme_mod('fatasoft_color_bg_dark',    '#0F172A');
    $paper_dark = get_theme_mod('fatasoft_color_paper_dark', '#1E293B');

    if (
        $primary    === '#4F46E5' &&
        $bg_dark    === '#0F172A' &&
        $paper_dark === '#1E293B'
    ) {
        return; // Valeurs par défaut, pas besoin d'injecter
    }

    printf(
        '<style id="fatasoft-customizer-css">:root{--color-primary:%s;--bg:%s;--bg-paper:%s;}</style>',
        esc_attr(sanitize_hex_color($primary)),
        esc_attr(sanitize_hex_color($bg_dark)),
        esc_attr(sanitize_hex_color($paper_dark))
    );
}
add_action('wp_head', 'fatasoft_customizer_css');

/**
 * Aperçu live dans le Customizer (postMessage).
 */
function fatasoft_customize_preview_js(): void {
    wp_enqueue_script(
        'fatasoft-customizer-preview',
        FATASOFT_URI . '/assets/js/customizer-preview.js',
        ['customize-preview'],
        FATASOFT_VERSION,
        true
    );
}
add_action('customize_preview_init', 'fatasoft_customize_preview_js');
