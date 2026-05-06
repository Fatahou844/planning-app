/**
 * Fatasoft Blog — main.js
 * Cohérent avec le système de thème de la plateforme Fatasoft (dark/light mode, Inter font, indigo palette)
 */

(function () {
  'use strict';

  // -------------------------------------------------------
  // Dark / Light Mode
  // -------------------------------------------------------
  const STORAGE_KEY = 'fatasoft_theme';
  const DARK        = 'dark';
  const LIGHT       = 'light';

  function getStoredTheme() {
    return localStorage.getItem(STORAGE_KEY);
  }

  function getPreferredTheme() {
    const stored = getStoredTheme();
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK : LIGHT;
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    const btn       = document.getElementById('theme-toggle');
    const iconMoon  = btn?.querySelector('.icon-moon');
    const iconSun   = btn?.querySelector('.icon-sun');

    if (iconMoon && iconSun) {
      if (theme === DARK) {
        iconMoon.style.display = '';
        iconSun.style.display  = 'none';
        btn.setAttribute('aria-label', fatasoftData?.strings?.lightMode ?? 'Mode clair');
      } else {
        iconMoon.style.display = 'none';
        iconSun.style.display  = '';
        btn.setAttribute('aria-label', fatasoftData?.strings?.darkMode ?? 'Mode sombre');
      }
    }
  }

  // Appliquer le thème immédiatement pour éviter le flash
  applyTheme(getPreferredTheme());

  document.addEventListener('DOMContentLoaded', function () {

    // Init thème après chargement DOM
    applyTheme(getPreferredTheme());

    // Toggle thème
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        const current = document.documentElement.getAttribute('data-theme') ?? DARK;
        applyTheme(current === DARK ? LIGHT : DARK);
      });
    }

    // Écouter le changement de préférence système
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!getStoredTheme()) {
        applyTheme(e.matches ? DARK : LIGHT);
      }
    });

    // -------------------------------------------------------
    // Menu mobile
    // -------------------------------------------------------
    const menuToggle = document.getElementById('menu-toggle');
    const navEl      = document.getElementById('site-navigation');
    const iconMenu   = menuToggle?.querySelector('.icon-menu');
    const iconClose  = menuToggle?.querySelector('.icon-close');

    if (menuToggle && navEl) {
      menuToggle.addEventListener('click', function () {
        const isOpen = navEl.classList.toggle('is-open');
        menuToggle.setAttribute('aria-expanded', String(isOpen));

        if (iconMenu && iconClose) {
          iconMenu.style.display  = isOpen ? 'none' : '';
          iconClose.style.display = isOpen ? ''     : 'none';
        }

        // Bloquer le scroll body quand menu ouvert
        document.body.style.overflow = isOpen ? 'hidden' : '';
        menuToggle.setAttribute('aria-label',
          isOpen
            ? (fatasoftData?.strings?.menuClose ?? 'Fermer le menu')
            : (fatasoftData?.strings?.menuOpen  ?? 'Ouvrir le menu')
        );
      });

      // Fermer sur click extérieur
      document.addEventListener('click', function (e) {
        if (navEl.classList.contains('is-open') && !navEl.contains(e.target) && e.target !== menuToggle) {
          navEl.classList.remove('is-open');
          menuToggle.setAttribute('aria-expanded', 'false');
          if (iconMenu && iconClose) {
            iconMenu.style.display  = '';
            iconClose.style.display = 'none';
          }
          document.body.style.overflow = '';
        }
      });

      // Fermer avec Escape
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && navEl.classList.contains('is-open')) {
          navEl.classList.remove('is-open');
          menuToggle.setAttribute('aria-expanded', 'false');
          if (iconMenu && iconClose) {
            iconMenu.style.display  = '';
            iconClose.style.display = 'none';
          }
          document.body.style.overflow = '';
          menuToggle.focus();
        }
      });
    }

    // -------------------------------------------------------
    // Progress bar de lecture
    // -------------------------------------------------------
    const progressBar = document.getElementById('reading-progress');
    if (progressBar && document.querySelector('.entry-content')) {
      function updateProgress() {
        const scrollTop  = window.scrollY;
        const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
        const progress   = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = Math.min(progress, 100) + '%';
      }
      window.addEventListener('scroll', updateProgress, { passive: true });
      updateProgress();
    }

    // -------------------------------------------------------
    // Bouton "back to top"
    // -------------------------------------------------------
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
      window.addEventListener('scroll', function () {
        backToTop.style.display = window.scrollY > 400 ? 'flex' : 'none';
      }, { passive: true });

      backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // -------------------------------------------------------
    // Bouton "Copier le lien"
    // -------------------------------------------------------
    const copyBtn = document.getElementById('copy-link-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', async function () {
        const url = this.dataset.url || window.location.href;
        try {
          await navigator.clipboard.writeText(url);
          const original = this.innerHTML;
          this.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> Copié !';
          this.style.background = 'rgba(46,125,50,0.15)';
          this.style.borderColor = 'rgba(46,125,50,0.4)';
          this.style.color = '#4ade80';
          setTimeout(() => {
            this.innerHTML = original;
            this.style.background = '';
            this.style.borderColor = '';
            this.style.color = '';
          }, 2000);
        } catch {
          // Fallback pour navigateurs sans clipboard API
          const textarea = document.createElement('textarea');
          textarea.value = url;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }
      });
    }

    // -------------------------------------------------------
    // Animation d'entrée des cartes au scroll (Intersection Observer)
    // -------------------------------------------------------
    if ('IntersectionObserver' in window) {
      const cards = document.querySelectorAll('.post-card');
      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.style.opacity   = '1';
              entry.target.style.transform = 'translateY(0)';
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
      );

      cards.forEach(function (card, i) {
        card.style.opacity    = '0';
        card.style.transform  = 'translateY(20px)';
        card.style.transition = `opacity 0.45s ease ${i * 0.07}s, transform 0.45s ease ${i * 0.07}s`;
        observer.observe(card);
      });
    }

    // -------------------------------------------------------
    // Header : scroll shadow
    // -------------------------------------------------------
    const header = document.getElementById('site-header');
    if (header) {
      window.addEventListener('scroll', function () {
        if (window.scrollY > 10) {
          header.style.boxShadow = 'var(--shadow-md)';
        } else {
          header.style.boxShadow = '';
        }
      }, { passive: true });
    }

    // -------------------------------------------------------
    // Ancre active dans la sidebar (Table of Contents)
    // -------------------------------------------------------
    const tocLinks = document.querySelectorAll('.widget-toc a[href^="#"]');
    if (tocLinks.length) {
      const headings = Array.from(document.querySelectorAll('.entry-content h2, .entry-content h3'));

      window.addEventListener('scroll', function () {
        let current = '';
        headings.forEach(function (h) {
          if (h.offsetTop - 100 <= window.scrollY) {
            current = h.id;
          }
        });
        tocLinks.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
      }, { passive: true });
    }

    // -------------------------------------------------------
    // IDs automatiques sur les titres de l'article (pour ancres)
    // -------------------------------------------------------
    const entryHeadings = document.querySelectorAll('.entry-content h2, .entry-content h3');
    entryHeadings.forEach(function (h) {
      if (!h.id) {
        h.id = h.textContent
          .trim()
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
      }
    });

  }); // DOMContentLoaded

})();
