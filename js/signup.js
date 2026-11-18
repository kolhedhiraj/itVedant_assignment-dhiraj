
(function () {
  'use strict';

  const form = document.getElementById('signupForm');

  if (!form) return;

  const email = document.getElementById('email');
  const fullname = document.getElementById('fullname');
  const password = document.getElementById('password');

  const emailErr = document.getElementById('emailErr');
  const fullnameErr = document.getElementById('fullnameErr');
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

  function clearErrors() {
    emailErr.textContent = '';
    fullnameErr.textContent = '';
    passwordErr.textContent = '';
    formMsg.textContent = '';
    formMsg.classList.remove('error', 'success');
  }

  function showMessage(message, type) {
    formMsg.textContent = message;
    formMsg.classList.add(type);
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
    clearErrors();

    const userEmail = email.value.trim().toLowerCase();
    const userName = fullname.value.trim();
    const userPassword = password.value;

    let valid = true;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
      emailErr.textContent = 'Please enter a valid email address.';
      valid = false;
    }

    if (userName.replace(/\s/g, '').length < 3) {
      fullnameErr.textContent = 'Please enter your full name.';
      valid = false;
    }

    if (
      userPassword.length < 8 ||
      !/[A-Za-z]/.test(userPassword) ||
      !/[0-9]/.test(userPassword)
    ) {
      passwordErr.textContent =
        'Password must contain at least 8 characters, a letter and a number.';
      valid = false;
    }

    if (!valid) return;

    try {
      const users = JSON.parse(
        localStorage.getItem('classiq_users') || '[]'
      );

      if (users.some(user => user.email === userEmail)) {
        emailErr.textContent = 'This email is already registered.';
        return;
      }

      const passwordHash = await hashPassword(userPassword);

      users.push({
        fullname: userName,
        email: userEmail,
        passwordHash: passwordHash
      });

      localStorage.setItem('classiq_users', JSON.stringify(users));

      showMessage('Registration successful! Redirecting to login...', 'success');

      form.reset();

      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1200);

    } catch (error) {
      console.error('Signup error:', error);
      showMessage('Something went wrong. Please try again.', 'error');
    }
  });

})();
