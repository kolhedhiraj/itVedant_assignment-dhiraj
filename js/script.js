
/* ClassIQ Dashboard: Session, typing animation, courses, filters, enroll and newsletter */

(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  const SESSION_KEY = 'classiq_session';
  const ENROLL_KEY = 'classiq_enrolled';
  const SUBSCRIBE_KEY = 'classiq_subscribers';

  /* ---------- Toast notification ---------- */

  function toast(msg) {
    const t = $('toast');
    if (!t) return;

    t.textContent = msg;
    t.classList.add('show');

    clearTimeout(toast._t);

    toast._t = setTimeout(() => {
      t.classList.remove('show');
    }, 2600);
  }

  /* ---------- Session / Navbar ---------- */

  let session = null;

  try {
    session = JSON.parse(sessionStorage.getItem(SESSION_KEY));
  } catch (e) {
    session = null;
  }

  if (session && session.fullname) {
    const first = session.fullname.trim().split(' ')[0];
    const navRight = $('navRight');
    const welcome = $('welcome');

    if (navRight) {
      navRight.innerHTML =
        '<div class="user-chip">' +
          '<span class="avatar-dot">' +
            first.charAt(0).toUpperCase() +
          '</span>' +
          '<span class="uname"></span>' +
        '</div>' +
        '<button class="btn btn-dark" id="logout">Logout</button>';

      const uname = navRight.querySelector('.uname');
      if (uname) uname.textContent = first;
    }

    if (welcome) {
      welcome.textContent = 'Welcome back, ' + first + ' 👋';
    }

    const logout = $('logout');

    if (logout) {
      logout.addEventListener('click', () => {
        sessionStorage.removeItem(SESSION_KEY);
        window.location.href = 'login.html';
      });
    }
  }

  /* ---------- Typing Animation ---------- */

  const words = [
    'Coding',
    '3D Animation',
    'Web Design',
    'Data Science',
    'App Development',
    'UI/UX Design',
    'Photography'
  ];

  const typed = $('typed');

  if (typed) {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (reduceMotion) {
      typed.textContent = words[0];
    } else {
      let w = 0;
      let c = 0;
      let deleting = false;

      (function tick() {
        const word = words[w];

        typed.textContent = word.slice(0, c);

        let delay = deleting ? 45 : 95;

        if (!deleting && c === word.length) {
          deleting = true;
          delay = 1400;
        } else if (deleting && c === 0) {
          deleting = false;
          w = (w + 1) % words.length;
          delay = 350;
        } else {
          c += deleting ? -1 : 1;
        }

        setTimeout(tick, delay);
      })();
    }
  }

  /* ---------- Dummy Courses ---------- */

  const courses = [
    {
      id: 1,
      title: 'Full-Stack Web Development',
      cat: 'Coding',
      by: 'Aarav Mehta',
      rating: 4.8,
      lessons: 48,
      hours: '36h',
      price: '₹1,499',
      icon: '💻',
      bg: 'linear-gradient(135deg,#c4f573,#7fd8a6)'
    },
    {
      id: 2,
      title: '3D Animation with Blender',
      cat: 'Animation',
      by: 'Neha Kulkarni',
      rating: 4.9,
      lessons: 36,
      hours: '28h',
      price: '₹1,799',
      icon: '🎬',
      bg: 'linear-gradient(135deg,#ffd29d,#ff9a8b)'
    },
    {
      id: 3,
      title: 'Python for Data Science',
      cat: 'Data',
      by: 'Rohan Iyer',
      rating: 4.7,
      lessons: 52,
      hours: '40h',
      price: '₹1,299',
      icon: '📊',
      bg: 'linear-gradient(135deg,#a8c0ff,#7f9cf5)'
    },
    {
      id: 4,
      title: 'UI/UX Design Masterclass',
      cat: 'Design',
      by: 'Sara Khan',
      rating: 4.8,
      lessons: 30,
      hours: '22h',
      price: '₹999',
      icon: '🎨',
      bg: 'linear-gradient(135deg,#f7b2e5,#d7a2ff)'
    },
    {
      id: 5,
      title: 'React & Next.js Pro',
      cat: 'Coding',
      by: 'Vikram Patil',
      rating: 4.9,
      lessons: 44,
      hours: '32h',
      price: '₹1,699',
      icon: '⚛️',
      bg: 'linear-gradient(135deg,#9be7ff,#6bc5f8)'
    },
    {
      id: 6,
      title: 'Mobile App Dev with Flutter',
      cat: 'Coding',
      by: 'Ananya Rao',
      rating: 4.6,
      lessons: 40,
      hours: '30h',
      price: '₹1,399',
      icon: '📱',
      bg: 'linear-gradient(135deg,#fff1a8,#ffd166)'
    }
  ];

  /* ---------- Enrolled Courses ---------- */

  let enrolled = [];

  try {
    enrolled = JSON.parse(localStorage.getItem(ENROLL_KEY)) || [];

    if (!Array.isArray(enrolled)) enrolled = [];
  } catch (e) {
    enrolled = [];
  }

  const saveEnrolled = () => {
    try {
      localStorage.setItem(ENROLL_KEY, JSON.stringify(enrolled));
    } catch (e) {}
  };

  /* ---------- Dashboard Elements ---------- */

  const grid = $('grid');
  const empty = $('empty');
  const search = $('search');
  const filtersEl = $('filters');

  /* ---------- Course Rendering ---------- */

  if (grid && empty && search && filtersEl) {

    const cats = [
      'All',
      ...new Set(courses.map((c) => c.cat))
    ];

    let activeCat = 'All';

    filtersEl.innerHTML = cats.map((c) =>
      '<button class="filter' +
      (c === 'All' ? ' active' : '') +
      '" data-cat="' + c + '">' +
      c +
      '</button>'
    ).join('');

    function render() {
      const q = search.value.trim().toLowerCase();

      const list = courses.filter((c) =>
        (activeCat === 'All' || c.cat === activeCat) &&
        (
          !q ||
          c.title.toLowerCase().includes(q) ||
          c.by.toLowerCase().includes(q) ||
          c.cat.toLowerCase().includes(q)
        )
      );

      empty.hidden = list.length > 0;

      grid.innerHTML = list.map((c, i) => {
        const done = enrolled.includes(c.id);

        return (
          '<article class="dash-card" style="--d:' + (i * 0.09) + 's">' +

            '<div class="thumb" style="background:' + c.bg + '">' +
              '<span>' + c.icon + '</span>' +
              '<b class="tag">' + c.cat + '</b>' +
            '</div>' +

            '<div class="info">' +
              '<h3>' + c.title + '</h3>' +
              '<p class="by">by ' + c.by + '</p>' +

              '<div class="meta">' +
                '<span class="rating">★ ' + c.rating + '</span>' +
                '<span>' + c.lessons + ' lessons</span>' +
                '<span>' + c.hours + '</span>' +
              '</div>' +

              '<div class="foot">' +
                '<span class="price">' + c.price + '</span>' +

                '<button class="btn btn-lime enroll' +
                (done ? ' done' : '') +
                '" data-id="' + c.id + '">' +
                (done ? 'Enrolled ✓' : 'Enroll Now') +
                '</button>' +

              '</div>' +
            '</div>' +

          '</article>'
        );
      }).join('');
    }

    /* ---------- Category Filters ---------- */

    filtersEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter');

      if (!btn) return;

      activeCat = btn.dataset.cat;

      filtersEl.querySelectorAll('.filter').forEach((b) => {
        b.classList.toggle('active', b === btn);
      });

      render();
    });

    /* ---------- Course Search ---------- */

    search.addEventListener('input', render);

    /* ---------- Enroll / Remove Course ---------- */

    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('.enroll');

      if (!btn) return;

      if (!session || !session.fullname) {
        toast('Please login to enroll in a course');

        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1100);

        return;
      }

      const id = Number(btn.dataset.id);
      const course = courses.find((c) => c.id === id);

      if (!course) return;

      const idx = enrolled.indexOf(id);

      if (idx === -1) {
        enrolled.push(id);
        toast('Enrolled in ' + course.title);
      } else {
        enrolled.splice(idx, 1);
        toast('Removed from ' + course.title);
      }

      saveEnrolled();
      render();
    });

    render();
  }

  /* ---------- Newsletter Subscription ---------- */

  const form = $('subscribeForm');
  const input = $('subEmail');
  const status = $('subMsg');

  if (form && input && status) {

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = input.value.trim();

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

      if (!emailPattern.test(email)) {
        status.className = 'sub-msg is-error';
        status.textContent = 'Please enter a valid email address.';

        input.focus();
        return;
      }

      let subscribers = [];

      try {
        subscribers = JSON.parse(
          localStorage.getItem(SUBSCRIBE_KEY)
        ) || [];

        if (!Array.isArray(subscribers)) subscribers = [];
      } catch (e) {
        subscribers = [];
      }

      if (subscribers.includes(email.toLowerCase())) {
        status.className = 'sub-msg is-error';
        status.textContent = 'You are already subscribed!';
        return;
      }

      subscribers.push(email.toLowerCase());

      try {
        localStorage.setItem(
          SUBSCRIBE_KEY,
          JSON.stringify(subscribers)
        );

        status.className = 'sub-msg is-ok';
        status.textContent = 'Thanks for subscribing! 🎉';

        form.reset();

      } catch (e) {
        status.className = 'sub-msg is-error';
        status.textContent = 'Unable to subscribe. Please try again.';
      }
    });
  }

})();
