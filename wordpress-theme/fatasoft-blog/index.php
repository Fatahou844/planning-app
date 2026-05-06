<?php
/**
 * Template : page d'accueil du blog
 * @package fatasoft-blog
 */
get_header();

// Récupérer toutes les catégories pour les chips de filtre
$all_cats = get_categories(['orderby' => 'count', 'order' => 'DESC', 'number' => 8, 'hide_empty' => true]);
?>

<?php if (is_home() && is_front_page()): ?>

<!-- ================================================================
     HERO
================================================================ -->
<section class="home-hero" aria-label="<?php esc_attr_e('Présentation du blog', 'fatasoft-blog'); ?>">

  <!-- Blobs décoratifs -->
  <div class="hero-blob hero-blob-1" aria-hidden="true"></div>
  <div class="hero-blob hero-blob-2" aria-hidden="true"></div>
  <div class="hero-glow"            aria-hidden="true"></div>

  <div class="hero-inner">

    <!-- Colonne texte -->
    <div class="hero-content animate-fadein">
      <div class="hero-eyebrow">
        <span class="hero-eyebrow-dot" aria-hidden="true"></span>
        <?php _e('Conseils · Gestion de garage · Automobile', 'fatasoft-blog'); ?>
      </div>

      <h1 class="hero-title">
        <?php _e('Le blog des professionnels', 'fatasoft-blog'); ?>
        <span class="hero-title-accent"> <?php _e('de l\'automobile', 'fatasoft-blog'); ?></span>
      </h1>

      <p class="hero-subtitle">
        <?php _e('Guides pratiques, retours terrain et conseils de gestion pour les garages qui veulent gagner du temps, fidéliser leurs clients et piloter leur activité sereinement.', 'fatasoft-blog'); ?>
      </p>

      <div class="hero-actions">
        <a href="#articles" class="btn btn-primary btn-lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <?php _e('Lire les articles', 'fatasoft-blog'); ?>
        </a>
        <a href="<?php echo esc_url(home_url('/essai-gratuit')); ?>" class="btn btn-glass btn-lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <polyline points="5 3 19 12 5 21 5 3"/>
          </svg>
          <?php _e('Essayer ZPGarage gratuitement', 'fatasoft-blog'); ?>
        </a>
      </div>

      <!-- Stats inline -->
      <div class="hero-stats">
        <?php
          $post_count = wp_count_posts()->publish;
          $cat_count  = wp_count_terms(['taxonomy' => 'category', 'hide_empty' => true]);
        ?>
        <div class="hero-stat">
          <span class="hero-stat-num"><?php echo (int) $post_count; ?></span>
          <span class="hero-stat-label"><?php _e('Articles', 'fatasoft-blog'); ?></span>
        </div>
        <div class="hero-stat-sep" aria-hidden="true"></div>
        <div class="hero-stat">
          <span class="hero-stat-num">500+</span>
          <span class="hero-stat-label"><?php _e('Garages actifs', 'fatasoft-blog'); ?></span>
        </div>
        <div class="hero-stat-sep" aria-hidden="true"></div>
        <div class="hero-stat">
          <span class="hero-stat-num">40%</span>
          <span class="hero-stat-label"><?php _e('Temps économisé', 'fatasoft-blog'); ?></span>
        </div>
      </div>
    </div><!-- .hero-content -->

    <!-- Colonne visuelle : aperçu plateforme -->
    <div class="hero-visual animate-fadein animate-delay-2" aria-hidden="true">
      <div class="app-mockup">
        <div class="app-mockup-bar">
          <span class="mockup-dot" style="background:#ef4444"></span>
          <span class="mockup-dot" style="background:#f59e0b"></span>
          <span class="mockup-dot" style="background:#22c55e"></span>
          <span class="mockup-url">app.fatasoft.com</span>
        </div>
        <div class="app-mockup-body">
          <!-- Planning Garage -->
          <div class="mockup-header">
            <span class="mockup-title">Planning · Lundi 5 mai</span>
            <span class="mockup-badge">Temps réel</span>
          </div>
          <!-- OR (Ordres de Réparation) -->
          <div class="mockup-kanban">
            <div class="mockup-col">
              <div class="mockup-col-title">En attente</div>
              <div class="mockup-card mockup-card-high">
                <div class="mockup-card-title">Renault Clio · CT762</div>
                <div class="mockup-card-meta">Vidange + plaquettes</div>
              </div>
              <div class="mockup-card">
                <div class="mockup-card-title">Peugeot 308 · MA214</div>
                <div class="mockup-card-meta">Révision 60 000 km</div>
              </div>
            </div>
            <div class="mockup-col">
              <div class="mockup-col-title">En cours</div>
              <div class="mockup-card mockup-card-active">
                <div class="mockup-card-title">Dacia Duster · NB091</div>
                <div class="mockup-card-meta">
                  <div class="mockup-progress-bar"><div class="mockup-progress-fill" style="width:70%"></div></div>
                  <span>Karim · 70%</span>
                </div>
              </div>
              <div class="mockup-card mockup-card-active">
                <div class="mockup-card-title">BMW 320d · DK447</div>
                <div class="mockup-card-meta">
                  <div class="mockup-progress-bar"><div class="mockup-progress-fill" style="width:35%"></div></div>
                  <span>Youssef · 35%</span>
                </div>
              </div>
            </div>
            <div class="mockup-col">
              <div class="mockup-col-title">Terminé</div>
              <div class="mockup-card mockup-card-done">
                <div class="mockup-card-title">Toyota RAV4 · TZ551</div>
                <div class="mockup-card-meta" style="color:#4ade80;">✓ Facturé · 285 €</div>
              </div>
              <div class="mockup-card mockup-card-done">
                <div class="mockup-card-title">Ford Focus · KA229</div>
                <div class="mockup-card-meta" style="color:#4ade80;">✓ Facturé · 140 €</div>
              </div>
            </div>
          </div>
          <!-- Métriques du jour -->
          <div class="mockup-metrics">
            <div class="mockup-metric">
              <span class="mockup-metric-val">6</span>
              <span class="mockup-metric-lbl">OR du jour</span>
            </div>
            <div class="mockup-metric">
              <span class="mockup-metric-val">425 €</span>
              <span class="mockup-metric-lbl">CA facturé</span>
            </div>
            <div class="mockup-metric">
              <span class="mockup-metric-val">98%</span>
              <span class="mockup-metric-lbl">Satisfaction</span>
            </div>
          </div>
        </div>
      </div>
    </div><!-- .hero-visual -->

  </div><!-- .hero-inner -->
</section><!-- .home-hero -->


<!-- ================================================================
     BANDE FEATURES (3 piliers de la plateforme)
================================================================ -->
<section class="features-strip animate-fadein" aria-label="<?php esc_attr_e('Points forts de la plateforme', 'fatasoft-blog'); ?>">
  <div class="features-strip-inner">

    <?php
      $features = [
        [
          'icon'  => '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
          'title' => __('Planning & Atelier', 'fatasoft-blog'),
          'desc'  => __('Agenda visuel drag-and-drop. Affectez vos techniciens, gérez les créneaux.', 'fatasoft-blog'),
        ],
        [
          'icon'  => '<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>',
          'title' => __('Devis & Facturation', 'fatasoft-blog'),
          'desc'  => __('Devis en 3 clics, conversion OR en 1 clic, envoi PDF automatique au client.', 'fatasoft-blog'),
        ],
        [
          'icon'  => '<path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>',
          'title' => __('Gestion clients & véhicules', 'fatasoft-blog'),
          'desc'  => __('Historique complet par client et par véhicule. Rappels entretien automatiques.', 'fatasoft-blog'),
        ],
        [
          'icon'  => '<path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>',
          'title' => __('Stock & Reporting', 'fatasoft-blog'),
          'desc'  => __('Gestion du stock de pièces, tableaux de bord CA et marges en temps réel.', 'fatasoft-blog'),
        ],
      ];
      foreach ($features as $i => $f):
    ?>
    <div class="feature-pill animate-fadein animate-delay-<?php echo $i + 1; ?>">
      <div class="feature-pill-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
          <?php echo $f['icon']; ?>
        </svg>
      </div>
      <div class="feature-pill-text">
        <strong><?php echo esc_html($f['title']); ?></strong>
        <span><?php echo esc_html($f['desc']); ?></span>
      </div>
    </div>
    <?php endforeach; ?>

  </div>
</section>


<!-- ================================================================
     CHIPS CATÉGORIES
================================================================ -->
<?php if (!empty($all_cats)): ?>
<nav class="category-chips-nav animate-fadein" aria-label="<?php esc_attr_e('Filtrer par catégorie', 'fatasoft-blog'); ?>">
  <a href="<?php echo esc_url(home_url('/blog')); ?>" class="cat-chip cat-chip-active">
    <?php _e('Tous les articles', 'fatasoft-blog'); ?>
  </a>
  <?php foreach ($all_cats as $cat): ?>
    <a href="<?php echo esc_url(get_category_link($cat->term_id)); ?>" class="cat-chip">
      <?php echo esc_html($cat->name); ?>
      <span class="cat-chip-count"><?php echo (int) $cat->count; ?></span>
    </a>
  <?php endforeach; ?>
</nav>
<?php endif; ?>


<!-- ================================================================
     TITRE DE SECTION
================================================================ -->
<div class="section-heading animate-fadein" id="articles">
  <div class="section-heading-left">
    <h2 class="section-title"><?php _e('Derniers articles', 'fatasoft-blog'); ?></h2>
    <p class="section-subtitle"><?php _e('Conseils de gestion, retours terrain et guides pratiques pour les professionnels de l\'automobile.', 'fatasoft-blog'); ?></p>
  </div>
  <a href="<?php echo esc_url(get_post_type_archive_link('post')); ?>" class="btn btn-outline btn-sm">
    <?php _e('Tous les articles', 'fatasoft-blog'); ?>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  </a>
</div>

<?php endif; // is_home && is_front_page ?>


<!-- ================================================================
     LAYOUT PRINCIPAL : ARTICLES + SIDEBAR
================================================================ -->
<div class="content-area content-area--sidebar">

  <!-- ---- ARTICLES ---- -->
  <section class="posts-section">
    <?php if (have_posts()): ?>

      <?php if (!is_home() || !is_front_page()): ?>
        <div class="page-header animate-fadein">
          <h1 class="page-header-title"><?php _e('Derniers articles', 'fatasoft-blog'); ?></h1>
        </div>
      <?php endif; ?>

      <div class="posts-grid posts-grid--sidebar">
        <?php
          $is_first = true;
          while (have_posts()):
            the_post();
            if ($is_first && is_home() && is_front_page()):
              $is_first = false;
        ?>
          <!-- Article vedette -->
          <article id="post-<?php the_ID(); ?>" <?php post_class('post-card post-featured--v2 animate-fadein'); ?>>
            <a href="<?php the_permalink(); ?>" class="post-card-thumb post-card-thumb--featured" tabindex="-1" aria-hidden="true">
              <?php fatasoft_post_thumbnail('fatasoft-hero'); ?>
              <div class="featured-overlay">
                <span class="featured-label">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  <?php _e('À la une', 'fatasoft-blog'); ?>
                </span>
              </div>
            </a>
            <div class="post-card-body post-card-body--featured">
              <div class="post-card-meta">
                <?php fatasoft_post_categories(); ?>
                <time class="post-date" datetime="<?php echo esc_attr(get_the_date('c')); ?>"><?php echo esc_html(get_the_date()); ?></time>
                <span class="text-dim" style="font-size:.78rem;"><?php echo esc_html(fatasoft_reading_time()); ?></span>
              </div>
              <h2 class="post-card-title post-card-title--featured">
                <a href="<?php the_permalink(); ?>" rel="bookmark"><?php the_title(); ?></a>
              </h2>
              <div class="post-card-excerpt post-card-excerpt--featured"><?php the_excerpt(); ?></div>
              <div class="post-card-footer">
                <div class="post-author-mini">
                  <?php echo get_avatar(get_the_author_meta('ID'), 32, '', get_the_author(), ['class' => 'avatar']); ?>
                  <span class="name"><?php the_author(); ?></span>
                </div>
                <a href="<?php the_permalink(); ?>" class="btn btn-primary btn-sm">
                  <?php _e('Lire l\'article', 'fatasoft-blog'); ?>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
                </a>
              </div>
            </div>
          </article>

        <?php
            else:
              $is_first = false;
              get_template_part('template-parts/content', 'card');
            endif;
          endwhile;
        ?>
      </div><!-- .posts-grid -->

      <!-- Pagination -->
      <div class="pagination-wrap">
        <?php the_posts_pagination([
          'mid_size'  => 2,
          'prev_text' => '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>',
          'next_text' => '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>',
        ]); ?>
      </div>

    <?php else: ?>
      <div class="empty-state">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <h2><?php _e('Aucun article pour le moment', 'fatasoft-blog'); ?></h2>
        <p><?php _e('Revenez bientôt, du contenu arrive !', 'fatasoft-blog'); ?></p>
      </div>
    <?php endif; ?>
  </section><!-- .posts-section -->

  <!-- ---- SIDEBAR ---- -->
  <?php get_sidebar(); ?>

</div><!-- .content-area -->


<!-- ================================================================
     BANNIÈRE PLATEFORME (full width, avant footer)
================================================================ -->
<?php if (is_home() && is_front_page()): ?>
  <?php get_template_part('template-parts/platform', 'banner'); ?>
<?php endif; ?>

<?php get_footer(); ?>
