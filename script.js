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
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

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

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animate);
        }

        animate();
    }
});
