(function () {
  'use strict';

  const header = document.querySelector('.site-header');
  const sidenav = document.getElementById('mySidenav');

  // Returns true only on mobile and tablet devices (max-width: 1024px)
  function isMobileOrTablet() {
    return window.matchMedia('(max-width: 1024px)').matches;
  }

  function getScrollTop() {
    return (
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0
    );
  }

  const spacer = document.createElement('div');
  spacer.style.display = 'none';
  if (header && header.parentNode) {
    header.parentNode.insertBefore(spacer, header.nextSibling);
  }

  let isPinned = false;

  function resetToDesktop() {
    if (header) {
      header.removeAttribute('style');
    }
    spacer.style.display = 'none';
    isPinned = false;

    if (sidenav) {
      sidenav.removeAttribute('style');
    }
  }

  function handleHeaderScroll() {
    // Do not execute on desktop
    if (!isMobileOrTablet()) {
      resetToDesktop();
      return;
    }

    if (!header) return;

    const scrollTop = getScrollTop();

    if (scrollTop > 0) {
      if (!isPinned) {
        const headerHeight = header.offsetHeight;
        spacer.style.display = 'block';
        spacer.style.height = headerHeight + 'px';

        header.style.position = 'fixed';
        header.style.top = '0';
        header.style.left = '0';
        header.style.right = '0';
        header.style.width = '100%';
        header.style.zIndex = '1000';
        header.style.backgroundColor = '#ffffff';
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.08)';
        header.style.webkitTransform = 'translateZ(0)';
        header.style.transform = 'translateZ(0)';
        isPinned = true;
      }
    } else if (isPinned) {
      // Reached top of page: strip inline style completely
      header.removeAttribute('style');
      spacer.style.display = 'none';
      isPinned = false;
    }
  }

  function handleResize() {
    if (!isMobileOrTablet()) {
      resetToDesktop();
      return;
    }

    if (isPinned && header) {
      header.removeAttribute('style');
      spacer.style.display = 'none';
      isPinned = false;
    }
    handleHeaderScroll();
  }

  // Close mySidenav on scroll or touch swipe (mobile & tablet only)
  let touchStartY = 0;

  window.addEventListener(
    'touchstart',
    function (e) {
      if (!isMobileOrTablet()) return;
      if (e.touches && e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    },
    { passive: true }
  );

  function closeOnScrollOrSwipe() {
    if (!isMobileOrTablet()) return;
    if (
      sidenav &&
      sidenav.style.width &&
      sidenav.style.width !== '0px' &&
      sidenav.style.width !== '0'
    ) {
      closeNav();
    }
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  window.addEventListener('touchmove', handleHeaderScroll, { passive: true });
  window.addEventListener('scroll', closeOnScrollOrSwipe, { passive: true });
  window.addEventListener(
    'touchmove',
    function (e) {
      if (!isMobileOrTablet()) return;
      if (!e.touches || e.touches.length === 0) return;
      const deltaY = Math.abs(e.touches[0].clientY - touchStartY);
      if (deltaY > 10) {
        closeOnScrollOrSwipe();
      }
    },
    { passive: true }
  );

  window.addEventListener('resize', handleResize, { passive: true });
  window.addEventListener('orientationchange', handleResize);

  // Initial check on page load
  handleHeaderScroll();
})();

function openNav() {
  if (!window.matchMedia('(max-width: 1024px)').matches) return;
  const sidenav = document.getElementById('mySidenav');
  if (sidenav) sidenav.style.width = '250px';
}

function closeNav() {
  if (!window.matchMedia('(max-width: 1024px)').matches) return;
  const sidenav = document.getElementById('mySidenav');
  if (sidenav) sidenav.style.width = '0';
}
