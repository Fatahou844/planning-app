<?php
/**
 * Template : résultats de recherche
 * @package fatasoft-blog
 */
get_header();
?>

<header class="search-header animate-fadein">
  <h1 class="page-header-title">
    <?php printf(__('Résultats pour « %s »', 'fatasoft-blog'), '<em>' . get_search_query() . '</em>'); ?>
  </h1>

  <!-- Formulaire de recherche élargi -->
  <form role="search" method="get" class="search-form-large" action="<?php echo esc_url(home_url('/')); ?>">
    <input
      type="search"
      name="s"
      placeholder="<?php esc_attr_e('Nouvelle recherche…', 'fatasoft-blog'); ?>"
      value="<?php echo get_search_query(); ?>"
      aria-label="<?php esc_attr_e('Rechercher', 'fatasoft-blog'); ?>"
    >
    <button type="submit" class="btn btn-primary">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
      </svg>
      <?php _e('Rechercher', 'fatasoft-blog'); ?>
    </button>
  </form>

  <?php if (have_posts()): ?>
    <p class="search-results-count">
      <?php printf(
        _n('%s résultat trouvé', '%s résultats trouvés', $wp_query->found_posts, 'fatasoft-blog'),
        number_format_i18n($wp_query->found_posts)
      ); ?>
    </p>
  <?php endif; ?>
</header>

<?php fatasoft_breadcrumbs(); ?>

<div class="content-area <?php echo is_active_sidebar('sidebar-blog') ? '' : 'no-sidebar'; ?>">

  <section class="posts-section">
    <?php if (have_posts()): ?>

      <div class="posts-grid">
        <?php while (have_posts()): the_post(); ?>
          <?php get_template_part('template-parts/content', 'card'); ?>
        <?php endwhile; ?>
      </div>

      <div class="pagination-wrap">
        <?php the_posts_pagination(['mid_size' => 2]); ?>
      </div>

    <?php else: ?>
      <div style="text-align:center;padding:4rem 2rem;">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--text-dim);margin:0 auto 1.5rem;" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <h2 style="font-size:1.5rem;margin-bottom:.75rem;"><?php _e('Aucun résultat', 'fatasoft-blog'); ?></h2>
        <p><?php _e('Essayez avec d\'autres mots-clés.', 'fatasoft-blog'); ?></p>
      </div>
    <?php endif; ?>
  </section>

  <?php if (is_active_sidebar('sidebar-blog')): ?>
    <?php get_sidebar(); ?>
  <?php endif; ?>

</div>

<?php get_footer(); ?>
