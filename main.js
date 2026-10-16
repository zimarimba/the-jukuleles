(() => {
  // Singapore clock in the bar
  const clock = document.getElementById('clock');
  const tick = () => {
    clock.textContent = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Singapore',
    }).format(new Date());
  };
  tick();
  setInterval(tick, 15000);

  // Top bar: transparent over the hero, then matches the section underneath
  const bar = document.getElementById('bar');
  const hero = document.querySelector('.hero');
  const darkSections = document.querySelectorAll('.hero, .events, .strip, .watch, .contact');
  const updateBar = () => {
    const y = bar.offsetHeight / 2;
    const overHero = hero.getBoundingClientRect().bottom > y && window.scrollY < 40;
    let dark = false;
    darkSections.forEach((sec) => {
      const r = sec.getBoundingClientRect();
      if (r.top <= y && r.bottom >= y) dark = true;
    });
    bar.classList.toggle('is-dark', !overHero && dark);
    bar.classList.toggle('is-light', !overHero && !dark);
  };
  window.addEventListener('scroll', updateBar, { passive: true });
  window.addEventListener('resize', updateBar);
  updateBar();

  // Mobile menu
  const toggle = document.querySelector('.bar__toggle');
  const menu = document.getElementById('menu');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Close' : 'Menu';
    menu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  // Reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  // Roster: photo follows the cursor
  const follower = document.getElementById('cursorImg');
  const followerImg = follower.querySelector('img');
  let x = 0, y = 0, fx = 0, fy = 0, raf = null;
  const loop = () => {
    fx += (x - fx) * 0.18;
    fy += (y - fy) * 0.18;
    follower.style.left = fx + 'px';
    follower.style.top = fy + 'px';
    raf = follower.classList.contains('on') ? requestAnimationFrame(loop) : null;
  };
  document.querySelectorAll('.roster li').forEach((li) => {
    li.addEventListener('mouseenter', (e) => {
      followerImg.src = li.dataset.img;
      x = fx = e.clientX; y = fy = e.clientY;
      follower.classList.add('on');
      if (!raf) raf = requestAnimationFrame(loop);
    });
    li.addEventListener('mousemove', (e) => { x = e.clientX; y = e.clientY; });
    li.addEventListener('mouseleave', () => follower.classList.remove('on'));
  });

  // Gallery strip: drag to scroll
  const strip = document.getElementById('strip');
  let down = false, startX = 0, startScroll = 0;
  strip.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    down = true; startX = e.clientX; startScroll = strip.scrollLeft;
    strip.classList.add('drag');
  });
  window.addEventListener('pointermove', (e) => {
    if (down) strip.scrollLeft = startScroll - (e.clientX - startX);
  });
  window.addEventListener('pointerup', () => { down = false; strip.classList.remove('drag'); });

  // Live clip: play only while on screen, sound on demand
  const video = document.getElementById('liveVideo');
  const sound = document.getElementById('soundToggle');
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) video.play().catch(() => {});
    else video.pause();
  }, { threshold: 0.25 }).observe(video);
  sound.addEventListener('click', () => {
    video.muted = !video.muted;
    sound.setAttribute('aria-pressed', String(!video.muted));
    sound.textContent = video.muted ? 'Sound off' : 'Sound on';
    if (!video.muted) video.play().catch(() => {});
  });

  // Enquiry form → opens the visitor's mail app with details filled in
  const form = document.getElementById('enquiry');
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const d = new FormData(form);
    const subject = `Enquiry: ${d.get('type')}${d.get('date') ? ' on ' + d.get('date') : ''}`;
    const body = [
      `Name: ${d.get('name')}`,
      `Email: ${d.get('email')}`,
      `Event: ${d.get('type')}`,
      `Date: ${d.get('date') || 'TBC'}`,
      '',
      d.get('message') || '',
    ].join('\n');
    window.location.href = `mailto:hello@thejukuleles.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
