<?php
/**
 * Template part : Bannière plateforme ZPGarage — full width, avant footer
 * @package fatasoft-blog
 */
?>

<!-- ================================================================
     STATISTIQUES PLATEFORME
================================================================ -->
<section class="platform-stats-strip" aria-label="<?php esc_attr_e('Chiffres clés ZPGarage', 'fatasoft-blog'); ?>">
  <div class="platform-stats-inner">
    <?php
      $stats = [
        ['value' => '500+',  'label' => __('Garages actifs', 'fatasoft-blog'),       'icon' => 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'],
        ['value' => '98%',   'label' => __('Satisfaction client', 'fatasoft-blog'),    'icon' => 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'],
        ['value' => '40%',   'label' => __('Gain de temps moyen', 'fatasoft-blog'),    'icon' => 'M13 10V3L4 14h7v7l9-11h-7z'],
        ['value' => '24/7',  'label' => __('Disponibilité', 'fatasoft-blog'),          'icon' => 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'],
      ];
      foreach ($stats as $i => $s):
    ?>
    <div class="platform-stat-card animate-fadein animate-delay-<?php echo $i + 1; ?>">
      <div class="platform-stat-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
          <path d="<?php echo esc_attr($s['icon']); ?>"/>
        </svg>
      </div>
      <div class="platform-stat-value"><?php echo esc_html($s['value']); ?></div>
      <div class="platform-stat-label"><?php echo esc_html($s['label']); ?></div>
    </div>
    <?php endforeach; ?>
  </div>
</section>

<!-- ================================================================
     BANNIÈRE CTA PLATEFORME
================================================================ -->
<section class="platform-banner" aria-label="<?php esc_attr_e('Essayer ZPGarage', 'fatasoft-blog'); ?>">

  <!-- Éléments décoratifs -->
  <div class="platform-banner-deco-1" aria-hidden="true"></div>
  <div class="platform-banner-deco-2" aria-hidden="true"></div>

  <div class="platform-banner-inner">

    <!-- Gauche : texte + features -->
    <div class="platform-banner-text">
      <div class="platform-banner-label">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <?php _e('ZPGarage — Plateforme de gestion tout-en-un', 'fatasoft-blog'); ?>
      </div>

      <h2 class="platform-banner-title">
        <?php _e('Gérez votre garage.', 'fatasoft-blog'); ?><br>
        <?php _e('On s\'occupe du reste.', 'fatasoft-blog'); ?>
      </h2>

      <p class="platform-banner-desc">
        <?php _e('La plateforme tout-en-un pour les garages modernes. Planning, devis, facturation, stock et gestion clients — dans un seul outil, sans formation longue.', 'fatasoft-blog'); ?>
      </p>

      <!-- Features inline -->
      <div class="platform-banner-features">
        <?php
          $features = [
            __('Planning & Atelier',    'fatasoft-blog'),
            __('Devis & Facturation',   'fatasoft-blog'),
            __('Gestion clients',       'fatasoft-blog'),
            __('Suivi des véhicules',   'fatasoft-blog'),
            __('Stock & Pièces',        'fatasoft-blog'),
            __('Reporting avancé',      'fatasoft-blog'),
          ];
          foreach ($features as $feat):
        ?>
        <span class="platform-banner-feature">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <?php echo esc_html($feat); ?>
        </span>
        <?php endforeach; ?>
      </div>
    </div>

    <!-- Droite : CTA + garanties -->
    <div class="platform-banner-cta">

      <!-- Aperçu mini de l'app -->
      <div class="banner-mini-mockup" aria-hidden="true">
        <div class="bmm-header">
          <span class="bmm-dot" style="background:#ef4444"></span>
          <span class="bmm-dot" style="background:#f59e0b"></span>
          <span class="bmm-dot" style="background:#22c55e"></span>
          <span class="bmm-title">ZPGarage · Planning</span>
        </div>
        <div class="bmm-body">
          <div class="bmm-row bmm-row-header">
            <span>Technicien</span><span>9h</span><span>10h</span><span>11h</span><span>14h</span><span>15h</span>
          </div>
          <?php
            $technicians = [
              ['name' => 'Karim B.',   'slots' => ['--', 'block block-blue', 'block block-blue', '--', 'block block-green']],
              ['name' => 'Youssef M.', 'slots' => ['block block-yellow', '--', '--', 'block block-blue', '--']],
              ['name' => 'Fatima L.',  'slots' => ['--', '--', 'block block-green', 'block block-green', '--']],
            ];
            foreach ($technicians as $tech):
          ?>
          <div class="bmm-row">
            <span class="bmm-tech"><?php echo esc_html($tech['name']); ?></span>
            <?php foreach ($tech['slots'] as $slot): ?>
              <?php if ($slot === '--'): ?>
                <span class="bmm-slot-empty"></span>
              <?php else: ?>
                <span class="bmm-slot <?php echo esc_attr($slot); ?>"></span>
              <?php endif; ?>
            <?php endforeach; ?>
          </div>
          <?php endforeach; ?>
          <div class="bmm-footer">
            <span class="bmm-badge-stat">3 techniciens</span>
            <span class="bmm-badge-stat" style="color:#22c55e;">5 OR aujourd'hui</span>
          </div>
        </div>
      </div>

      <!-- Boutons CTA -->
      <div class="banner-cta-buttons">
        <a href="<?php echo esc_url(home_url('/essai-gratuit')); ?>" class="btn btn-primary btn-lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <polyline points="5 3 19 12 5 21 5 3"/>
          </svg>
          <?php _e('Démarrer gratuitement', 'fatasoft-blog'); ?>
        </a>
        <a href="<?php echo esc_url(home_url('/demo')); ?>" class="btn btn-glass btn-lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          <?php _e('Voir une démo', 'fatasoft-blog'); ?>
        </a>
      </div>

      <!-- Garanties -->
      <div class="banner-guarantees">
        <?php
          $guarantees = [
            __('Sans carte bancaire', 'fatasoft-blog'),
            __('1 mois offert',       'fatasoft-blog'),
            __('Support inclus',      'fatasoft-blog'),
          ];
          foreach ($guarantees as $g):
        ?>
        <span class="banner-guarantee">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <?php echo esc_html($g); ?>
        </span>
        <?php endforeach; ?>
      </div>

      <p class="platform-banner-cta-note">
        <?php printf(__('Déjà %s garages nous font confiance.', 'fatasoft-blog'), '<strong>500+</strong>'); ?>
      </p>

    </div><!-- .platform-banner-cta -->
  </div><!-- .platform-banner-inner -->
</section>

<?php
// CSS inline pour les éléments de la bannière non couverts par style.css principal
add_action('wp_footer', function() { ?>
<style>
/* Stats strip */
.platform-stats-strip {
  margin: 3rem 0 0;
  padding: 2rem 2.5rem;
  background: var(--bg-paper);
  border: 1px solid var(--divider);
  border-radius: var(--radius-xl);
}
.platform-stats-inner {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
.platform-stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem;
  border-radius: var(--radius-md);
  text-align: center;
  transition: background var(--transition-fast);
}
.platform-stat-card:hover { background: var(--bg-raised); }
.platform-stat-icon {
  width: 44px; height: 44px;
  border-radius: var(--radius-sm);
  background: rgba(99,102,241,0.12);
  display: flex; align-items: center; justify-content: center;
  color: var(--color-primary-light);
}
.platform-stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -1px;
  line-height: 1;
}
.platform-stat-label {
  font-size: 0.82rem;
  color: var(--text-muted);
  font-weight: 500;
}

/* Déco bannière */
.platform-banner-deco-1 {
  position: absolute;
  top: -80px; right: 200px;
  width: 300px; height: 300px;
  border-radius: 50%;
  background: rgba(99,102,241,0.15);
  filter: blur(60px);
  pointer-events: none;
}
.platform-banner-deco-2 {
  position: absolute;
  bottom: -60px; left: 100px;
  width: 200px; height: 200px;
  border-radius: 50%;
  background: rgba(129,140,248,0.1);
  filter: blur(50px);
  pointer-events: none;
}

/* Mini mockup planning dans la bannière */
.banner-mini-mockup {
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: var(--radius-lg);
  overflow: hidden;
  width: 100%;
  max-width: 380px;
}
[data-theme="light"] .banner-mini-mockup {
  background: rgba(255,255,255,0.8);
  border-color: rgba(99,102,241,0.2);
  box-shadow: var(--shadow-md);
}
.bmm-header {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.6rem 0.9rem;
  background: rgba(0,0,0,0.2);
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
[data-theme="light"] .bmm-header { background: rgba(0,0,0,0.04); border-color: var(--divider); }
.bmm-dot { width: 8px; height: 8px; border-radius: 50%; }
.bmm-title { font-size: 0.68rem; color: rgba(255,255,255,0.6); margin-left: 0.3rem; font-family: var(--font-mono); }
[data-theme="light"] .bmm-title { color: var(--text-dim); }
.bmm-body { padding: 0.75rem; display: flex; flex-direction: column; gap: 0.35rem; }
.bmm-row {
  display: grid; grid-template-columns: 80px repeat(5, 1fr);
  gap: 0.3rem; align-items: center;
}
.bmm-row-header { font-size: 0.6rem; color: rgba(255,255,255,0.4); margin-bottom: 0.15rem; }
[data-theme="light"] .bmm-row-header { color: var(--text-dim); }
.bmm-tech { font-size: 0.68rem; font-weight: 600; color: rgba(255,255,255,0.7); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
[data-theme="light"] .bmm-tech { color: var(--text-muted); }
.bmm-slot { height: 20px; border-radius: 4px; }
.bmm-slot-empty { height: 20px; }
.block-blue   { background: rgba(99,102,241,0.7); }
.block-green  { background: rgba(34,197,94,0.65); }
.block-yellow { background: rgba(245,158,11,0.7); }
.bmm-footer { display: flex; gap: 0.5rem; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.08); }
[data-theme="light"] .bmm-footer { border-color: var(--divider); }
.bmm-badge-stat { font-size: 0.65rem; font-weight: 600; color: rgba(255,255,255,0.6); }
[data-theme="light"] .bmm-badge-stat { color: var(--text-dim); }

/* Boutons CTA */
.banner-cta-buttons {
  display: flex; flex-direction: column; gap: 0.65rem;
  width: 100%; align-items: stretch;
}
.banner-cta-buttons .btn { justify-content: center; }

/* Garanties */
.banner-guarantees {
  display: flex; gap: 1rem; flex-wrap: wrap;
  justify-content: center;
}
.banner-guarantee {
  display: flex; align-items: center; gap: 0.35rem;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.6);
  font-weight: 500;
}
[data-theme="light"] .banner-guarantee { color: var(--text-dim); }
.banner-guarantee svg { color: #4ade80; }

/* Responsive stats + bannière */
@media (max-width: 900px) {
  .platform-stats-inner { grid-template-columns: repeat(2, 1fr); }
  .banner-mini-mockup { display: none; }
}
@media (max-width: 600px) {
  .platform-stats-strip { padding: 1.25rem; }
  .platform-stats-inner { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
  .platform-stat-value { font-size: 1.5rem; }
  .banner-guarantees { gap: 0.75rem; }
}
</style>
<?php }, 20);
