
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
  if (toggle) {
    toggle.addEventListener('click', function () {
      const isPassword = password.type === 'password';
      password.type = isPassword ? 'text' : 'password';
      toggle.textContent = isPassword ? 'Hide' : 'Show';
    });
  }

  function hashPassword(value) {
    return crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(value)
    ).then(buffer =>
      Array.from(new Uint8Array(buffer))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('')
    );
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    emailErr.textContent = '';
    passwordErr.textContent = '';
    formMsg.textContent = '';
    formMsg.classList.remove('error', 'success');

    const userEmail = email.value.trim().toLowerCase();
    const userPassword = password.value;

    let valid = true;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
      emailErr.textContent = 'Please enter a valid email address.';
      valid = false;
    }

    if (!userPassword) {
      passwordErr.textContent = 'Please enter your password.';
      valid = false;
    }

    if (!valid) return;

    try {
      const users = JSON.parse(
        localStorage.getItem('classiq_users') || '[]'
      );

      const user = users.find(item => item.email === userEmail);

      if (!user) {
        emailErr.textContent = 'No account found with this email.';
        return;
      }

      const passwordHash = await hashPassword(userPassword);

      if (passwordHash !== user.passwordHash) {
        passwordErr.textContent = 'Incorrect password.';
        return;
      }

      sessionStorage.setItem(
        'classiq_session',
        JSON.stringify({
          fullname: user.fullname,
          email: user.email
        })
      );

      formMsg.textContent = 'Login successful! Redirecting...';
      formMsg.classList.add('success');

      setTimeout(function () {
        window.location.href = 'dashboard.html';
      }, 800);

    } catch (error) {
      console.error('Login error:', error);
      formMsg.textContent = 'Something went wrong. Please try again.';
      formMsg.classList.add('error');
    }
  });

})();
