/**
 * Partials Loader
 * Fetches and injects shared header and footer HTML into pages.
 */

(function() {
  'use strict';

  /**
   * Load a partial HTML file and inject it into a target element
   * @param {string} partialPath - Path to the partial HTML file
   * @param {string} targetSelector - CSS selector for the target element
   * @returns {Promise<void>}
   */
  async function loadPartial(partialPath, targetSelector) {
    try {
      const response = await fetch(partialPath);
      if (!response.ok) {
        throw new Error(`Failed to load ${partialPath}: ${response.status}`);
      }
      const html = await response.text();
      const target = document.querySelector(targetSelector);
      if (target) {
        target.innerHTML = html;
        // Execute any scripts in the loaded partial
        executeScripts(target);
      }
    } catch (error) {
      console.error('Error loading partial:', error);
    }
  }

  /**
   * Execute script tags that were added via innerHTML
   * @param {Element} container - The container with the new scripts
   */
  function executeScripts(container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      if (oldScript.src) {
        newScript.src = oldScript.src;
      } else {
        newScript.textContent = oldScript.textContent;
      }
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }

  /**
   * Initialize partials loading
   */
  async function init() {
    // Determine base path (for GitHub Pages subdirectory support)
    const basePath = window.SITE_BASE_PATH || '';
    
    // Load header and footer in parallel
    await Promise.all([
      loadPartial(`${basePath}/partials/header.html`, '#site-header'),
      loadPartial(`${basePath}/partials/footer.html`, '#site-footer')
    ]);

    // Dispatch event when partials are loaded
    document.dispatchEvent(new CustomEvent('partialsLoaded'));
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
