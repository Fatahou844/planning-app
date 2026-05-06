<?php
/**
 * Template : archives (catégories, tags, auteur, date)
 * @package fatasoft-blog
 */
get_header();
?>

<!-- Header d'archive -->
<header class="category-header animate-fadein">
  <div class="category-icon">
    <?php
      if (is_category()) echo '📂';
      elseif (is_tag()) echo '#';
      elseif (is_author()) echo '👤';
      elseif (is_date()) echo '📅';
      else echo '📚';
    ?>
  </div>
  <div class="category-info">
    <h1 class="archive-title">
      <?php
        if (is_category()) {
            single_cat_title();
        } elseif (is_tag()) {
            echo '#' . single_tag_title('', false);
        } elseif (is_author()) {
            the_archive_title();
        } elseif (is_date()) {
            the_archive_title();
        } else {
            the_archive_title();
        }
      ?>
    </h1>
    <?php
      $desc = get_the_archive_description();
      if ($desc):
    ?>
      <p class="archive-description"><?php echo wp_kses_post($desc); ?></p>
    <?php endif; ?>
  </div>
</header>

<!-- Fil d'Ariane -->
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
        <?php the_posts_pagination([
          'mid_size'  => 2,
          'prev_text' => '&#8592;',
          'next_text' => '&#8594;',
        ]); ?>
      </div>

    <?php else: ?>
      <p class="text-muted"><?php _e('Aucun article trouvé dans cette catégorie.', 'fatasoft-blog'); ?></p>
    <?php endif; ?>
  </section>

  <?php if (is_active_sidebar('sidebar-blog')): ?>
    <?php get_sidebar(); ?>
  <?php endif; ?>

</div>

<?php get_footer(); ?>
