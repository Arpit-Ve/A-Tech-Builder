/**
 * 3D + Scroll Effects — A'tech Builder
 * Ascend-Style with VISIBLE Animations
 * No form/API logic touched.
 */
(function () {
    'use strict';
    if (window.__3D_EFFECTS_LOADED) return;
    window.__3D_EFFECTS_LOADED = true;

    const isMobile = window.innerWidth < 768;
    const prefersRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersRM) return;

    // ─── 1. NEURAL CANVAS — Visible white particles + connection lines ───
    function initNeuralCanvas() {
        const canvas = document.getElementById('neuralCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let dots = [], mouseX = 0, mouseY = 0, t = 0;
        const MAX = isMobile ? 18 : 70;
        const DIST = isMobile ? 100 : 180;

        function resize() {
            const p = canvas.parentElement;
            canvas.width = p.offsetWidth;
            canvas.height = p.offsetHeight;
        }

        function seed() {
            dots = [];
            for (let i = 0; i < MAX; i++) {
                dots.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.35,
                    vy: (Math.random() - 0.5) * 0.35,
                    r: Math.random() * 2 + 0.5,
                    baseOp: Math.random() * 0.15 + 0.05,
                    phase: Math.random() * Math.PI * 2
                });
            }
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            t += 0.003;

            for (let i = 0; i < dots.length; i++) {
                const n = dots[i];
                const op = n.baseOp + Math.sin(t * 3 + n.phase) * 0.03;

                // Connection lines between nearby particles
                for (let j = i + 1; j < dots.length; j++) {
                    const m = dots[j];
                    const dx = n.x - m.x, dy = n.y - m.y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < DIST) {
                        const a = (1 - d / DIST) * 0.1;
                        ctx.strokeStyle = `rgba(255, 255, 255, ${a})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(n.x, n.y);
                        ctx.lineTo(m.x, m.y);
                        ctx.stroke();
                    }
                }

                // Mouse attraction (subtle pull)
                if (!isMobile) {
                    const mdx = mouseX - n.x, mdy = mouseY - n.y;
                    const md = Math.sqrt(mdx * mdx + mdy * mdy);
                    if (md < 250) {
                        n.vx += (mdx / md) * 0.008;
                        n.vy += (mdy / md) * 0.008;
                        // Glow line from mouse to nearby particle
                        const mop = (1 - md / 250) * 0.1;
                        ctx.strokeStyle = `rgba(255, 255, 255, ${mop})`;
                        ctx.lineWidth = 0.3;
                        ctx.beginPath();
                        ctx.moveTo(n.x, n.y);
                        ctx.lineTo(mouseX, mouseY);
                        ctx.stroke();
                    }
                }

                // Particle glow
                const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 3);
                grd.addColorStop(0, `rgba(255, 255, 255, ${op})`);
                grd.addColorStop(1, `rgba(255, 255, 255, 0)`);
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r * 3, 0, Math.PI * 2);
                ctx.fill();

                // Core dot
                ctx.fillStyle = `rgba(255, 255, 255, ${op * 1.5})`;
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fill();

                // Velocity damping
                n.vx *= 0.998;
                n.vy *= 0.998;
                n.x += n.vx;
                n.y += n.vy;

                // Wrap around
                if (n.x < -20) n.x = canvas.width + 20;
                if (n.x > canvas.width + 20) n.x = -20;
                if (n.y < -20) n.y = canvas.height + 20;
                if (n.y > canvas.height + 20) n.y = -20;
            }
            requestAnimationFrame(draw);
        }

        canvas.addEventListener('mousemove', e => {
            const r = canvas.getBoundingClientRect();
            mouseX = e.clientX - r.left;
            mouseY = e.clientY - r.top;
        });

        resize(); seed(); draw();
        window.addEventListener('resize', () => { resize(); seed(); });
    }

    // ─── 2. FLOATING ORBS — Animated gradient orbs across the page ───
    function initFloatingOrbs() {
        if (isMobile) return;
        const container = document.createElement('div');
        Object.assign(container.style, {
            position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '0',
            overflow: 'hidden'
        });
        document.body.appendChild(container);

        const orbConfigs = [
            { size: 400, x: '10%', y: '15%', color: 'rgba(56, 189, 248, 0.04)', dur: 18, delay: 0 },
            { size: 300, x: '75%', y: '25%', color: 'rgba(167, 139, 250, 0.03)', dur: 22, delay: -5 },
            { size: 350, x: '50%', y: '60%', color: 'rgba(56, 189, 248, 0.025)', dur: 25, delay: -10 },
            { size: 250, x: '20%', y: '80%', color: 'rgba(167, 139, 250, 0.03)', dur: 20, delay: -8 },
            { size: 200, x: '85%', y: '70%', color: 'rgba(56, 189, 248, 0.035)', dur: 15, delay: -3 },
        ];

        orbConfigs.forEach(cfg => {
            const orb = document.createElement('div');
            Object.assign(orb.style, {
                position: 'absolute',
                width: cfg.size + 'px', height: cfg.size + 'px',
                left: cfg.x, top: cfg.y,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${cfg.color}, transparent 70%)`,
                filter: 'blur(40px)',
                animation: `orbFloat ${cfg.dur}s ease-in-out ${cfg.delay}s infinite alternate`,
                willChange: 'transform',
            });
            container.appendChild(orb);
        });

        // Add CSS animation
        if (!document.getElementById('orbFloatStyle')) {
            const style = document.createElement('style');
            style.id = 'orbFloatStyle';
            style.textContent = `
                @keyframes orbFloat {
                    0% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -40px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.95); }
                    100% { transform: translate(15px, -15px) scale(1.05); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ─── 3. DEEP 3D CARD TILT ───
    function initCardTilt() {
        if (isMobile) return;
        document.querySelectorAll('.project-card, .team-card, .education-card').forEach(card => {
            let tick = false;
            card.addEventListener('mousemove', e => {
                if (tick) return; tick = true;
                requestAnimationFrame(() => {
                    const r = card.getBoundingClientRect();
                    const x = e.clientX - r.left, y = e.clientY - r.top;
                    const rx = ((y - r.height / 2) / (r.height / 2)) * -5;
                    const ry = ((x - r.width / 2) / (r.width / 2)) * 5;
                    card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(16px) translateY(-6px)`;
                    card.style.setProperty('--mouse-x', (x / r.width * 100) + '%');
                    card.style.setProperty('--mouse-y', (y / r.height * 100) + '%');
                    tick = false;
                });
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                card.style.transition = 'transform 0.8s cubic-bezier(0.16,1,0.3,1)';
                setTimeout(() => card.style.transition = '', 800);
            });
        });
    }

    // ─── 4. CURSOR GLOW — Visible soft glow ───
    function initCursorGlow() {
        if (isMobile) return;
        const g = document.querySelector('.cursor-glow');
        if (!g) return;
        let cx = 0, cy = 0, tx = 0, ty = 0;
        document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
        (function animate() {
            cx += (tx - cx) * 0.05;
            cy += (ty - cy) * 0.05;
            g.style.left = cx + 'px';
            g.style.top = cy + 'px';
            requestAnimationFrame(animate);
        })();
    }

    // ─── 5. TEXT SCRAMBLE — Hero highlight ───
    function initTextScramble() {
        const el = document.querySelector('.hero-title .highlight');
        if (!el) return;
        const final = el.textContent;
        const chars = '—·×÷αβγδεφψω∞◊□△▽';
        let it = 0;
        function go() {
            el.textContent = final.split('').map((c, i) =>
                i < it ? final[i] : c === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)]
            ).join('');
            if (it < final.length) { it += 0.5; requestAnimationFrame(go); }
            else el.textContent = final;
        }
        setTimeout(go, 1200);
    }

    // ─── 6. PARALLAX — Mouse-driven bg glow movement ───
    function initParallax() {
        if (isMobile) return;
        let tick = false;
        document.addEventListener('mousemove', e => {
            if (tick) return; tick = true;
            requestAnimationFrame(() => {
                const x = (e.clientX / window.innerWidth - 0.5) * 20;
                const y = (e.clientY / window.innerHeight - 0.5) * 20;
                document.querySelectorAll('.bg-glow').forEach(g => {
                    g.style.transform = `translate(${x}px,${y}px)`;
                });
                tick = false;
            });
        });
    }

    // ─── 7. PRELOADER ───
    function initPreloader() {
        const p = document.getElementById('preloader');
        if (!p) return;
        
        window.addEventListener('load', () => {
            setTimeout(() => {
                p.classList.add('hidden');
                // Trigger hero animations after shutter starts moving
                setTimeout(() => {
                    const heroBadge = document.querySelector('.hero-badge');
                    if (heroBadge) heroBadge.style.animationPlayState = 'running';
                }, 400);
                
                setTimeout(() => p.remove(), 2000); 
            }, 800);
        });
    }

    // ─── 8. MAGNETIC BUTTONS ───
    function initMagnetic() {
        if (isMobile) return;
        document.querySelectorAll('.btn-primary, .btn-order, .form-submit, .nav-cta').forEach(btn => {
            btn.addEventListener('mousemove', e => {
                const r = btn.getBoundingClientRect();
                const dx = (e.clientX - r.left - r.width / 2) * 0.12;
                const dy = (e.clientY - r.top - r.height / 2) * 0.12;
                btn.style.transform = `translate(${dx}px, ${dy}px) scale(1.02)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
                btn.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1)';
                setTimeout(() => btn.style.transition = '', 600);
            });
        });
    }

    // ─── 9. CARD SHINE SWEEP ───
    function initShine() {
        if (isMobile) return;
        document.querySelectorAll('.skill-card, .cert-card, .competency-item').forEach(card => {
            const s = document.createElement('div');
            Object.assign(s.style, {
                position: 'absolute', inset: '0',
                background: 'linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.015) 45%,rgba(255,255,255,0.035) 50%,rgba(255,255,255,0.015) 55%,transparent 60%)',
                backgroundSize: '250% 100%', backgroundPosition: '200% 0', borderRadius: 'inherit',
                pointerEvents: 'none', transition: 'background-position 0.9s ease', zIndex: '1'
            });
            card.style.position = 'relative';
            card.style.overflow = 'hidden';
            card.appendChild(s);
            card.addEventListener('mouseenter', () => s.style.backgroundPosition = '-200% 0');
            card.addEventListener('mouseleave', () => s.style.backgroundPosition = '200% 0');
        });
    }

    // ─── 10. GLOW TRACKING on cards ───
    function initGlowTrack() {
        if (isMobile) return;
        document.querySelectorAll('.timeline-card, .team-card, .project-card').forEach(c => {
            c.addEventListener('mousemove', e => {
                const r = c.getBoundingClientRect();
                c.style.setProperty('--mouse-x', ((e.clientX - r.left) / r.width * 100) + '%');
                c.style.setProperty('--mouse-y', ((e.clientY - r.top) / r.height * 100) + '%');
            });
        });
    }

    // ─── 11. SCROLL PROGRESS BAR ───
    function initScrollProgress() {
        const b = document.createElement('div');
        Object.assign(b.style, {
            position: 'fixed', top: '0', left: '0', height: '2px', width: '0%',
            background: 'linear-gradient(90deg, rgba(56, 189, 248, 0.3), #38bdf8)',
            zIndex: '10000', pointerEvents: 'none',
            transition: 'width 0.15s linear',
        });
        document.body.appendChild(b);
        window.addEventListener('scroll', () => {
            const p = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
            b.style.width = p + '%';
        }, { passive: true });
    }

    // ─── 12. SCROLL PARALLAX — section bg glows ───
    function initScrollParallax() {
        if (isMobile) return;
        let tick = false;
        window.addEventListener('scroll', () => {
            if (tick) return; tick = true;
            requestAnimationFrame(() => {
                document.querySelectorAll('.section').forEach(section => {
                    const rect = section.getBoundingClientRect();
                    const ratio = rect.top / window.innerHeight;
                    section.querySelectorAll('.bg-glow').forEach(glow => {
                        glow.style.transform = `translateY(${ratio * -25}px)`;
                    });
                });
                tick = false;
            });
        }, { passive: true });
    }

    // ─── 13. STAGGERED GRID REVEALS ───
    function initStagger() {
        document.querySelectorAll('.skills-grid, .projects-grid, .certs-grid, .competencies-grid, .education-grid').forEach(g => {
            Array.from(g.children).forEach((c, i) => {
                if (!c.style.transitionDelay) c.style.transitionDelay = (i * 0.08) + 's';
            });
        });
    }

    // ─── 14. WORD-BY-WORD HERO REVEAL ───
    function initSplitText() {
        const heroDesc = document.querySelector('.hero-description');
        if (!heroDesc || isMobile) return;
        const text = heroDesc.textContent;
        const words = text.split(' ');
        heroDesc.innerHTML = words.map((word, i) =>
            `<span style="display:inline-block;opacity:0;transform:translateY(12px);transition:all 0.6s cubic-bezier(0.16,1,0.3,1) ${0.8 + i * 0.045}s">${word}</span>`
        ).join(' ');
        setTimeout(() => {
            heroDesc.querySelectorAll('span').forEach(span => {
                span.style.opacity = '1';
                span.style.transform = 'translateY(0)';
            });
        }, 150);
    }

    // ─── 15. COUNTER Animation for hero stats ───
    function initCountUp() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.getAttribute('data-count'));
                    if (!target) return;
                    let current = 0;
                    const duration = 2000;
                    const start = performance.now();
                    const run = (now) => {
                        const progress = Math.min((now - start) / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        current = Math.floor(eased * target);
                        el.textContent = current + '+';
                        if (progress < 1) requestAnimationFrame(run);
                    };
                    requestAnimationFrame(run);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });
        document.querySelectorAll('.hero-stat .number').forEach(el => observer.observe(el));
    }

    // ─── 16. SECTION ENTRANCE — Smooth fade-in with scale ───
    function initSectionEntrance() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    if (el.classList.contains('section')) {
                        el.style.opacity = '1';
                        el.style.transform = 'translateY(0)';
                    }
                    el.classList.add('visible');
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });

        document.querySelectorAll('.section, .reveal, .reveal-left').forEach(el => {
            if (el.classList.contains('section') && el.id !== 'home') {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = 'all 1s var(--ease-expo)';
            }
            observer.observe(el);
        });
    }

    // Init all
    function init() {
        initPreloader();
        initNeuralCanvas();
        initFloatingOrbs();
        initCardTilt();
        initCursorGlow();
        initParallax();
        initGlowTrack();
        initMagnetic();
        initShine();
        initScrollProgress();
        initScrollParallax();
        initStagger();
        initSplitText();
        initCountUp();
        initSectionEntrance();
        if (!isMobile) initTextScramble();
    }

    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
