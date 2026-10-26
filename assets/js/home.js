(function () {
  'use strict';

  const menuButton = document.querySelector('.home-menu');
  const navigation = document.getElementById('home-nav');

  if (menuButton && navigation) {
    const closeMenu = () => {
      navigation.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open menu');
    };

    menuButton.addEventListener('click', () => {
      const isOpen = navigation.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });

    navigation.addEventListener('click', event => {
      if (event.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  const filterButtons = document.querySelectorAll('.home-filter');
  const contentCards = document.querySelectorAll('.home-content-card');
  const moreContentLink = document.getElementById('home-more-content');
  const wideLayout = window.matchMedia('(min-width: 1500px)');
  let activeFilter = 'all';

  const updateContentCards = () => {
    const limit = wideLayout.matches ? (activeFilter === 'all' ? 8 : 4) : 3;
    const normalLimit = activeFilter === 'all' ? 6 : limit;
    let visibleCount = 0;

    contentCards.forEach(card => {
      const categories = card.dataset.category.split(' ');
      const isMatch = activeFilter === 'all'
        ? card.dataset.allFeatured === 'true' ||
          (wideLayout.matches && card.dataset.allWideFeatured === 'true')
        : categories.includes(activeFilter);
      const shouldShow = isMatch && visibleCount < normalLimit;
      card.hidden = !shouldShow;
      if (shouldShow) visibleCount += 1;
    });
  };

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter;

      filterButtons.forEach(candidate => {
        const isActive = candidate === button;
        candidate.classList.toggle('is-active', isActive);
        candidate.setAttribute('aria-pressed', String(isActive));
      });

      updateContentCards();

      if (moreContentLink) {
        moreContentLink.href = button.dataset.moreHref;
        moreContentLink.querySelector('span').textContent = button.dataset.moreLabel;
      }
    });
  });

  wideLayout.addEventListener('change', updateContentCards);
  updateContentCards();

  const year = document.getElementById('home-footer-year');
  if (year) year.textContent = new Date().getFullYear();
})();
