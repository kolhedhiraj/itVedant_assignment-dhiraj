/* ClassIQ – shared script: validation for login, signup and newsletter */
(function () {
  'use strict';

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const NAME_RE = /^[A-Za-z][A-Za-z .'-]{1,}$/;
  const USERS_KEY = 'classiq_users';
  const SESSION_KEY = 'classiq_session';

  /* ---------- helpers ---------- */
  const $ = (id) => document.getElementById(id);

  function toast(msg) {
    const t = $('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 2800);
  }

  function setError(input, errEl, message) {
    const field = input.closest('.field');
    if (message) {
      if (field) {
        field.classList.remove('shake');
        void field.offsetWidth; // restart the shake animation
        field.classList.add('shake');
      }
      field && field.classList.add('invalid');
      input.setAttribute('aria-invalid', 'true');
      if (errEl) errEl.textContent = message;
    } else {
      field && field.classList.remove('invalid');
      input.removeAttribute('aria-invalid');
      if (errEl) errEl.textContent = '';
    }
    return !message;
  }

  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveUsers(list) {
    try { localStorage.setItem(USERS_KEY, JSON.stringify(list)); } catch (e) {}
  }

  // NOTE: demo only. Real apps must hash passwords on a server.
  function hash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
    return String(h);
  }

  /* ---------- validators ---------- */
  const validate = {
    email(v) {
      v = v.trim();
      if (!v) return 'Email is required.';
      if (!EMAIL_RE.test(v)) return 'Please enter a valid email address.';
      return '';
    },
    fullname(v) {
      v = v.trim().replace(/\s+/g, ' ');
      if (!v) return 'Full name is required.';
      if (v.length < 3) return 'Full name must be at least 3 characters.';
      if (v.length > 50) return 'Full name must be under 50 characters.';
      if (!NAME_RE.test(v)) return 'Use letters, spaces, . \' or - only.';
      return '';
    },
    passwordLogin(v) {
      if (!v) return 'Password is required.';
      if (v.length < 6) return 'Password must be at least 6 characters.';
      return '';
    },
    passwordSignup(v) {
      if (!v) return 'Password is required.';
      if (v.length < 8) return 'Password must be at least 8 characters.';
      if (!/[A-Za-z]/.test(v)) return 'Password must contain a letter.';
      if (!/\d/.test(v)) return 'Password must contain a number.';
      if (/\s/.test(v)) return 'Password cannot contain spaces.';
      return '';
    }
  };

  /* ---------- password show/hide ---------- */
  document.querySelectorAll('[data-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = $(btn.dataset.toggle);
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.textContent = show ? 'Hide' : 'Show';
    });
  });

  /* ---------- wire live validation ---------- */
  function bind(input, errEl, fn) {
    if (!input) return;
    input.addEventListener('blur', () => setError(input, errEl, fn(input.value)));
    input.addEventListener('input', () => {
      if (input.closest('.field').classList.contains('invalid')) {
        setError(input, errEl, fn(input.value));
      }
    });
  }

  /* ---------- Login ---------- */
  const loginForm = $('loginForm');
  if (loginForm) {
    const email = $('email'), pw = $('password'), msg = $('formMsg');
    bind(email, $('emailErr'), validate.email);
    bind(pw, $('passwordErr'), validate.passwordLogin);

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      msg.textContent = ''; msg.className = 'form-msg';

      const okEmail = setError(email, $('emailErr'), validate.email(email.value));
      const okPw = setError(pw, $('passwordErr'), validate.passwordLogin(pw.value));
      if (!okEmail || !okPw) { (okEmail ? pw : email).focus(); return; }

      const user = getUsers().find((u) => u.email === email.value.trim().toLowerCase());
      if (!user) {
        msg.textContent = 'No account found with this email. Please sign up first.';
        msg.classList.add('bad');
        return;
      }
      if (user.password !== hash(pw.value)) {
        msg.textContent = 'Incorrect password. Please try again.';
        msg.classList.add('bad');
        return;
      }
      try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ email: user.email, fullname: user.fullname })); } catch (err) {}
      msg.textContent = 'Login successful! Redirecting…';
      msg.classList.add('ok');
      toast('Welcome back, ' + user.fullname.split(' ')[0] + '!');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 1200);
    });
  }

  /* ---------- Signup ---------- */
  const signupForm = $('signupForm');
  if (signupForm) {
    const email = $('email'), name = $('fullname'), pw = $('password'), msg = $('formMsg');
    bind(email, $('emailErr'), validate.email);
    bind(name, $('fullnameErr'), validate.fullname);
    bind(pw, $('passwordErr'), validate.passwordSignup);

    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      msg.textContent = ''; msg.className = 'form-msg';

      const results = [
        [email, setError(email, $('emailErr'), validate.email(email.value))],
        [name, setError(name, $('fullnameErr'), validate.fullname(name.value))],
        [pw, setError(pw, $('passwordErr'), validate.passwordSignup(pw.value))]
      ];
      const firstBad = results.find((r) => !r[1]);
      if (firstBad) { firstBad[0].focus(); return; }

      const users = getUsers();
      const mail = email.value.trim().toLowerCase();
      if (users.some((u) => u.email === mail)) {
        setError(email, $('emailErr'), 'An account with this email already exists.');
        email.focus();
        return;
      }
      users.push({
        email: mail,
        fullname: name.value.trim().replace(/\s+/g, ' '),
        password: hash(pw.value)
      });
      saveUsers(users);

      // sign the new user in straight away
      const fullName = name.value.trim().replace(/\s+/g, ' ');
      try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ email: mail, fullname: fullName })); } catch (err) {}

      msg.textContent = 'Account created! Taking you to your dashboard…';
      msg.classList.add('ok');
      toast('Signup successful 🎉');
      signupForm.reset();
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 1300);
    });
  }

  /* ---------- Newsletter (home page) ---------- */
  const subForm = $('subscribeForm');
  if (subForm) {
    const input = $('subEmail'), msg = $('subMsg');
    subForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const err = validate.email(input.value);
      if (err) {
        msg.textContent = err; msg.className = 'sub-msg bad';
        input.focus();
        return;
      }
      msg.textContent = 'Thanks for subscribing!'; msg.className = 'sub-msg ok';
      toast('Subscribed successfully');
      subForm.reset();
    });
    input.addEventListener('input', () => { msg.textContent = ''; });
  }

  /* ---------- Avatar fallback if assets/avatar.png is missing ---------- */
  const placeholder = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 420"><rect width="300" height="420" fill="none"/>' +
    '<circle cx="150" cy="150" r="80" fill="#e6c9a8"/><path d="M70 130c0-60 40-85 85-85s80 30 75 85c-20-30-60-35-80-30-25 5-60 10-80 30z" fill="#222"/>' +
    '<path d="M40 420c0-90 40-130 110-130s110 40 110 130z" fill="#1a1a1a"/></svg>'
  );
  document.querySelectorAll('img[data-fallback]').forEach((img) => {
    img.addEventListener('error', function onErr() {
      img.removeEventListener('error', onErr);
      img.src = placeholder;
    });
  });

  /* ---------- Scroll reveal animations (home page) ---------- */
  const revealGroups = [
    '.trusted .section-title',
    '.logos span',
    '.courses .section-title',
    '.course-card',
    '.allinone-img',
    '.allinone h2',
    '.features li',
    '.allinone .btn-lime',
    '.footer-left',
    '.footer-cols > div',
    '.footer-bottom'
  ];
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealGroups.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el, i) => {
        el.classList.add('reveal');
        el.style.setProperty('--d', (i * 0.12) + 's'); // stagger siblings
        io.observe(el);
      });
    });
  }

  /* ---------- Smooth scroll for in-page links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1 && document.querySelector(id)) {
        e.preventDefault();
        document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
})();
