<?php
/**
 * Template : article individuel
 * @package fatasoft-blog
 */
get_header();
?>

<?php while (have_posts()): the_post(); ?>

<div class="content-area <?php echo is_active_sidebar('sidebar-single') ? '' : 'no-sidebar'; ?>">

  <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>

    <!-- Fil d'Ariane -->
    <?php fatasoft_breadcrumbs(); ?>

    <!-- Image hero -->
    <?php if (has_post_thumbnail()): ?>
      <div class="post-hero animate-fadein">
        <div class="post-hero-image">
          <?php the_post_thumbnail('fatasoft-hero', ['loading' => 'eager', 'fetchpriority' => 'high']); ?>
        </div>
      </div>
    <?php endif; ?>

    <!-- Header de l'article -->
    <header class="post-header animate-fadein animate-delay-1">

      <!-- Catégories + temps de lecture -->
      <div class="post-header-meta">
        <?php fatasoft_post_categories(); ?>
        <span class="post-date">
          <time datetime="<?php echo esc_attr(get_the_date('c')); ?>"><?php echo esc_html(get_the_date()); ?></time>
        </span>
        <span class="badge badge-primary"><?php echo esc_html(fatasoft_reading_time()); ?></span>
        <span class="text-dim" style="font-size:.82rem;">
          <?php echo esc_html(fatasoft_comments_count()); ?>
        </span>
      </div>

      <!-- Titre -->
      <h1 class="post-title"><?php the_title(); ?></h1>

      <!-- Byline auteur -->
      <div class="post-byline">
        <?php echo get_avatar(get_the_author_meta('ID'), 46, '', get_the_author(), ['class' => 'avatar']); ?>
        <div class="post-byline-info">
          <div class="post-byline-name"><?php the_author(); ?></div>
          <div class="post-byline-date">
            <?php
              printf(
                /* translators: 1: date, 2: time */
                __('Publié le %1$s à %2$s', 'fatasoft-blog'),
                get_the_date(),
                get_the_time()
              );

              $modified = get_the_modified_date('c');
              $published = get_the_date('c');
              if ($modified !== $published) {
                  echo ' · <em>' . sprintf(
                      __('Mis à jour le %s', 'fatasoft-blog'),
                      get_the_modified_date()
                  ) . '</em>';
              }
            ?>
          </div>
        </div>

        <!-- Boutons de partage rapide -->
        <div style="margin-left:auto;display:flex;gap:.5rem;">
          <a
            href="https://twitter.com/intent/tweet?url=<?php echo rawurlencode(get_permalink()); ?>&text=<?php echo rawurlencode(get_the_title()); ?>"
            class="btn btn-outline"
            target="_blank" rel="noopener"
            style="padding:.45rem .9rem;font-size:.8rem;"
            aria-label="<?php esc_attr_e('Partager sur Twitter', 'fatasoft-blog'); ?>"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
            </svg>
            Twitter
          </a>
          <a
            href="https://www.linkedin.com/shareArticle?mini=true&url=<?php echo rawurlencode(get_permalink()); ?>&title=<?php echo rawurlencode(get_the_title()); ?>"
            class="btn btn-outline"
            target="_blank" rel="noopener"
            style="padding:.45rem .9rem;font-size:.8rem;"
            aria-label="<?php esc_attr_e('Partager sur LinkedIn', 'fatasoft-blog'); ?>"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z"/>
            </svg>
            LinkedIn
          </a>
          <button
            id="copy-link-btn"
            class="btn btn-outline"
            data-url="<?php echo esc_attr(get_permalink()); ?>"
            style="padding:.45rem .9rem;font-size:.8rem;"
            aria-label="<?php esc_attr_e('Copier le lien', 'fatasoft-blog'); ?>"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
            </svg>
            <?php _e('Copier', 'fatasoft-blog'); ?>
          </button>
        </div>

      </div><!-- .post-byline -->
    </header>

    <!-- Corps de l'article -->
    <div class="entry-content animate-fadein animate-delay-2">
      <?php the_content(); ?>
    </div>

    <!-- Tags -->
    <?php fatasoft_post_tags(); ?>

    <!-- Navigation précédent / suivant -->
    <nav class="post-navigation" aria-label="<?php esc_attr_e('Navigation entre articles', 'fatasoft-blog'); ?>">
      <?php
        $prev = get_previous_post();
        $next = get_next_post();

        if ($prev):
      ?>
        <a href="<?php echo esc_url(get_permalink($prev)); ?>" class="post-nav-link prev-post">
          <div class="post-nav-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true" style="display:inline;vertical-align:middle">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <?php _e('Article précédent', 'fatasoft-blog'); ?>
          </div>
          <div class="post-nav-title"><?php echo esc_html(get_the_title($prev)); ?></div>
        </a>
      <?php else: ?>
        <span></span>
      <?php endif; ?>

      <?php if ($next): ?>
        <a href="<?php echo esc_url(get_permalink($next)); ?>" class="post-nav-link next-post">
          <div class="post-nav-label">
            <?php _e('Article suivant', 'fatasoft-blog'); ?>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true" style="display:inline;vertical-align:middle">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
          <div class="post-nav-title"><?php echo esc_html(get_the_title($next)); ?></div>
        </a>
      <?php endif; ?>
    </nav>

    <!-- Articles connexes -->
    <?php fatasoft_related_posts(3); ?>

    <!-- Commentaires -->
    <?php
      if (comments_open() || get_comments_number()) {
          comments_template();
      }
    ?>

  </article>

</div><!-- .content-area -->

<?php endwhile; ?>

<?php get_sidebar('single'); ?>
<?php get_footer(); ?>
