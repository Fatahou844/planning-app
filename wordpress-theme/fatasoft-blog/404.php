<?php
/**
 * Template : page 404
 * @package fatasoft-blog
 */
get_header();
?>

<div class="error-404 animate-fadein">
  <div class="error-404-code" aria-hidden="true">404</div>
  <h1><?php _e('Page introuvable', 'fatasoft-blog'); ?></h1>
  <p>
    <?php _e('La page que vous cherchez a peut-être été déplacée, renommée ou supprimée. Essayez une recherche ou retournez à l\'accueil.', 'fatasoft-blog'); ?>
  </p>

  <!-- Recherche -->
  <form role="search" method="get" action="<?php echo esc_url(home_url('/')); ?>" style="display:flex;gap:.75rem;max-width:500px;margin:0 auto 1.5rem;">
    <input
      type="search"
      name="s"
      placeholder="<?php esc_attr_e('Rechercher…', 'fatasoft-blog'); ?>"
      aria-label="<?php esc_attr_e('Rechercher', 'fatasoft-blog'); ?>"
    >
    <button type="submit" class="btn btn-primary" style="flex-shrink:0;">
      <?php _e('Chercher', 'fatasoft-blog'); ?>
    </button>
  </form>

  <a href="<?php echo esc_url(home_url('/')); ?>" class="btn btn-outline">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
    <?php _e('Retour à l\'accueil', 'fatasoft-blog'); ?>
  </a>
</div>

<?php get_footer(); ?>
