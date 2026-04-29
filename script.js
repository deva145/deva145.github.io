/* ============================================
   INTRO LOADER
   ============================================ */
const loader = document.getElementById('loader');
const loaderFill = document.querySelector('.loader-fill');
const pctEl = document.getElementById('pct');

let progress = 0;
const loaderInterval = setInterval(() => {
    progress += Math.random() * 8 + 3;
    if (progress >= 100) {
        progress = 100;
        clearInterval(loaderInterval);
        setTimeout(() => {
            loader.classList.add('done');
            document.body.style.overflow = '';
            initRevealsAfterLoader();
        }, 400);
    }
    loaderFill.style.width = progress + '%';
    pctEl.textContent = Math.floor(progress);
}, 80);

document.body.style.overflow = 'hidden';

/* ============================================
   SCROLL PROGRESS BAR
   ============================================ */
const scrollProgress = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = total > 0 ? window.scrollY / total : 0;
    scrollProgress.style.transform = `scaleX(${scrolled})`;
});

/* ============================================
   CUSTOM CURSOR + TRAIL
   ============================================ */
const cursor = document.querySelector('.cursor');
const trail = document.querySelector('.cursor-trail');
let mouseX = 0, mouseY = 0;
let trailX = 0, trailY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
});

(function animateTrail() {
    trailX += (mouseX - trailX) * 0.18;
    trailY += (mouseY - trailY) * 0.18;
    trail.style.left = trailX + 'px';
    trail.style.top = trailY + 'px';
    requestAnimationFrame(animateTrail);
})();

document.querySelectorAll('a, button, .project, .stack-card, .terminal').forEach(el => {
    el.addEventListener('mouseenter', () => trail.classList.add('hover'));
    el.addEventListener('mouseleave', () => trail.classList.remove('hover'));
});

/* ============================================
   CURSOR SPOTLIGHT (HERO ONLY)
   ============================================ */
const spotlight = document.getElementById('spotlight');
const hero = document.querySelector('.hero');

hero.addEventListener('mousemove', (e) => {
    spotlight.classList.add('visible');
    spotlight.style.left = e.clientX + 'px';
    spotlight.style.top = e.clientY + 'px';
});
hero.addEventListener('mouseleave', () => spotlight.classList.remove('visible'));

/* ============================================
   NAV SCROLL EFFECT
   ============================================ */
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 24) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
});

/* ============================================
   REVEAL ON SCROLL — initialised after loader
   ============================================ */
function initRevealsAfterLoader() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');

                if (entry.target.classList.contains('scramble')) {
                    new Scramble(entry.target).play();
                }
                if (entry.target.querySelector('[data-count]')) {
                    entry.target.querySelectorAll('[data-count]').forEach(animateCounter);
                }
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.reveal, .scramble').forEach(el => observer.observe(el));

    document.querySelectorAll('.hero [data-count]').forEach(animateCounter);
}

/* ============================================
   COUNTER ANIMATION
   ============================================ */
function animateCounter(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const startTime = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);

    function tick(now) {
        const t = Math.min((now - startTime) / duration, 1);
        const value = Math.floor(ease(t) * target);
        el.textContent = (target >= 999 ? '999' : value) === '999' && t === 1
            ? '∞'
            : value + suffix;
        if (t < 1) requestAnimationFrame(tick);
        else if (target >= 999) el.textContent = '∞';
    }
    requestAnimationFrame(tick);
}

/* ============================================
   TEXT SCRAMBLE EFFECT
   ============================================ */
class Scramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#01';
        this.original = el.textContent;
        this.queue = [];
        this.frame = 0;
        this.frameRequest = null;
    }
    play() {
        this.queue = [];
        for (let i = 0; i < this.original.length; i++) {
            const start = Math.floor(Math.random() * 30);
            const end = start + Math.floor(Math.random() * 30) + 15;
            this.queue.push({ to: this.original[i], start, end, char: '' });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
    }
    update = () => {
        let output = '';
        let complete = 0;
        for (let i = 0; i < this.queue.length; i++) {
            const { to, start, end, char } = this.queue[i];
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                let c = char;
                if (!c || Math.random() < 0.28) {
                    c = this.chars[Math.floor(Math.random() * this.chars.length)];
                    this.queue[i].char = c;
                }
                output += `<span class="scrambled">${c}</span>`;
            } else {
                output += ' ';
            }
        }
        this.el.innerHTML = output;
        if (complete < this.queue.length) {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        } else {
            this.el.textContent = this.original;
        }
    }
}

/* ============================================
   3D TILT + GLOW ON CARDS
   ============================================ */
document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotX = ((y - cy) / cy) * -7;
        const rotY = ((x - cx) / cx) * 7;
        card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
        card.style.setProperty('--x', x + 'px');
        card.style.setProperty('--y', y + 'px');
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* Stack card glow */
document.querySelectorAll('.stack-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--x', (e.clientX - rect.left) + 'px');
        card.style.setProperty('--y', (e.clientY - rect.top) + 'px');
    });
});

/* ============================================
   MAGNETIC BUTTONS
   ============================================ */
document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.4}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

/* ============================================
   PARTICLE BACKGROUND
   ============================================ */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let W, H;
function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const particleCount = window.innerWidth < 768 ? 35 : 80;
const particles = Array.from({ length: particleCount }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 1.6 + 0.4,
    hue: [265, 190, 340][Math.floor(Math.random() * 3)]
}));

let mouseCanvas = { x: -9999, y: -9999 };
window.addEventListener('mousemove', (e) => {
    mouseCanvas.x = e.clientX;
    mouseCanvas.y = e.clientY;
});

(function loop() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
            const q = particles[j];
            const dx = p.x - q.x, dy = p.y - q.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 130) {
                ctx.beginPath();
                ctx.strokeStyle = `hsla(${(p.hue + q.hue) / 2}, 70%, 60%, ${(1 - d / 130) * 0.18})`;
                ctx.lineWidth = 0.6;
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(q.x, q.y);
                ctx.stroke();
            }
        }
    }
    particles.forEach(p => {
        const dx = p.x - mouseCanvas.x;
        const dy = p.y - mouseCanvas.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 130 && d > 0) {
            p.x += (dx / d) * 1;
            p.y += (dy / d) * 1;
        }
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, 0.7)`;
        ctx.shadowColor = `hsla(${p.hue}, 80%, 65%, 0.6)`;
        ctx.shadowBlur = 8;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    });
    requestAnimationFrame(loop);
})();

/* ============================================
   SMOOTH ANCHOR SCROLL
   ============================================ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

/* ============================================
   CYCLING TERMINAL STATUS
   ============================================ */
const blink = document.querySelector('.cursor-blink');
if (blink) {
    const messages = ['building_', 'shipping_', 'learning_', 'hacking_', 'crafting_'];
    let i = 0;
    setInterval(() => {
        const status = blink.parentElement;
        const text = messages[i % messages.length];
        status.innerHTML = text.replace('_', '<span class="cursor-blink">_</span>');
        i++;
    }, 2400);
}

/* ============================================
   KONAMI CODE EASTER EGG
   ============================================ */
const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let pressed = [];
const easter = document.getElementById('easterEgg');

window.addEventListener('keydown', (e) => {
    pressed.push(e.key);
    pressed = pressed.slice(-konami.length);
    if (pressed.join(',') === konami.join(',')) {
        triggerRainbow();
    }
});

function triggerRainbow() {
    document.body.classList.add('rainbow');
    easter.classList.add('show');
    burstConfetti();
    setTimeout(() => {
        easter.classList.remove('show');
    }, 2400);
    setTimeout(() => {
        document.body.classList.remove('rainbow');
    }, 6000);
}

/* ============================================
   CONFETTI BURST (for konami / easter egg)
   ============================================ */
function burstConfetti() {
    const cv = document.createElement('canvas');
    cv.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9998';
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
    document.body.appendChild(cv);
    const c = cv.getContext('2d');
    const colors = ['#8b5cf6', '#06b6d4', '#f43f5e', '#10b981', '#f59e0b'];
    const pieces = Array.from({ length: 120 }, () => ({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 22,
        vy: (Math.random() - 0.5) * 22 - 6,
        size: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.4,
        life: 1
    }));
    function step() {
        c.clearRect(0, 0, cv.width, cv.height);
        let alive = false;
        pieces.forEach(p => {
            p.vy += 0.4;
            p.x += p.vx;
            p.y += p.vy;
            p.rot += p.vr;
            p.life -= 0.012;
            if (p.life > 0) {
                alive = true;
                c.save();
                c.translate(p.x, p.y);
                c.rotate(p.rot);
                c.globalAlpha = Math.max(p.life, 0);
                c.fillStyle = p.color;
                c.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                c.restore();
            }
        });
        if (alive) requestAnimationFrame(step);
        else cv.remove();
    }
    step();
}

/* ============================================
   CONSOLE EASTER EGG
   ============================================ */
console.log('%c👋 Hey there, fellow dev!', 'font-size:20px;font-weight:700;background:linear-gradient(90deg,#8b5cf6,#06b6d4,#f43f5e);-webkit-background-clip:text;color:transparent;');
console.log('%cTry the Konami code: ↑↑↓↓←→←→BA', 'font-size:13px;color:#a0a0b8;font-family:monospace;');
console.log('%cReach out: devanandan.a11c@gmail.com', 'font-size:13px;color:#a0a0b8;font-family:monospace;');
