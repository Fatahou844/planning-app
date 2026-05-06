<?php
/**
 * Template part : carte d'article (utilisé dans index, archive, search)
 * @package fatasoft-blog
 */
?>
<article id="post-<?php the_ID(); ?>" <?php post_class('post-card'); ?>>

  <!-- Thumbnail -->
  <a href="<?php the_permalink(); ?>" class="post-card-thumb" tabindex="-1" aria-hidden="true">
    <?php fatasoft_post_thumbnail('fatasoft-card'); ?>
  </a>

  <div class="post-card-body">

    <!-- Meta : catégorie + date -->
    <div class="post-card-meta">
      <?php fatasoft_post_categories(); ?>
      <time class="post-date" datetime="<?php echo esc_attr(get_the_date('c')); ?>">
        <?php echo esc_html(get_the_date()); ?>
      </time>
    </div>

    <!-- Titre -->
    <h2 class="post-card-title">
      <a href="<?php the_permalink(); ?>" rel="bookmark"><?php the_title(); ?></a>
    </h2>

    <!-- Extrait -->
    <div class="post-card-excerpt">
      <?php the_excerpt(); ?>
    </div>

    <!-- Footer carte -->
    <div class="post-card-footer">
      <!-- Auteur -->
      <div class="post-author-mini">
        <?php echo get_avatar(get_the_author_meta('ID'), 30, '', get_the_author(), ['class' => 'avatar']); ?>
        <span class="name"><?php the_author(); ?></span>
      </div>

      <!-- Lire la suite + temps de lecture -->
      <a href="<?php the_permalink(); ?>" class="read-more-link" aria-label="<?php printf(esc_attr__('Lire : %s', 'fatasoft-blog'), get_the_title()); ?>">
        <span><?php echo esc_html(fatasoft_reading_time()); ?></span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </a>
    </div>

  </div><!-- .post-card-body -->
</article>
