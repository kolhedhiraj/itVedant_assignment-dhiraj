(function () {
  'use strict';

  const form = document.getElementById('loginForm');

  if (!form) return;

  const email = document.getElementById('email');
  const password = document.getElementById('password');

  const emailErr = document.getElementById('emailErr');
  const passwordErr = document.getElementById('passwordErr');
  const formMsg = document.getElementById('formMsg');

  const toggle = document.querySelector('[data-toggle="password"]');

  // Show / hide password
  if (toggle && password) {
    toggle.addEventListener('click', function () {
      const isPassword = password.type === 'password';
      password.type = isPassword ? 'text' : 'password';
      toggle.textContent = isPassword ? 'Hide' : 'Show';
      toggle.setAttribute('aria-pressed', String(isPassword));
    });
  }

  function setFieldError(input, errEl, message) {
    errEl.textContent = message;
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', errEl.id);
  }

  function clearFieldError(input, errEl) {
    errEl.textContent = '';
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
  }

  function hashPassword(value) {
    if (window.crypto && window.crypto.subtle) {
      return window.crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(value)
      ).then(buffer =>
        Array.from(new Uint8Array(buffer))
          .map(byte => byte.toString(16).padStart(2, '0'))
          .join('')
      );
    }
    return Promise.resolve(btoa(unescape(encodeURIComponent(value))));
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    clearFieldError(email, emailErr);
    clearFieldError(password, passwordErr);
    formMsg.textContent = '';
    formMsg.classList.remove('error', 'success');

    const userEmail = email.value.trim().toLowerCase();
    const userPassword = password.value;

    let valid = true;

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailPattern.test(userEmail)) {
      setFieldError(email, emailErr, 'Please enter a valid email address.');
      valid = false;
    }

    if (!userPassword) {
      setFieldError(password, passwordErr, 'Please enter your password.');
      valid = false;
    }

    if (!valid) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    try {
      const rawUsers = localStorage.getItem('classiq_users');
      const users = rawUsers ? JSON.parse(rawUsers) : [];

      if (!Array.isArray(users) || users.length === 0) {
        setFieldError(email, emailErr, 'No account found with this email.');
        formMsg.innerHTML = 'No account found. Please <a href="./signup.html">create an account</a> first.';
        formMsg.classList.add('error');
        email.focus();
        return;
      }

      const user = users.find(
        item => item && item.email && item.email.toLowerCase() === userEmail
      );

      if (!user) {
        setFieldError(email, emailErr, 'No account found with this email.');
        formMsg.innerHTML = 'We could not find an account for this email. Please <a href="./signup.html">sign up</a> to continue.';
        formMsg.classList.add('error');
        email.focus();
        return;
      }

      const passwordHash = await hashPassword(userPassword);
      const isMatch = user.passwordHash
        ? passwordHash === user.passwordHash
        : user.password === userPassword;

      if (!isMatch) {
        setFieldError(password, passwordErr, 'Incorrect password.');
        password.focus();
        return;
      }

      const sessionData = JSON.stringify({
        fullname: user.fullname || '',
        email: user.email
      });

      localStorage.setItem('classiq_session', sessionData);
      sessionStorage.setItem('classiq_session', sessionData);

      formMsg.textContent = 'Login successful! Redirecting...';
      formMsg.classList.add('success');

      setTimeout(function () {
        window.location.href = './dashboard.html';
      }, 800);

    } catch (error) {
      console.error('Login error:', error);
      formMsg.textContent = 'Something went wrong. Please try again.';
      formMsg.classList.add('error');
    }
  });
})();

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
