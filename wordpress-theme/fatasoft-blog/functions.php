<?php
/**
 * ZPGarage Blog — functions.php
 * Configuration principale du thème WordPress
 * Plateforme : ZPGarage by ZP Digital
 */

defined('ABSPATH') || exit;

// -------------------------------------------------------
// Constantes
// -------------------------------------------------------
define('FATASOFT_VERSION', '1.0.0');
define('FATASOFT_DIR',     get_template_directory());
define('FATASOFT_URI',     get_template_directory_uri());

// -------------------------------------------------------
// Setup du thème
// -------------------------------------------------------
function fatasoft_setup() {
    load_theme_textdomain('fatasoft-blog', FATASOFT_DIR . '/languages');

    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('automatic-feed-links');
    add_theme_support('html5', [
        'comment-form', 'comment-list', 'gallery',
        'caption', 'style', 'script', 'navigation-widgets',
    ]);
    add_theme_support('custom-logo', [
        'height'      => 72,
        'width'       => 200,
        'flex-height' => true,
        'flex-width'  => true,
    ]);
    add_theme_support('customize-selective-refresh-widgets');
    add_theme_support('responsive-embeds');
    add_theme_support('wp-block-styles');
    add_theme_support('editor-styles');
    add_editor_style('assets/css/editor-style.css');

    // Tailles d'images personnalisées
    set_post_thumbnail_size(1200, 630, true);
    add_image_size('fatasoft-card',    640, 360, true);
    add_image_size('fatasoft-related', 400, 225, true);
    add_image_size('fatasoft-hero',    1600, 700, true);

    // Menus de navigation
    register_nav_menus([
        'primary'   => __('Menu principal', 'fatasoft-blog'),
        'footer-1'  => __('Footer — Produit', 'fatasoft-blog'),
        'footer-2'  => __('Footer — Ressources', 'fatasoft-blog'),
        'footer-3'  => __('Footer — Entreprise', 'fatasoft-blog'),
        'social'    => __('Réseaux sociaux', 'fatasoft-blog'),
    ]);
}
add_action('after_setup_theme', 'fatasoft_setup');

// -------------------------------------------------------
// Content width
// -------------------------------------------------------
function fatasoft_content_width() {
    $GLOBALS['content_width'] = 860;
}
add_action('after_setup_theme', 'fatasoft_content_width', 0);

// -------------------------------------------------------
// Enqueue scripts & styles
// -------------------------------------------------------
function fatasoft_scripts() {
    // Google Fonts — Inter
    wp_enqueue_style(
        'fatasoft-google-fonts',
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap',
        [],
        null
    );

    // Style principal du thème
    wp_enqueue_style(
        'fatasoft-style',
        get_stylesheet_uri(),
        ['fatasoft-google-fonts'],
        FATASOFT_VERSION
    );

    // JS principal
    wp_enqueue_script(
        'fatasoft-main',
        FATASOFT_URI . '/assets/js/main.js',
        [],
        FATASOFT_VERSION,
        true
    );

    // Commentaires
    if (is_singular() && comments_open() && get_option('thread_comments')) {
        wp_enqueue_script('comment-reply');
    }

    // Variables JS passées au front-end
    wp_localize_script('fatasoft-main', 'fatasoftData', [
        'ajaxUrl'  => admin_url('admin-ajax.php'),
        'nonce'    => wp_create_nonce('fatasoft_nonce'),
        'themeUri' => FATASOFT_URI,
        'strings'  => [
            'readMore'    => __('Lire la suite', 'fatasoft-blog'),
            'darkMode'    => __('Mode sombre', 'fatasoft-blog'),
            'lightMode'   => __('Mode clair', 'fatasoft-blog'),
            'menuOpen'    => __('Ouvrir le menu', 'fatasoft-blog'),
            'menuClose'   => __('Fermer le menu', 'fatasoft-blog'),
            'backToTop'   => __('Retour en haut', 'fatasoft-blog'),
        ],
    ]);
}
add_action('wp_enqueue_scripts', 'fatasoft_scripts');

// -------------------------------------------------------
// Widgets / Sidebars
// -------------------------------------------------------
function fatasoft_widgets_init() {
    $defaults = [
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ];

    register_sidebar(array_merge($defaults, [
        'name' => __('Barre latérale du blog', 'fatasoft-blog'),
        'id'   => 'sidebar-blog',
        'description' => __('Widgets affichés dans la barre latérale du blog.', 'fatasoft-blog'),
    ]));

    register_sidebar(array_merge($defaults, [
        'name' => __('Barre latérale des articles', 'fatasoft-blog'),
        'id'   => 'sidebar-single',
        'description' => __('Widgets affichés dans la barre latérale des articles individuels.', 'fatasoft-blog'),
    ]));

    register_sidebar(array_merge($defaults, [
        'name' => __('Footer — Colonne 1', 'fatasoft-blog'),
        'id'   => 'footer-1',
    ]));
    register_sidebar(array_merge($defaults, [
        'name' => __('Footer — Colonne 2', 'fatasoft-blog'),
        'id'   => 'footer-2',
    ]));
    register_sidebar(array_merge($defaults, [
        'name' => __('Footer — Colonne 3', 'fatasoft-blog'),
        'id'   => 'footer-3',
    ]));
}
add_action('widgets_init', 'fatasoft_widgets_init');

// -------------------------------------------------------
// Helpers de template
// -------------------------------------------------------

/**
 * Affiche l'image mise en avant avec fallback placeholder SVG.
 */
function fatasoft_post_thumbnail(string $size = 'fatasoft-card', array $attr = []): void {
    if (has_post_thumbnail()) {
        the_post_thumbnail($size, array_merge(['loading' => 'lazy'], $attr));
    } else {
        echo '<div class="post-card-thumb-placeholder">';
        echo '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">';
        echo '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>';
        echo '</svg>';
        echo '</div>';
    }
}

/**
 * Retourne le temps de lecture estimé d'un article.
 */
function fatasoft_reading_time(): string {
    $content    = get_post_field('post_content', get_the_ID());
    $word_count = str_word_count(strip_tags($content));
    $minutes    = (int) ceil($word_count / 200);
    /* translators: %d = number of minutes */
    return sprintf(_n('%d min de lecture', '%d min de lecture', $minutes, 'fatasoft-blog'), $minutes);
}

/**
 * Affiche les catégories d'un article sous forme de badges.
 */
function fatasoft_post_categories(): void {
    $categories = get_the_category();
    if (empty($categories)) return;

    echo '<div class="post-categories">';
    foreach (array_slice($categories, 0, 2) as $cat) {
        printf(
            '<a href="%s" class="post-category">%s</a>',
            esc_url(get_category_link($cat->term_id)),
            esc_html($cat->name)
        );
    }
    echo '</div>';
}

/**
 * Affiche les tags d'un article.
 */
function fatasoft_post_tags(): void {
    $tags = get_the_tags();
    if (!$tags) return;

    echo '<div class="post-tags">';
    foreach ($tags as $tag) {
        printf(
            '<a href="%s" class="post-tag">#%s</a>',
            esc_url(get_tag_link($tag->term_id)),
            esc_html($tag->name)
        );
    }
    echo '</div>';
}

/**
 * Retourne le nombre de commentaires formaté.
 */
function fatasoft_comments_count(): string {
    $count = (int) get_comments_number();
    if ($count === 0) return __('Aucun commentaire', 'fatasoft-blog');
    return sprintf(_n('%d commentaire', '%d commentaires', $count, 'fatasoft-blog'), $count);
}

/**
 * Affiche les articles connexes (même catégorie).
 */
function fatasoft_related_posts(int $count = 3): void {
    $categories = wp_get_post_categories(get_the_ID());
    if (empty($categories)) return;

    $related = new WP_Query([
        'category__in'        => $categories,
        'post__not_in'        => [get_the_ID()],
        'posts_per_page'      => $count,
        'ignore_sticky_posts' => 1,
    ]);

    if (!$related->have_posts()) return;

    echo '<section class="related-posts">';
    echo '<h2 class="related-posts-title">' . __('Articles connexes', 'fatasoft-blog') . '</h2>';
    echo '<div class="related-posts-grid">';

    while ($related->have_posts()) {
        $related->the_post();
        get_template_part('template-parts/content', 'card');
    }

    echo '</div></section>';
    wp_reset_postdata();
}

// -------------------------------------------------------
// Excerpt length & more
// -------------------------------------------------------
add_filter('excerpt_length', fn() => 22, 999);
add_filter('excerpt_more',   fn() => '…');

// -------------------------------------------------------
// Modification du titre du document
// -------------------------------------------------------
add_filter('document_title_separator', fn() => '·');

// -------------------------------------------------------
// Body classes utiles
// -------------------------------------------------------
function fatasoft_body_classes(array $classes): array {
    if (!is_singular()) {
        $classes[] = 'is-archive';
    }
    if (is_active_sidebar('sidebar-blog') || is_active_sidebar('sidebar-single')) {
        $classes[] = 'has-sidebar';
    }
    return $classes;
}
add_filter('body_class', 'fatasoft_body_classes');

// -------------------------------------------------------
// Breadcrumbs simple (sans plugin)
// -------------------------------------------------------
function fatasoft_breadcrumbs(): void {
    if (is_front_page()) return;

    $sep = '<span class="breadcrumb-sep" aria-hidden="true">›</span>';
    echo '<nav class="breadcrumbs" aria-label="' . esc_attr__('Fil d\'Ariane', 'fatasoft-blog') . '">';
    echo '<ol class="breadcrumb-list">';
    echo '<li><a href="' . home_url('/') . '">' . __('Accueil', 'fatasoft-blog') . '</a></li>';

    if (is_singular('post')) {
        $cats = get_the_category();
        if ($cats) {
            echo '<li>' . $sep . '<a href="' . get_category_link($cats[0]->term_id) . '">' . esc_html($cats[0]->name) . '</a></li>';
        }
        echo '<li>' . $sep . '<span aria-current="page">' . get_the_title() . '</span></li>';
    } elseif (is_category()) {
        echo '<li>' . $sep . '<span aria-current="page">' . single_cat_title('', false) . '</span></li>';
    } elseif (is_tag()) {
        echo '<li>' . $sep . '<span aria-current="page">#' . single_tag_title('', false) . '</span></li>';
    } elseif (is_search()) {
        echo '<li>' . $sep . '<span aria-current="page">' . sprintf(__('Résultats pour « %s »', 'fatasoft-blog'), get_search_query()) . '</span></li>';
    } elseif (is_page()) {
        echo '<li>' . $sep . '<span aria-current="page">' . get_the_title() . '</span></li>';
    }

    echo '</ol></nav>';
}

// -------------------------------------------------------
// Open Graph / SEO de base (si pas de plugin SEO actif)
// -------------------------------------------------------
function fatasoft_open_graph(): void {
    if (function_exists('yoast_breadcrumb') || defined('WPSEO_VERSION') || class_exists('RankMath')) {
        return; // Plugin SEO présent, on laisse faire
    }

    $site_name   = 'ZPGarage · Blog';
    $title       = is_singular() ? get_the_title() : wp_title('', false);
    $description = is_singular()
        ? wp_trim_words(strip_tags(get_the_excerpt()), 28, '…')
        : __('Guides pratiques, conseils de gestion et retours terrain pour les professionnels de l\'automobile.', 'fatasoft-blog');
    $image       = '';

    if (is_singular() && has_post_thumbnail()) {
        $thumb = wp_get_attachment_image_src(get_post_thumbnail_id(), 'fatasoft-card');
        $image = $thumb ? $thumb[0] : '';
    }

    echo '<meta property="og:site_name" content="' . esc_attr($site_name) . '">' . "\n";
    echo '<meta property="og:type" content="' . (is_singular('post') ? 'article' : 'website') . '">' . "\n";
    echo '<meta property="og:title" content="' . esc_attr($title) . '">' . "\n";
    echo '<meta property="og:description" content="' . esc_attr($description) . '">' . "\n";
    echo '<meta property="og:url" content="' . esc_url(get_permalink()) . '">' . "\n";
    if ($image) {
        echo '<meta property="og:image" content="' . esc_url($image) . '">' . "\n";
        echo '<meta property="og:image:width" content="640">' . "\n";
        echo '<meta property="og:image:height" content="360">' . "\n";
    }
    echo '<meta name="twitter:card" content="summary_large_image">' . "\n";
    echo '<meta name="twitter:title" content="' . esc_attr($title) . '">' . "\n";
    echo '<meta name="twitter:description" content="' . esc_attr($description) . '">' . "\n";
    if ($image) {
        echo '<meta name="twitter:image" content="' . esc_url($image) . '">' . "\n";
    }
    // Meta description standard
    echo '<meta name="description" content="' . esc_attr($description) . '">' . "\n";
}
add_action('wp_head', 'fatasoft_open_graph');

// -------------------------------------------------------
// Données statiques de la plateforme ZPGarage
// (centralisées ici pour faciliter les mises à jour)
// -------------------------------------------------------
function zpgarage_platform_data(): array {
    return [
        'name'        => 'ZPGarage',
        'company'     => 'ZP Digital',
        'tagline'     => __('Gérez votre garage. On s\'occupe du reste.', 'fatasoft-blog'),
        'description' => __('La plateforme tout-en-un pour les garages modernes. Planning, devis, facturation, stock et gestion clients — dans un seul outil.', 'fatasoft-blog'),
        'url_trial'   => home_url('/essai-gratuit'),
        'url_demo'    => home_url('/demo'),
        'url_pricing' => home_url('/tarifs'),
        'url_app'     => 'https://app.zpgarage.com',
        'stats' => [
            ['value' => '500+', 'label' => __('Garages actifs', 'fatasoft-blog')],
            ['value' => '98%',  'label' => __('Satisfaction client', 'fatasoft-blog')],
            ['value' => '40%',  'label' => __('Gain de temps moyen', 'fatasoft-blog')],
            ['value' => '24/7', 'label' => __('Disponibilité', 'fatasoft-blog')],
        ],
        'plans' => [
            ['name' => 'Démarrage', 'price' => __('Gratuit', 'fatasoft-blog'), 'popular' => false],
            ['name' => 'Garage Pro', 'price' => '29 € / mois HT', 'popular' => true],
            ['name' => 'Multi-postes', 'price' => '59 € / mois HT', 'popular' => false],
        ],
    ];
}

// -------------------------------------------------------
// Inclure les modules supplémentaires
// -------------------------------------------------------
require_once FATASOFT_DIR . '/inc/customizer.php';
