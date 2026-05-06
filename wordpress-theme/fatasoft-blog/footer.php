    </div><!-- .container (opened in header.php) -->
  </main><!-- #site-main -->

  <!-- ===== FOOTER ===== -->
  <footer id="site-footer" class="site-footer" role="contentinfo">
    <div class="container">

      <div class="footer-grid">

        <!-- Colonne branding -->
        <div class="footer-brand">
          <?php if (has_custom_logo()): ?>
            <div class="site-logo" style="margin-bottom:1rem;"><?php the_custom_logo(); ?></div>
          <?php else: ?>
            <div class="site-title" style="margin-bottom:0.75rem;">
              <?php
                $parts = explode(' ', trim(get_bloginfo('name')), 2);
                echo esc_html($parts[0]);
                if (!empty($parts[1])) echo ' <span>' . esc_html($parts[1]) . '</span>';
              ?>
            </div>
          <?php endif; ?>

          <p><?php _e('La plateforme de gestion tout-en-un pensée pour les professionnels de l\'automobile.', 'fatasoft-blog'); ?></p>

          <!-- Liens réseaux sociaux -->
          <?php if (has_nav_menu('social')): ?>
            <nav class="social-links" aria-label="<?php esc_attr_e('Réseaux sociaux', 'fatasoft-blog'); ?>">
              <?php
                wp_nav_menu([
                  'theme_location' => 'social',
                  'container'      => false,
                  'menu_class'     => 'social-links',
                  'depth'          => 1,
                  'link_before'    => '<span class="sr-only">',
                  'link_after'     => '</span>',
                  'items_wrap'     => '%3$s',
                  'walker'         => new Fatasoft_Social_Walker(),
                ]);
              ?>
            </nav>
          <?php else: ?>
            <!-- Liens sociaux par défaut si menu non configuré -->
            <div class="social-links">
              <?php
                $social = [
                  'LinkedIn'  => 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z',
                  'Twitter/X' => 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z',
                  'GitHub'    => 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22',
                ];
                foreach ($social as $name => $path):
              ?>
                <a href="#" class="social-link" aria-label="<?php echo esc_attr($name); ?>">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="<?php echo esc_attr($path); ?>"/>
                  </svg>
                </a>
              <?php endforeach; ?>
            </div>
          <?php endif; ?>
        </div><!-- .footer-brand -->

        <!-- Colonne 2 -->
        <div class="footer-col">
          <?php if (is_active_sidebar('footer-1')): ?>
            <?php dynamic_sidebar('footer-1'); ?>
          <?php elseif (has_nav_menu('footer-1')): ?>
            <h4 class="footer-col-title"><?php _e('Produit', 'fatasoft-blog'); ?></h4>
            <?php wp_nav_menu(['theme_location' => 'footer-1', 'menu_class' => 'footer-links', 'container' => false, 'depth' => 1]); ?>
          <?php else: ?>
            <h4 class="footer-col-title"><?php _e('Produit', 'fatasoft-blog'); ?></h4>
            <ul class="footer-links">
              <li><a href="<?php echo esc_url(home_url('/fonctionnalites')); ?>"><?php _e('Fonctionnalités', 'fatasoft-blog'); ?></a></li>
              <li><a href="<?php echo esc_url(home_url('/tarifs')); ?>"><?php _e('Tarifs', 'fatasoft-blog'); ?></a></li>
              <li><a href="<?php echo esc_url(home_url('/demo')); ?>"><?php _e('Voir une démo', 'fatasoft-blog'); ?></a></li>
              <li><a href="<?php echo esc_url(home_url('/nouveautes')); ?>"><?php _e('Nouveautés', 'fatasoft-blog'); ?></a></li>
              <li><a href="<?php echo esc_url(home_url('/feuille-de-route')); ?>"><?php _e('Feuille de route', 'fatasoft-blog'); ?></a></li>
            </ul>
          <?php endif; ?>
        </div>

        <!-- Colonne 3 -->
        <div class="footer-col">
          <?php if (is_active_sidebar('footer-2')): ?>
            <?php dynamic_sidebar('footer-2'); ?>
          <?php elseif (has_nav_menu('footer-2')): ?>
            <h4 class="footer-col-title"><?php _e('Ressources', 'fatasoft-blog'); ?></h4>
            <?php wp_nav_menu(['theme_location' => 'footer-2', 'menu_class' => 'footer-links', 'container' => false, 'depth' => 1]); ?>
          <?php else: ?>
            <h4 class="footer-col-title"><?php _e('Support', 'fatasoft-blog'); ?></h4>
            <ul class="footer-links">
              <li><a href="<?php echo esc_url(home_url('/blog')); ?>"><?php _e('Blog', 'fatasoft-blog'); ?></a></li>
              <li><a href="<?php echo esc_url(home_url('/centre-aide')); ?>"><?php _e('Centre d\'aide', 'fatasoft-blog'); ?></a></li>
              <li><a href="<?php echo esc_url(home_url('/documentation')); ?>"><?php _e('Documentation', 'fatasoft-blog'); ?></a></li>
              <li><a href="<?php echo esc_url(home_url('/contact')); ?>"><?php _e('Contact', 'fatasoft-blog'); ?></a></li>
              <li><a href="<?php echo esc_url(home_url('/formations')); ?>"><?php _e('Formations', 'fatasoft-blog'); ?></a></li>
            </ul>
          <?php endif; ?>
        </div>

        <!-- Colonne 4 -->
        <div class="footer-col">
          <?php if (is_active_sidebar('footer-3')): ?>
            <?php dynamic_sidebar('footer-3'); ?>
          <?php elseif (has_nav_menu('footer-3')): ?>
            <h4 class="footer-col-title"><?php _e('Entreprise', 'fatasoft-blog'); ?></h4>
            <?php wp_nav_menu(['theme_location' => 'footer-3', 'menu_class' => 'footer-links', 'container' => false, 'depth' => 1]); ?>
          <?php else: ?>
            <h4 class="footer-col-title"><?php _e('Légal', 'fatasoft-blog'); ?></h4>
            <ul class="footer-links">
              <li><a href="<?php echo esc_url(home_url('/mentions-legales')); ?>"><?php _e('Mentions légales', 'fatasoft-blog'); ?></a></li>
              <li><a href="<?php echo esc_url(home_url('/cgu')); ?>"><?php _e('CGU', 'fatasoft-blog'); ?></a></li>
              <li><a href="<?php echo esc_url(home_url('/politique-confidentialite')); ?>"><?php _e('Politique de confidentialité', 'fatasoft-blog'); ?></a></li>
              <li><a href="<?php echo esc_url(home_url('/cookies')); ?>"><?php _e('Cookies', 'fatasoft-blog'); ?></a></li>
            </ul>
          <?php endif; ?>
        </div>

      </div><!-- .footer-grid -->

      <!-- Bottom bar -->
      <div class="footer-bottom">
        <span>
          &copy; <?php echo date('Y'); ?>
          <strong>ZP Digital</strong> · <a href="<?php echo esc_url(home_url('/')); ?>">ZPGarage</a>.
          <?php _e('Tous droits réservés.', 'fatasoft-blog'); ?>
        </span>
        <div style="display:flex;align-items:center;gap:1.25rem;">
          <span class="footer-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <?php _e('1 mois gratuit', 'fatasoft-blog'); ?>
          </span>
          <span class="footer-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <?php _e('Support 6j/7', 'fatasoft-blog'); ?>
          </span>
          <a href="<?php echo esc_url(home_url('/essai-gratuit')); ?>" class="btn btn-primary" style="padding:.4rem 1rem;font-size:.82rem;">
            <?php _e('Essai gratuit', 'fatasoft-blog'); ?>
          </a>
        </div>
      </div>

    </div><!-- .container -->
  </footer><!-- #site-footer -->

  <!-- Bouton back to top -->
  <button id="back-to-top" class="btn btn-primary" aria-label="<?php esc_attr_e('Retour en haut', 'fatasoft-blog'); ?>" style="
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 44px;
    height: 44px;
    padding: 0;
    border-radius: 50%;
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 900;
    box-shadow: 0 4px 16px rgba(79,70,229,0.4);
  ">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
      <polyline points="18 15 12 9 6 15"/>
    </svg>
  </button>

</div><!-- .site-wrapper -->

<?php wp_footer(); ?>
</body>
</html>

<?php
/**
 * Walker pour les menus sociaux — affiche une icône SVG selon le domaine.
 */
if (!class_exists('Fatasoft_Social_Walker')) :
class Fatasoft_Social_Walker extends Walker_Nav_Menu {
    public function start_el(&$output, $data_object, $depth = 0, $args = null, $current_object_id = 0) {
        $url  = $data_object->url ?? '#';
        $name = $data_object->title ?? '';
        $icon = fatasoft_social_icon($url);

        $output .= '<a href="' . esc_url($url) . '" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="' . esc_attr($name) . '">';
        $output .= $icon;
        $output .= '<span class="sr-only">' . esc_html($name) . '</span>';
        $output .= '</a>';
    }
}

function fatasoft_social_icon(string $url): string {
    $icons = [
        'linkedin'  => '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z"/></svg>',
        'twitter'   => '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>',
        'github'    => '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>',
        'facebook'  => '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>',
        'instagram' => '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
        'youtube'   => '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>',
    ];

    foreach ($icons as $key => $svg) {
        if (str_contains(strtolower($url), $key)) return $svg;
    }

    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>';
}
endif;
