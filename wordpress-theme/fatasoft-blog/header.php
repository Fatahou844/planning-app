<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="profile" href="https://gmpg.org/xfn/11">
  <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<div id="reading-progress" role="progressbar" aria-label="<?php esc_attr_e('Progression de lecture', 'fatasoft-blog'); ?>"></div>

<div class="site-wrapper">

  <!-- ===== HEADER ===== -->
  <header id="site-header" class="site-header" role="banner">
    <div class="container">

      <!-- Branding -->
      <div class="site-branding">
        <?php if (has_custom_logo()): ?>
          <div class="site-logo"><?php the_custom_logo(); ?></div>
        <?php else: ?>
          <a href="<?php echo esc_url(home_url('/')); ?>" class="site-title" rel="home">
            <?php
              $blog_name = get_bloginfo('name');
              $parts     = explode(' ', trim($blog_name), 2);
              echo esc_html($parts[0]);
              if (!empty($parts[1])) {
                  echo ' <span>' . esc_html($parts[1]) . '</span>';
              }
            ?>
          </a>
        <?php endif; ?>

        <?php
          $tagline = get_bloginfo('description', 'display');
          if ($tagline && is_front_page()):
        ?>
          <div class="site-description"><?php echo esc_html($tagline); ?></div>
        <?php endif; ?>
      </div>

      <!-- Navigation principale -->
      <nav id="site-navigation" class="primary-navigation" aria-label="<?php esc_attr_e('Navigation principale', 'fatasoft-blog'); ?>">
        <?php
          wp_nav_menu([
            'theme_location' => 'primary',
            'menu_id'        => 'primary-menu',
            'menu_class'     => 'nav-menu',
            'container'      => false,
            'fallback_cb'    => function() {
                echo '<ul class="nav-menu">';
                echo '<li><a href="' . esc_url(admin_url('nav-menus.php')) . '">' . __('Configurer le menu', 'fatasoft-blog') . '</a></li>';
                echo '</ul>';
            },
          ]);
        ?>
      </nav>

      <!-- Actions header -->
      <div class="header-actions">

        <!-- Recherche -->
        <div class="header-search" role="search">
          <label for="header-search-input" class="sr-only"><?php _e('Rechercher', 'fatasoft-blog'); ?></label>
          <span class="search-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </span>
          <form role="search" method="get" action="<?php echo esc_url(home_url('/')); ?>">
            <input
              type="search"
              id="header-search-input"
              placeholder="<?php esc_attr_e('Rechercher…', 'fatasoft-blog'); ?>"
              value="<?php echo get_search_query(); ?>"
              name="s"
              autocomplete="off"
            >
          </form>
        </div>

        <!-- Bouton dark/light mode -->
        <button
          class="theme-toggle"
          id="theme-toggle"
          aria-label="<?php esc_attr_e('Basculer le thème', 'fatasoft-blog'); ?>"
          title="<?php esc_attr_e('Basculer entre mode sombre et clair', 'fatasoft-blog'); ?>"
        >
          <!-- Icône lune (dark mode actif) -->
          <svg class="icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
          </svg>
          <!-- Icône soleil (light mode actif) -->
          <svg class="icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style="display:none">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        </button>

        <!-- Mobile menu toggle -->
        <button
          class="menu-toggle"
          id="menu-toggle"
          aria-controls="site-navigation"
          aria-expanded="false"
          aria-label="<?php esc_attr_e('Ouvrir le menu', 'fatasoft-blog'); ?>"
        >
          <svg class="icon-menu" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <line x1="3" y1="6"  x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
          <svg class="icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style="display:none">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

      </div><!-- .header-actions -->
    </div><!-- .container -->
  </header><!-- #site-header -->

  <!-- ===== MAIN CONTENT ===== -->
  <main id="site-main" class="site-main" role="main">
    <div class="container">
