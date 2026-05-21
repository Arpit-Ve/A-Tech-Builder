/**
 * A'tech Builder — Premium Interaction & Animation Engine
 * Powered by GSAP, ScrollTrigger, Lenis Smooth Scroll
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ==========================================
    // 1. DYNAMIC CURSOR INJECTION & LOGIC
    // ==========================================
    let cursor = document.querySelector('.custom-cursor');
    let follower = document.querySelector('.custom-cursor-follower');

    if (!cursor) {
        cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);
    }
    if (!follower) {
        follower = document.createElement('div');
        follower.className = 'custom-cursor-follower';
        document.body.appendChild(follower);
    }

    // Set initial custom cursor location out of bounds
    gsap.set([cursor, follower], { xPercent: -50, yPercent: -50, x: -100, y: -100 });

    window.addEventListener('mousemove', (e) => {
        // Smooth follow coordinates
        gsap.to(cursor, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.1,
            ease: 'power3.out'
        });
        gsap.to(follower, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.35,
            ease: 'power3.out'
        });
    });

    // Handle cursor expansion on clickables
    const hoverables = 'a, button, .service-chip, .team-card, .project-card, .filter-btn, .modal-close, .footer-social';
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(hoverables)) {
            cursor.classList.add('hover');
            follower.classList.add('hover');
        }
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(hoverables)) {
            cursor.classList.remove('hover');
            follower.classList.remove('hover');
        }
    });

    // ==========================================
    // 2. LENIS SMOOTH SCROLL INTEGRATION
    // ==========================================
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 1.5
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync ScrollTrigger with Lenis
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Support hash link jumps smoothly
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                lenis.scrollTo(target, {
                    offset: -50,
                    duration: 1.5,
                    immediate: false
                });
            }
        });
    });

    // ==========================================
    // 3. PRELOADER & HERO TIMELINES
    // ==========================================
    const preloader = document.getElementById('preloader');

    function initHeroAnimations() {
        // Initial setup to prevent structural flash
        gsap.set('.hero-badge', { opacity: 0, y: 25 });
        gsap.set('.hero-title .line', { opacity: 0, y: 45 });
        gsap.set('.hero-description', { opacity: 0, y: 25 });
        gsap.set('.hero-buttons', { opacity: 0, y: 25 });
        gsap.set('.hero-stats .hero-stat', { opacity: 0, y: 25 });

        const tl = gsap.timeline({
            defaults: {
                ease: 'power4.out',
                duration: 1.2
            }
        });

        tl.to('.hero-badge', { opacity: 1, y: 0, duration: 0.8 })
          .to('.hero-title .line', { opacity: 1, y: 0, stagger: 0.15 }, '-=0.5')
          .to('.hero-description', { opacity: 1, y: 0 }, '-=0.8')
          .to('.hero-buttons', { opacity: 1, y: 0 }, '-=0.8')
          .to('.hero-stats .hero-stat', { opacity: 1, y: 0, stagger: 0.1 }, '-=0.8')
          .call(() => {
              // Trigger stat counters dynamically
              animateCounters();
          }, null, '-=0.4');
    }

    // Dismiss preloader and trigger entrance
    window.addEventListener('load', () => {
        if (preloader) {
            setTimeout(() => {
                preloader.classList.add('hidden');
                setTimeout(initHeroAnimations, 900);
            }, 500);
        } else {
            initHeroAnimations();
        }
    });

    // ==========================================
    // 4. STAT COUNTER SUB-TIMELINE
    // ==========================================
    function animateCounters() {
        const counters = document.querySelectorAll('.hero-stat .number');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'), 10);
            const obj = { val: 0 };
            gsap.to(obj, {
                val: target,
                duration: 2.5,
                ease: 'power3.out',
                onUpdate: () => {
                    counter.textContent = Math.floor(obj.val) + '+';
                }
            });
        });
    }

    // ==========================================
    // 5. STAGGERED SCROLL-TRIGGER REVEALS
    // ==========================================
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        gsap.to(section, {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                toggleActions: 'play none none none'
            }
        });
    });

    // Stagger Team Cards
    gsap.set('.team-card', { opacity: 0, y: 40 });
    ScrollTrigger.batch('.team-card', {
        start: 'top 85%',
        onEnter: batch => gsap.to(batch, {
            opacity: 1,
            y: 0,
            stagger: 0.2,
            duration: 1.2,
            ease: 'power3.out',
            overwrite: 'auto'
        })
    });

    // Stagger Project Cards
    gsap.set('.project-card', { opacity: 0, y: 40 });
    ScrollTrigger.batch('.project-card', {
        start: 'top 85%',
        onEnter: batch => gsap.to(batch, {
            opacity: 1,
            y: 0,
            stagger: 0.15,
            duration: 1.2,
            ease: 'power3.out',
            overwrite: 'auto'
        })
    });

    // ==========================================
    // 6. STICKY NAVBAR MORPH & LINK TRACKING
    // ==========================================
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-links a');

    // Sticky morph trigger
    ScrollTrigger.create({
        start: 'top -40px',
        onEnter: () => navbar.classList.add('scrolled'),
        onLeaveBack: () => navbar.classList.remove('scrolled')
    });

    // Anchor updates on scroll
    const navSections = document.querySelectorAll('section[id]');
    navSections.forEach(section => {
        ScrollTrigger.create({
            trigger: section,
            start: 'top 45%',
            end: 'bottom 45%',
            onEnter: () => updateNavActive(section.getAttribute('id')),
            onEnterBack: () => updateNavActive(section.getAttribute('id'))
        });
    });

    function updateNavActive(id) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
                link.classList.add('active');
            }
        });
    }

    // ==========================================
    // 7. PERSPECTIVE 3D CARD HOVER TILT
    // ==========================================
    const cards = document.querySelectorAll('.team-card, .project-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const xc = ((x / rect.width) - 0.5) * 14;  // Max 14 degree tilt
            const yc = ((y / rect.height) - 0.5) * -14;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            gsap.to(card, {
                rotateX: yc,
                rotateY: xc,
                scale: 1.012,
                duration: 0.45,
                ease: 'power3.out',
                transformPerspective: 1200
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                scale: 1,
                duration: 0.8,
                ease: 'power3.out'
            });
        });
    });

    // ==========================================
    // 8. PERFORMANCE OPTIMIZED NEURAL CANVAS
    // ==========================================
    const canvas = document.getElementById('neuralCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = canvas.offsetWidth;
        let height = canvas.height = canvas.offsetHeight;
        let particles = [];
        let isCanvasActive = true;

        // Automatically pause canvas loop when hero section is out of screen
        ScrollTrigger.create({
            trigger: '.hero',
            start: 'bottom top',
            onEnter: () => { isCanvasActive = false; },
            onLeaveBack: () => {
                isCanvasActive = true;
                drawLoop();
            }
        });

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.35;
                this.vy = (Math.random() - 0.5) * 0.35;
                this.radius = Math.random() * 1.5 + 0.5;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            const count = Math.min(60, Math.floor((width * height) / 12000));
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        }

        function drawLoop() {
            if (!isCanvasActive) return;

            ctx.clearRect(0, 0, width, height);

            // Update & Draw nodes
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            // Draw elastic connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.11 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(drawLoop);
        }

        initParticles();
        drawLoop();

        // Handle resize events gracefully
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                width = canvas.width = canvas.offsetWidth;
                height = canvas.height = canvas.offsetHeight;
                initParticles();
            }, 250);
        });
    }
});
