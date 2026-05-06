/**
 * Aperçu live Customizer — postMessage handlers
 */
(function ($) {
  wp.customize('fatasoft_color_primary', function (value) {
    value.bind(function (newval) {
      document.documentElement.style.setProperty('--color-primary', newval);
    });
  });
  wp.customize('fatasoft_color_bg_dark', function (value) {
    value.bind(function (newval) {
      document.documentElement.style.setProperty('--bg', newval);
    });
  });
  wp.customize('fatasoft_color_paper_dark', function (value) {
    value.bind(function (newval) {
      document.documentElement.style.setProperty('--bg-paper', newval);
    });
  });
}(jQuery));
