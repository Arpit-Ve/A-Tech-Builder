/**
 * A'tech Builder — Premium Interaction & Animation Engine
 * Powered by GSAP, ScrollTrigger, Lenis Smooth Scroll
 * Inspired by ultra-premium editorial motion systems
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ==========================================
    // 1. UNIFIED CUSTOM CURSOR LOGIC
    // ==========================================
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');

    if (dot && ring) {
        // Set initial coordinates out of view
        gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: -100, y: -100 });

        let mx = -100, my = -100;
        window.addEventListener('mousemove', (e) => {
            mx = e.clientX;
            my = e.clientY;

            // Tight follow for the central dot
            gsap.to(dot, {
                x: mx,
                y: my,
                duration: 0.08,
                ease: 'power2.out'
            });

            // Delayed smooth lag for the outer wireframe ring
            gsap.to(ring, {
                x: mx,
                y: my,
                duration: 0.32,
                ease: 'power3.out'
            });
        });

        // Hover expanders for clickables
        const hoverables = 'a, button, .svc-chip, .team-card, .proj-card, .soc-btn, .filter-pill, .icon-btn, .footer-soc';
        
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(hoverables)) {
                ring.classList.add('enlarged');
                dot.classList.add('hidden');
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(hoverables)) {
                ring.classList.remove('enlarged');
                dot.classList.remove('hidden');
            }
        });
    }

    // ==========================================
    // 2. LENIS SMOOTH SCROLL INTEGRATION
    // ==========================================
    const lenis = new Lenis({
        duration: 1.25,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 1.25
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Synchronize ScrollTrigger with Lenis
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Smooth anchor scrolls
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                lenis.scrollTo(target, {
                    offset: -60,
                    duration: 1.4,
                    immediate: false
                });
            }
        });
    });

    // ==========================================
    // 3. PREMIUM HERO INTERACTION TIMELINE
    // ==========================================
    function initHeroAnimations() {
        // Initial setup for structural reveals
        gsap.set('.hero-badge', { opacity: 0, y: 30 });
        gsap.set('.hero-title-main', { opacity: 0, y: 40 });
        gsap.set('.hero-tagline', { opacity: 0, y: 20 });
        gsap.set('.hero-desc', { opacity: 0, y: 30 });
        gsap.set('.hero-actions .btn', { opacity: 0, y: 25 });
        gsap.set('.hero-stats .stat-item', { opacity: 0, y: 30 });

        const tl = gsap.timeline({
            defaults: {
                ease: 'power4.out',
                duration: 1.3
            }
        });

        tl.to('.hero-badge', { opacity: 1, y: 0 })
          .to('.hero-title-main', { opacity: 1, y: 0 }, '-=0.9')
          .to('.hero-tagline', { opacity: 1, y: 0 }, '-=1.0')
          .to('.hero-desc', { opacity: 1, y: 0 }, '-=0.9')
          .to('.hero-actions .btn', { opacity: 1, y: 0, stagger: 0.15 }, '-=1.0')
          .to('.hero-stats .stat-item', { opacity: 1, y: 0, stagger: 0.12 }, '-=1.1');
    }

    // Run animations once preloader completes
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // Watch for the "done" class on preloader to kick off hero animation
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && preloader.classList.contains('done')) {
                    setTimeout(initHeroAnimations, 100);
                    observer.disconnect();
                }
            });
        });
        observer.observe(preloader, { attributes: true });
    } else {
        initHeroAnimations();
    }

    // ==========================================
    // 4. MAGNIFICENT MAGNETIC PULL EFFECT
    // ==========================================
    const magneticElements = document.querySelectorAll('.btn, .soc-btn, .svc-chip, .icon-btn, .nav-link, .footer-soc');
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - (rect.width / 2);
            const y = e.clientY - rect.top - (rect.height / 2);

            // Gently pull the element towards the cursor
            gsap.to(el, {
                x: x * 0.32,
                y: y * 0.32,
                duration: 0.35,
                ease: 'power2.out'
            });
        });

        el.addEventListener('mouseleave', () => {
            // Elastic spring back to center
            gsap.to(el, {
                x: 0,
                y: 0,
                duration: 0.6,
                ease: 'elastic.out(1, 0.36)'
            });
        });
    });

    // ==========================================
    // 5. STAGGERED SCROLL REVEALS (TRESMARES STYLE)
    // ==========================================
    // Custom header reveal
    document.querySelectorAll('.section-header').forEach(header => {
        gsap.from(header, {
            opacity: 0,
            y: 45,
            duration: 1.4,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: header,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    });

    // Team Card dynamic glide-ins
    gsap.set('.team-card', { opacity: 0, y: 55 });
    ScrollTrigger.batch('.team-card', {
        start: 'top 88%',
        onEnter: batch => gsap.to(batch, {
            opacity: 1,
            y: 0,
            stagger: 0.22,
            duration: 1.4,
            ease: 'power4.out',
            overwrite: 'auto'
        })
    });

    // Project Card dynamic scale glide-ins
    gsap.set('.proj-card', { opacity: 0, y: 55 });
    ScrollTrigger.batch('.proj-card', {
        start: 'top 88%',
        onEnter: batch => gsap.to(batch, {
            opacity: 1,
            y: 0,
            stagger: 0.16,
            duration: 1.4,
            ease: 'power4.out',
            overwrite: 'auto'
        })
    });

    // Contact Information Box & Form Glide-in
    gsap.set(['.contact-info', '.contact-form'], { opacity: 0, y: 50 });
    ScrollTrigger.create({
        trigger: '#contact',
        start: 'top 80%',
        onEnter: () => {
            gsap.to('.contact-info', { opacity: 1, y: 0, duration: 1.3, ease: 'power3.out' });
            gsap.to('.contact-form', { opacity: 1, y: 0, duration: 1.3, ease: 'power3.out', delay: 0.15 });
        }
    });

    // ==========================================
    // 6. SCROLL PARALLAX IMAGES (TRESMARES CAPITAL STYLE)
    // ==========================================
    document.querySelectorAll('.proj-card').forEach(card => {
        const img = card.querySelector('.proj-img');
        if (img) {
            // Apply initial scale to create a safe moving overflow border
            gsap.set(img, { scale: 1.15 });

            gsap.fromTo(img, 
                { yPercent: -8 }, 
                {
                    yPercent: 8,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: card,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true
                    }
                }
            );
        }
    });

    // ==========================================
    // 7. PERSPECTIVE 3D CARD HOVER TILT
    // ==========================================
    const tiltCards = document.querySelectorAll('.team-card, .proj-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const xc = ((x / rect.width) - 0.5) * 12;   // Max 12 degree tilt
            const yc = ((y / rect.height) - 0.5) * -12;

            card.style.setProperty('--glow-x', `${(x / rect.width) * 100}%`);
            card.style.setProperty('--glow-y', `${(y / rect.height) * 100}%`);

            gsap.to(card, {
                rotateX: yc,
                rotateY: xc,
                scale: 1.015,
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
    // 8. OPTIMIZED PARTICLES CANVAS BINDING
    // ==========================================
    const canvas = document.getElementById('heroCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = canvas.offsetWidth;
        let height = canvas.height = canvas.offsetHeight;
        let particles = [];
        let isCanvasActive = true;

        // Auto sleeper: pause particle math loops if hero is completely out of viewport
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
                this.vx = (Math.random() - 0.5) * 0.32;
                this.vy = (Math.random() - 0.5) * 0.32;
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
            const count = Math.min(65, Math.floor((width * height) / 12000));
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        }

        function drawLoop() {
            if (!isCanvasActive) return;

            ctx.clearRect(0, 0, width, height);

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(drawLoop);
        }

        initParticles();
        drawLoop();

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
