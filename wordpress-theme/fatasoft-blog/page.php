<?php
/**
 * Template : page statique
 * @package fatasoft-blog
 */
get_header();
?>

<?php while (have_posts()): the_post(); ?>

<div class="content-area no-sidebar">

  <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>

    <?php fatasoft_breadcrumbs(); ?>

    <?php if (has_post_thumbnail()): ?>
      <div class="post-hero animate-fadein">
        <div class="post-hero-image">
          <?php the_post_thumbnail('fatasoft-hero', ['loading' => 'eager']); ?>
        </div>
      </div>
    <?php endif; ?>

    <header class="post-header animate-fadein animate-delay-1">
      <h1 class="post-title"><?php the_title(); ?></h1>
    </header>

    <div class="entry-content animate-fadein animate-delay-2">
      <?php the_content(); ?>
    </div>

    <?php
      wp_link_pages([
        'before'      => '<nav class="page-links" aria-label="' . esc_attr__('Pages de cet article', 'fatasoft-blog') . '">',
        'after'       => '</nav>',
        'link_before' => '<span>',
        'link_after'  => '</span>',
      ]);
    ?>

  </article>

</div>

<?php endwhile; ?>

<?php get_footer(); ?>
