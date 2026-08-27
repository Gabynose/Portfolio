document.addEventListener('DOMContentLoaded', () => {
    const carousels = document.querySelectorAll('.project-carousel');

    carousels.forEach(carousel => {
        const images = carousel.querySelectorAll('.carousel-image');
        const prevBtn = carousel.querySelector('.prev-btn');
        const nextBtn = carousel.querySelector('.next-btn');
        let currentIndex = 0;

        function showImage(index) {
            images.forEach((img, i) => {
                img.classList.toggle('active', i === index);
            });
        }

        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            showImage(currentIndex);
        });

        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % images.length;
            showImage(currentIndex);
        });
    });

    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });

    const sections = document.querySelectorAll('section, header[id]');
    const navLinksAll = document.querySelectorAll('.nav-links a');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinksAll.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' });

    sections.forEach(section => sectionObserver.observe(section));

    const projectCards = document.querySelectorAll('.projects-track .project-card');
    const projectDots = document.querySelector('.project-dots');
    const prevProjectBtn = document.querySelector('.project-nav-prev');
    const nextProjectBtn = document.querySelector('.project-nav-next');
    let currentProject = 0;

    projectCards.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.classList.add('project-dot');
        if (i === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', `Proyecto ${i + 1}`);
        dot.addEventListener('click', () => showProject(i));
        projectDots.appendChild(dot);
    });

    function showProject(index) {
        projectCards.forEach((card, i) => {
            card.classList.toggle('active', i === index);
        });
        projectDots.querySelectorAll('.project-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        currentProject = index;
    }

    prevProjectBtn.addEventListener('click', () => {
        showProject((currentProject - 1 + projectCards.length) % projectCards.length);
    });

    nextProjectBtn.addEventListener('click', () => {
        showProject((currentProject + 1) % projectCards.length);
    });

    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const particleCount = 50;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const NAV_HEIGHT = 54;
        const SHIP_SPEED = 180;
        const BOOST_SPEED = 400;
        const SHIP_SIZE = 32;
        const SMOOTH = 0.08;
        const ANGLE_SMOOTH = 0.1;
        const COLLISION_SELECTOR = '.project-card.active, .about-text, .about-actions, .hero-social-links';

        let ship = {
            x: 0, y: 0,
            vx: 0, vy: 0,
            angle: -Math.PI / 2,
            size: SHIP_SIZE,
            moving: false,
            hasMoved: false,
            lastBoost: -4000,
            shakeFrames: 0
        };

        let keys = {};

        let lastWheelTime = 0;
        window.addEventListener('wheel', () => {
            lastWheelTime = performance.now();
        }, { passive: true });

        function getPageHeight() {
            return Math.max(
                document.body.scrollHeight,
                document.body.offsetHeight,
                document.documentElement.scrollHeight,
                document.documentElement.offsetHeight
            );
        }

        function wrapAngle(a) {
            return ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        }

        function lerpAngle(from, to, t) {
            let diff = wrapAngle(to - from);
            if (diff > Math.PI) diff -= Math.PI * 2;
            return from + diff * t;
        }

        document.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
        document.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

        // Attachment system
        let attachments = [];

        function addAttachment(element, offsetX, offsetY) {
            const att = { element, offsetX, offsetY };
            attachments.push(att);
            return att;
        }

        function removeAttachment(element) {
            attachments = attachments.filter(a => a.element !== element);
        }

        function updateAttachments() {
            const scrollY = window.scrollY;
            attachments.forEach(att => {
                const vpX = ship.x + att.offsetX;
                const vpY = (ship.y - scrollY) + att.offsetY;
                att.element.style.left = vpX + 'px';
                att.element.style.top = vpY + 'px';
            });
        }

        // WASD Hint
        let wasdHint = null;
        let wasdShowTimer = null;
        let wasdHideTimer = null;
        let wasdCycleTimer = null;

        function createWasdHint() {
            const hint = document.createElement('div');
            hint.className = 'wasd-hint';
            hint.innerHTML =
                '<div class="wasd-row"><div class="wasd-key">W</div></div>' +
                '<div class="wasd-row">' +
                    '<div class="wasd-key">A</div>' +
                    '<div class="wasd-key">S</div>' +
                    '<div class="wasd-key">D</div>' +
                '</div>';
            document.body.appendChild(hint);
            return hint;
        }

        function startHintCycle() {
            clearTimeout(wasdShowTimer);
            clearTimeout(wasdHideTimer);
            clearTimeout(wasdCycleTimer);
            if (ship.hasMoved) return;
            wasdShowTimer = setTimeout(() => {
                if (ship.hasMoved || !wasdHint) return;
                showHint();
            }, 2000);
        }

        function showHint() {
            if (ship.hasMoved || !wasdHint) return;
            wasdHint.classList.add('visible');
            wasdHideTimer = setTimeout(() => {
                if (!wasdHint) return;
                wasdHint.classList.remove('visible');
                wasdCycleTimer = setTimeout(() => {
                    if (!ship.hasMoved) startHintCycle();
                }, 15000);
            }, 5000);
        }

        function stopHintCycle() {
            clearTimeout(wasdShowTimer);
            clearTimeout(wasdHideTimer);
            clearTimeout(wasdCycleTimer);
            if (wasdHint) wasdHint.classList.remove('visible');
        }

        // Boost cooldown indicator
        let boostIndicator = null;
        let boostIndicatorAnim = null;

        function removeBoostIndicator() {
            if (boostIndicator) {
                removeAttachment(boostIndicator);
                boostIndicator.remove();
                boostIndicator = null;
            }
            if (boostIndicatorAnim) {
                cancelAnimationFrame(boostIndicatorAnim);
                boostIndicatorAnim = null;
            }
        }

        function createBoostIndicator() {
            removeBoostIndicator();
            const COOLDOWN = 3000;
            const SVG_SIZE = 24;
            const CENTER = SVG_SIZE / 2;
            const RADIUS = 9;
            const STROKE = 2;
            const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

            const el = document.createElement('div');
            el.className = 'boost-indicator';
            el.innerHTML =
                '<svg width="' + SVG_SIZE + '" height="' + SVG_SIZE + '" viewBox="0 0 ' + SVG_SIZE + ' ' + SVG_SIZE + '">' +
                    '<circle cx="' + CENTER + '" cy="' + CENTER + '" r="' + RADIUS + '" ' +
                        'fill="none" stroke="rgba(200,200,200,0.2)" stroke-width="' + STROKE + '"/>' +
                    '<circle cx="' + CENTER + '" cy="' + CENTER + '" r="' + RADIUS + '" ' +
                        'class="boost-progress" ' +
                        'fill="none" stroke="#e8e8e8" stroke-width="' + STROKE + '" ' +
                        'stroke-dasharray="' + CIRCUMFERENCE + '" ' +
                        'stroke-dashoffset="' + CIRCUMFERENCE + '" ' +
                        'stroke-linecap="round" ' +
                        'transform="rotate(-90 ' + CENTER + ' ' + CENTER + ')"/>' +
                '</svg>';
            document.body.appendChild(el);
            boostIndicator = el;

            const circle = el.querySelector('.boost-progress');
            const startTime = performance.now();

            addAttachment(el, -(SVG_SIZE / 2), -(ship.size / 2 + SVG_SIZE / 2 + 20));

            function animateProgress(now) {
                if (!boostIndicator) return;
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / COOLDOWN, 1);
                circle.setAttribute('stroke-dashoffset', CIRCUMFERENCE * (1 - progress));

                if (progress < 1) {
                    boostIndicatorAnim = requestAnimationFrame(animateProgress);
                } else {
                    boostIndicatorAnim = null;
                    el.classList.add('fade-out');
                    setTimeout(() => {
                        removeBoostIndicator();
                    }, 500);
                }
            }

            boostIndicatorAnim = requestAnimationFrame(animateProgress);
        }

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 6 + 2;
                this.speedY = Math.random() * 0.5 + 0.2;
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.opacity = Math.random() * 0.4 + 0.1;
                this.isSquare = Math.random() > 0.5;
            }

            update() {
                this.y -= this.speedY;
                this.x += this.speedX;

                if (this.y < -10) {
                    this.y = canvas.height + 10;
                    this.x = Math.random() * canvas.width;
                }
            }

            draw() {
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                if (this.isSquare) {
                    ctx.fillRect(
                        Math.floor(this.x / 4) * 4,
                        Math.floor(this.y / 4) * 4,
                        this.size,
                        this.size
                    );
                } else {
                    ctx.fillRect(
                        Math.floor(this.x / 4) * 4,
                        Math.floor(this.y / 4) * 4,
                        this.size,
                        this.size * 0.6
                    );
                }
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        let shootingStars = [];
        let nextStarTime = performance.now() + 3000;

        function spawnShootingStar() {
            const angle = Math.PI * 0.05 + Math.random() * Math.PI * 0.1;
            const speed = 8 + Math.random() * 5;
            const length = 90 + Math.random() * 60;
            const startX = Math.random() * canvas.width;
            const startY = -20 - Math.random() * canvas.height * 0.2;
            shootingStars.push({
                x: startX,
                y: startY,
                angle,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                length,
                life: 1,
                fade: 0.015 + Math.random() * 0.01
            });
        }

        function updateAndDrawShootingStars() {
            const now = performance.now();
            if (now >= nextStarTime) {
                spawnShootingStar();
                nextStarTime = now + 4000 + Math.random() * 5000;
            }

            shootingStars = shootingStars.filter(star => star.life > 0);

            shootingStars.forEach(star => {
                star.x += star.vx;
                star.y += star.vy;

                ctx.save();
                ctx.translate(star.x, star.y);
                ctx.rotate(star.angle);
                const grad = ctx.createLinearGradient(0, 0, -star.length, 0);
                grad.addColorStop(0, `rgba(255,255,255,${star.life})`);
                grad.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = grad;
                ctx.fillRect(-star.length, -1.5, star.length, 3);
                ctx.restore();

                star.life -= star.fade;
            });
        }

        function updateShip() {
            let scrollY = window.scrollY;

            if (ship.x === 0 && ship.y === 0) {
                const socialLinks = document.querySelector('.hero-social-links');
                if (socialLinks) {
                    const slRect = socialLinks.getBoundingClientRect();
                    ship.x = slRect.right + 30 + ship.size / 2;
                    ship.y = scrollY + slRect.top + slRect.height / 2;
                } else {
                    ship.x = window.innerWidth / 2;
                    ship.y = scrollY + window.innerHeight / 2;
                }
                wasdHint = createWasdHint();
                requestAnimationFrame(() => {
                    addAttachment(wasdHint, -(wasdHint.offsetWidth / 2), ship.size / 2 + 24);
                });
                startHintCycle();
            }

            let dx = 0, dy = 0;
            if (keys['w'] || keys['arrowup']) dy = -1;
            if (keys['s'] || keys['arrowdown']) dy = 1;
            if (keys['a'] || keys['arrowleft']) dx = -1;
            if (keys['d'] || keys['arrowright']) dx = 1;

            if (dx !== 0 && dy !== 0) {
                const inv = 1 / Math.sqrt(2);
                dx *= inv;
                dy *= inv;
            }

            ship.boosting = false;
            if (keys['shift'] && (dx !== 0 || dy !== 0)) {
                const now = performance.now();
                if (now - ship.lastBoost >= 3000) {
                    ship.lastBoost = now;
                    ship.boosting = true;
                    ship.shakeFrames = 8;
                    const boostDirX = dx !== 0 ? dx / Math.abs(dx) : 0;
                    const boostDirY = dy !== 0 ? dy / Math.abs(dy) : 0;
                    ship.vx += boostDirX * BOOST_SPEED;
                    ship.vy += boostDirY * BOOST_SPEED;
                    createBoostIndicator();
                }
            }

            const tvx = dx * SHIP_SPEED;
            const tvy = dy * SHIP_SPEED;

            ship.vx += (tvx - ship.vx) * SMOOTH;
            ship.vy += (tvy - ship.vy) * SMOOTH;

            if (Math.abs(ship.vx) < 0.5) ship.vx = 0;
            if (Math.abs(ship.vy) < 0.5) ship.vy = 0;

            ship.x += ship.vx * (1 / 60);
            ship.y += ship.vy * (1 / 60);

            ship.moving = ship.vx !== 0 || ship.vy !== 0;

            if (ship.moving && !ship.hasMoved) {
                ship.hasMoved = true;
                stopHintCycle();
            }

            if (ship.moving) {
                const targetAngle = Math.atan2(ship.vy, ship.vx);
                ship.angle = lerpAngle(ship.angle, targetAngle, ANGLE_SMOOTH);
            }

            const half = ship.size / 2;
            ship.x = Math.max(half, Math.min(window.innerWidth - half, ship.x));
            ship.y = Math.max(NAV_HEIGHT + half, Math.min(getPageHeight() - half, ship.y));

            const vh = window.innerHeight;
            const vpY = ship.y - scrollY;
            const userScrolling = performance.now() - lastWheelTime < 500;
            if (ship.moving && !userScrolling) {
                if (vpY > vh * 0.8) {
                    window.scrollTo(0, ship.y - vh * 0.65);
                } else if (vpY < vh * 0.2) {
                    window.scrollTo(0, ship.y - vh * 0.35);
                }
            }

            const elements = document.querySelectorAll(COLLISION_SELECTOR);
            elements.forEach(el => {
                const origTransform = el.style.transform;
                el.style.transform = 'none';
                const er = el.getBoundingClientRect();
                el.style.transform = origTransform;

                const overlaps =
                    ship.x - half < er.right &&
                    ship.x + half > er.left &&
                    (ship.y - scrollY) - half < er.bottom &&
                    (ship.y - scrollY) + half > er.top;

                el.style.opacity = overlaps ? '0.15' : '';
                el.style.transition = 'opacity 0.3s ease';
            });

            if (ship.shakeFrames > 0) ship.shakeFrames--;
        }

        function drawShip() {
            const scrollY = window.scrollY;
            const vpX = ship.x;
            const vpY = ship.y - scrollY;

            if (vpY < -50 || vpY > canvas.height + 50) return;

            const s = ship.size / 4;
            ctx.save();
            ctx.translate(vpX, vpY);
            ctx.rotate(ship.angle + Math.PI / 2);

            ctx.fillStyle = '#e8e8e8';
            ctx.fillRect(-s, -2 * s, s * 2, s);
            ctx.fillRect(-s * 1.5, -s, s * 3, s);
            ctx.fillRect(-s * 1.5, 0, s * 3, s);
            ctx.fillRect(-s * 2, s, s * 4, s);
            ctx.fillRect(-s * 2.5, 2 * s, s * 5, s);

            ctx.fillStyle = '#b0b0b0';
            ctx.fillRect(-s * 2, s, s, s);
            ctx.fillRect(s, s, s, s);
            ctx.fillRect(-s * 2.5, 2 * s, s, s);
            ctx.fillRect(s * 1.5, 2 * s, s, s);

            const t = Date.now() / 150;
            const pulse = 0.3 + Math.sin(t) * 0.1;
            const recentBoost = performance.now() - ship.lastBoost < 500;
            const glow = recentBoost ? 0.7 : ship.moving ? pulse + 0.1 : 0.12;
            ctx.fillStyle = `rgba(200, 200, 200, ${glow})`;
            ctx.fillRect(-s * 1.5, 3 * s, s * 3, s);
            ctx.fillStyle = `rgba(200, 200, 200, ${glow * 0.5})`;
            ctx.fillRect(-s, 4 * s, s * 2, s);

            ctx.restore();
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            updateAndDrawShootingStars();
            updateShip();
            updateAttachments();
            if (ship.shakeFrames > 0) {
                const intensity = ship.shakeFrames * 0.8;
                ctx.save();
                ctx.translate(
                    (Math.random() - 0.5) * intensity,
                    (Math.random() - 0.5) * intensity
                );
            }
            drawShip();
            if (ship.shakeFrames > 0) {
                ctx.restore();
            }
            requestAnimationFrame(animate);
        }

        animate();
    }
});
