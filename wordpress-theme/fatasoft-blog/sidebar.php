<?php
/**
 * Sidebar — ZPGarage Blog
 * Contenu : recherche, CTA plateforme, articles récents, catégories, newsletter
 * @package fatasoft-blog
 */
?>

<aside id="secondary" class="widget-area" role="complementary" aria-label="<?php esc_attr_e('Barre latérale', 'fatasoft-blog'); ?>">

  <!-- ====================================================
       1. RECHERCHE
  ===================================================== -->
  <div class="sidebar-search">
    <h3 class="sidebar-search-title">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline;vertical-align:middle;margin-right:5px;" aria-hidden="true">
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
      </svg>
      <?php _e('Rechercher', 'fatasoft-blog'); ?>
    </h3>
    <form role="search" method="get" class="sidebar-search-form" action="<?php echo esc_url(home_url('/')); ?>">
      <label for="sidebar-search" class="sr-only"><?php _e('Rechercher dans le blog', 'fatasoft-blog'); ?></label>
      <input
        type="search"
        id="sidebar-search"
        name="s"
        placeholder="<?php esc_attr_e('Mot-clé, sujet…', 'fatasoft-blog'); ?>"
        value="<?php echo get_search_query(); ?>"
        autocomplete="off"
      >
      <button type="submit" class="btn btn-primary" aria-label="<?php esc_attr_e('Lancer la recherche', 'fatasoft-blog'); ?>">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
      </button>
    </form>
  </div>

  <!-- ====================================================
       2. CTA PLATEFORME ZPGARAGE
  ===================================================== -->
  <div class="sidebar-platform-cta" role="complementary" aria-label="<?php esc_attr_e('Essayer ZPGarage', 'fatasoft-blog'); ?>">
    <div class="sidebar-cta-eyebrow">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
      <?php _e('Plateforme ZPGarage', 'fatasoft-blog'); ?>
    </div>
    <h3 class="sidebar-cta-title">
      <?php _e('Gérez votre garage. On s\'occupe du reste.', 'fatasoft-blog'); ?>
    </h3>
    <p class="sidebar-cta-desc">
      <?php _e('Planning, devis, facturation, stock et clients — dans un seul outil. Essai 30 jours gratuit, sans carte bancaire.', 'fatasoft-blog'); ?>
    </p>
    <a href="<?php echo esc_url(home_url('/essai-gratuit')); ?>" class="sidebar-cta-btn">
      <?php _e('Démarrer gratuitement', 'fatasoft-blog'); ?>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </a>
    <div class="sidebar-cta-badge">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <?php _e('Sans carte bancaire · Support inclus', 'fatasoft-blog'); ?>
    </div>
  </div>

  <!-- ====================================================
       3. ARTICLES RÉCENTS
  ===================================================== -->
  <?php
    $recent_posts = get_posts([
      'numberposts'      => 5,
      'post_status'      => 'publish',
      'suppress_filters' => false,
    ]);
  ?>
  <?php if (!empty($recent_posts)): ?>
  <div class="sidebar-recent">
    <h3 class="sidebar-widget-title">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:middle;margin-right:5px;" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      <?php _e('Articles récents', 'fatasoft-blog'); ?>
    </h3>
    <?php foreach ($recent_posts as $post): setup_postdata($post); ?>
      <article class="recent-post-item">
        <a href="<?php the_permalink(); ?>" class="recent-post-thumb" tabindex="-1" aria-hidden="true">
          <?php if (has_post_thumbnail()): ?>
            <?php the_post_thumbnail('thumbnail', ['loading' => 'lazy', 'style' => 'width:100%;height:100%;object-fit:cover;']); ?>
          <?php else: ?>
            <div class="recent-post-thumb-placeholder">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
          <?php endif; ?>
        </a>
        <div class="recent-post-info">
          <a href="<?php the_permalink(); ?>" class="recent-post-title"><?php the_title(); ?></a>
          <div class="recent-post-date">
            <?php
              $cats = get_the_category();
              if ($cats) {
                  echo '<span style="color:var(--color-primary-light);font-weight:600;">' . esc_html($cats[0]->name) . '</span> · ';
              }
              echo esc_html(get_the_date());
            ?>
          </div>
        </div>
      </article>
    <?php endforeach; wp_reset_postdata(); ?>
  </div>
  <?php endif; ?>

  <!-- ====================================================
       4. CATÉGORIES
  ===================================================== -->
  <?php
    $categories = get_categories(['orderby' => 'count', 'order' => 'DESC', 'hide_empty' => true]);
  ?>
  <?php if (!empty($categories)): ?>
  <div class="sidebar-categories">
    <h3 class="sidebar-widget-title">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:middle;margin-right:5px;" aria-hidden="true">
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
      </svg>
      <?php _e('Catégories', 'fatasoft-blog'); ?>
    </h3>
    <ul class="sidebar-cat-list" role="list">
      <?php foreach ($categories as $cat): ?>
        <li class="sidebar-cat-item">
          <a href="<?php echo esc_url(get_category_link($cat->term_id)); ?>">
            <span><?php echo esc_html($cat->name); ?></span>
            <span class="sidebar-cat-count"><?php echo (int) $cat->count; ?></span>
          </a>
        </li>
      <?php endforeach; ?>
    </ul>
  </div>
  <?php endif; ?>

  <!-- ====================================================
       5. MODULE SPOTLIGHT (rotation des modules ZPGarage)
  ===================================================== -->
  <div class="sidebar-module-spotlight">
    <h3 class="sidebar-widget-title">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:middle;margin-right:5px;" aria-hidden="true">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
      <?php _e('Fonctionnalités ZPGarage', 'fatasoft-blog'); ?>
    </h3>
    <?php
      $modules = [
        [
          'icon'  => 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
          'name'  => __('Planning & Atelier', 'fatasoft-blog'),
          'desc'  => __('Planning visuel drag-and-drop. Affectez vos techniciens en temps réel.', 'fatasoft-blog'),
          'badge' => __('Temps réel', 'fatasoft-blog'),
          'color' => 'rgba(99,102,241,0.12)',
          'ctext' => 'var(--color-primary-light)',
        ],
        [
          'icon'  => 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
          'name'  => __('Devis & Facturation', 'fatasoft-blog'),
          'desc'  => __('Devis en 3 clics, conversion OR en 1 clic. PDF envoyé automatiquement.', 'fatasoft-blog'),
          'badge' => __('3 clics', 'fatasoft-blog'),
          'color' => 'rgba(245,158,11,0.1)',
          'ctext' => '#f59e0b',
        ],
        [
          'icon'  => 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
          'name'  => __('Gestion clients', 'fatasoft-blog'),
          'desc'  => __('Historique complet par client et véhicule. Rappels entretien automatiques.', 'fatasoft-blog'),
          'badge' => __('CRM complet', 'fatasoft-blog'),
          'color' => 'rgba(34,197,94,0.1)',
          'ctext' => '#22c55e',
        ],
        [
          'icon'  => 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
          'name'  => __('Reporting', 'fatasoft-blog'),
          'desc'  => __('CA, marges par prestation, performance techniciens. Export PDF.', 'fatasoft-blog'),
          'badge' => __('Insights', 'fatasoft-blog'),
          'color' => 'rgba(139,92,246,0.1)',
          'ctext' => '#a78bfa',
        ],
      ];
      foreach ($modules as $mod):
    ?>
    <div class="sidebar-module-item">
      <div class="sidebar-module-icon" style="background:<?php echo esc_attr($mod['color']); ?>; color:<?php echo esc_attr($mod['ctext']); ?>">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
          <path d="<?php echo esc_attr($mod['icon']); ?>"/>
        </svg>
      </div>
      <div class="sidebar-module-text">
        <div class="sidebar-module-name">
          <?php echo esc_html($mod['name']); ?>
          <span class="sidebar-module-badge" style="color:<?php echo esc_attr($mod['ctext']); ?>;background:<?php echo esc_attr($mod['color']); ?>"><?php echo esc_html($mod['badge']); ?></span>
        </div>
        <div class="sidebar-module-desc"><?php echo esc_html($mod['desc']); ?></div>
      </div>
    </div>
    <?php endforeach; ?>
    <a href="<?php echo esc_url(home_url('/fonctionnalites')); ?>" class="sidebar-module-link">
      <?php _e('Voir toutes les fonctionnalités', 'fatasoft-blog'); ?>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </a>
  </div>

  <!-- ====================================================
       6. NEWSLETTER
  ===================================================== -->
  <div class="sidebar-newsletter">
    <div class="sidebar-newsletter-icon">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    </div>
    <h3><?php _e('Restez informé', 'fatasoft-blog'); ?></h3>
    <p><?php _e('Conseils pratiques pour les professionnels de l\'automobile, chaque semaine.', 'fatasoft-blog'); ?></p>
    <?php if (function_exists('mc4wp_form')): ?>
      <?php mc4wp_form(); ?>
    <?php else: ?>
      <form class="sidebar-newsletter-form" onsubmit="return false;">
        <label for="nl-email" class="sr-only"><?php _e('Votre email', 'fatasoft-blog'); ?></label>
        <input
          type="email"
          id="nl-email"
          placeholder="<?php esc_attr_e('votre@email.com', 'fatasoft-blog'); ?>"
          autocomplete="email"
        >
        <button type="submit" class="btn btn-primary">
          <?php _e('S\'abonner', 'fatasoft-blog'); ?>
        </button>
      </form>
      <p class="sidebar-newsletter-disclaimer"><?php _e('Pas de spam. Désinscription en 1 clic.', 'fatasoft-blog'); ?></p>
    <?php endif; ?>
  </div>

  <!-- Widgets WordPress dynamiques (si configurés dans admin) -->
  <?php
    $sidebar_id = is_singular('post') ? 'sidebar-single' : 'sidebar-blog';
    if (is_active_sidebar($sidebar_id)):
  ?>
    <?php dynamic_sidebar($sidebar_id); ?>
  <?php endif; ?>

</aside>

<?php
// CSS inline pour les éléments de la sidebar non couverts par style.css
add_action('wp_footer', function() { ?>
<style>
.sidebar-module-spotlight {
  background: var(--bg-paper);
  border: 1px solid var(--divider);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
}
.sidebar-module-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--divider);
}
.sidebar-module-item:last-of-type { border-bottom: none; }
.sidebar-module-icon {
  width: 36px; height: 36px;
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.sidebar-module-text { flex: 1; }
.sidebar-module-name {
  font-size: 0.84rem; font-weight: 700;
  color: var(--text);
  display: flex; align-items: center; gap: 0.4rem;
  flex-wrap: wrap; margin-bottom: 0.25rem;
}
.sidebar-module-badge {
  font-size: 0.62rem; font-weight: 700;
  padding: 0.1rem 0.45rem;
  border-radius: 4px; letter-spacing: 0.3px;
}
.sidebar-module-desc { font-size: 0.78rem; color: var(--text-muted); line-height: 1.45; }
.sidebar-module-link {
  display: flex; align-items: center; gap: 0.35rem;
  justify-content: center;
  margin-top: 1rem;
  font-size: 0.82rem; font-weight: 700;
  color: var(--color-primary-light);
  padding: 0.55rem;
  border: 1.5px solid rgba(99,102,241,0.25);
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition: all var(--transition-fast);
}
.sidebar-module-link:hover {
  background: rgba(99,102,241,0.07);
  border-color: var(--color-primary);
  color: var(--color-primary-light);
}
</style>
<?php }, 20);
