/* ===== Mobile Menu Toggle ===== */
const menuToggle = document.getElementById('menuToggle');
const mainMenu = document.getElementById('mainMenu');

if (menuToggle && mainMenu) {
    menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        mainMenu.classList.toggle('open');

        // Prevent body scroll when menu is open
        document.body.style.overflow = !isExpanded ? 'hidden' : '';
    });

    // Close menu when clicking a link
    mainMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.setAttribute('aria-expanded', 'false');
            mainMenu.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mainMenu.classList.contains('open')) {
            menuToggle.setAttribute('aria-expanded', 'false');
            mainMenu.classList.remove('open');
            document.body.style.overflow = '';
            menuToggle.focus();
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (mainMenu.classList.contains('open') &&
            !mainMenu.contains(e.target) &&
            !menuToggle.contains(e.target)) {
            menuToggle.setAttribute('aria-expanded', 'false');
            mainMenu.classList.remove('open');
            document.body.style.overflow = '';
        }
    });
}

/* ===== Smooth anchor scroll ===== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (!id || id === "#") return;
        const el = document.querySelector(id);
        if (!el) return;
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
});

/* ===== Reveal on scroll (About + Why) ===== */
const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add("show");
            io.unobserve(e.target);
        }
    });
}, { threshold: 0.18 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

const wraps = document.querySelectorAll(".card-wrap");
const io2 = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add("show");
            e.target.querySelector(".why-card")?.classList.add("show");
            io2.unobserve(e.target);
        }
    });
}, { threshold: 0.18 });
wraps.forEach(w => io2.observe(w));

/* ===== Circle Parallax (About) ===== */
const circle = document.getElementById('parallaxCircle');
let raf = null;
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
if (circle) {
    circle.addEventListener('mousemove', (ev) => {
        const rect = circle.getBoundingClientRect();
        const x = (ev.clientX - rect.left) / rect.width;
        const y = (ev.clientY - rect.top) / rect.height;
        const rx = clamp((0.5 - y) * 10, -8, 8);
        const ry = clamp((x - 0.5) * 10, -8, 8);
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
            circle.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.01)`;
        });
    });
    circle.addEventListener('mouseleave', () => {
        if (raf) cancelAnimationFrame(raf);
        circle.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)`;
    });
}

/* ===== Highlight pills click animation ===== */
document.querySelectorAll('.pill').forEach(p => {
    p.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault(); p.click();
        }
    });
    p.addEventListener('click', () => {
        p.animate([
            { transform: 'translateY(-6px) scale(1.02)' },
            { transform: 'translateY(-6px) scale(1.06)' },
            { transform: 'translateY(-6px) scale(1.02)' },
        ], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' });
    });
});

/* ===== Universal Carousel System ===== */
class ModernCarousel {
    constructor(config) {
        this.track = document.getElementById(config.trackId);
        this.dotsContainer = document.getElementById(config.dotsId);
        this.prevBtn = document.querySelector(`[data-prev="#${config.trackId}"]`);
        this.nextBtn = document.querySelector(`[data-next="#${config.trackId}"]`);
        this.autoScrollInterval = config.autoScroll || 0;
        this.autoScrollTimer = null;
        this.isPaused = false;

        if (!this.track) return;
        this.init();
    }

    getCards() {
        return [...this.track.children];
    }

    getCardWidth() {
        const cards = this.getCards();
        if (cards.length === 0) return 300;
        return cards[0].getBoundingClientRect().width;
    }

    getGap() {
        const computedStyle = window.getComputedStyle(this.track);
        return parseFloat(computedStyle.gap) || 26;
    }

    getVisibleCards() {
        const cardWidth = this.getCardWidth();
        const gap = this.getGap();
        const trackWidth = this.track.clientWidth;
        return Math.max(1, Math.floor((trackWidth + gap) / (cardWidth + gap)));
    }

    getTotalPages() {
        const cards = this.getCards();
        const visibleCards = this.getVisibleCards();
        return Math.max(1, Math.ceil(cards.length / visibleCards));
    }

    getScrollPerPage() {
        const cardWidth = this.getCardWidth();
        const gap = this.getGap();
        const visibleCards = this.getVisibleCards();
        return visibleCards * (cardWidth + gap);
    }

    getCurrentPage() {
        const scrollPerPage = this.getScrollPerPage();
        return Math.round(this.track.scrollLeft / scrollPerPage);
    }

    scrollToPage(pageIndex) {
        const totalPages = this.getTotalPages();
        const clampedPage = Math.max(0, Math.min(pageIndex, totalPages - 1));
        const scrollPerPage = this.getScrollPerPage();
        this.track.scrollTo({ left: clampedPage * scrollPerPage, behavior: "smooth" });
    }

    goNext() {
        const current = this.getCurrentPage();
        const totalPages = this.getTotalPages();
        const nextPage = current < totalPages - 1 ? current + 1 : 0;
        this.scrollToPage(nextPage);
    }

    goPrev() {
        const current = this.getCurrentPage();
        const totalPages = this.getTotalPages();
        const prevPage = current > 0 ? current - 1 : totalPages - 1;
        this.scrollToPage(prevPage);
    }

    renderDots() {
        if (!this.dotsContainer) return;
        const totalPages = this.getTotalPages();
        const current = this.getCurrentPage();

        this.dotsContainer.innerHTML = "";

        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement("button");
            dot.className = `dot h-2 rounded-full transition-all duration-300 cursor-pointer hover:opacity-80 ${i === current ? "w-6 bg-black/70" : "w-2 bg-black/25"
                }`;
            dot.dataset.i = i;
            dot.setAttribute("aria-label", `Go to page ${i + 1}`);
            dot.addEventListener("click", () => {
                this.scrollToPage(i);
                this.resetAutoScroll();
            });
            this.dotsContainer.appendChild(dot);
        }
    }

    setActiveDot(activeIndex) {
        if (!this.dotsContainer) return;
        const dots = this.dotsContainer.querySelectorAll(".dot");
        dots.forEach((d, idx) => {
            if (idx === activeIndex) {
                d.classList.add("bg-black/70", "w-6");
                d.classList.remove("bg-black/25", "w-2");
            } else {
                d.classList.add("bg-black/25", "w-2");
                d.classList.remove("bg-black/70", "w-6");
            }
        });
    }

    startAutoScroll() {
        if (this.autoScrollInterval <= 0 || this.isPaused) return;
        this.stopAutoScroll();
        this.autoScrollTimer = setInterval(() => {
            if (!this.isPaused) {
                this.goNext();
            }
        }, this.autoScrollInterval);
    }

    stopAutoScroll() {
        if (this.autoScrollTimer) {
            clearInterval(this.autoScrollTimer);
            this.autoScrollTimer = null;
        }
    }

    resetAutoScroll() {
        this.stopAutoScroll();
        this.startAutoScroll();
    }

    init() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener("click", () => {
                this.goPrev();
                this.resetAutoScroll();
            });
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener("click", () => {
                this.goNext();
                this.resetAutoScroll();
            });
        }

        let rafId;
        this.track.addEventListener("scroll", () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => this.setActiveDot(this.getCurrentPage()));
        });

        let resizeTimer;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => this.renderDots(), 150);
        });

        if (this.autoScrollInterval > 0) {
            this.track.addEventListener("mouseenter", () => { this.isPaused = true; });
            this.track.addEventListener("mouseleave", () => { this.isPaused = false; });

            [this.prevBtn, this.nextBtn].forEach(btn => {
                if (btn) {
                    btn.addEventListener("mouseenter", () => { this.isPaused = true; });
                    btn.addEventListener("mouseleave", () => { this.isPaused = false; });
                }
            });
        }

        this.renderDots();
        this.startAutoScroll();
    }
}

// Initialize all carousels
const packetCarousel = new ModernCarousel({
    trackId: "trackPacket",
    dotsId: "packetDots",
    autoScroll: 5000
});

const carCarousel = new ModernCarousel({
    trackId: "trackCar",
    dotsId: "carDots",
    autoScroll: 6000
});

const galleryCarousel = new ModernCarousel({
    trackId: "galleryRail",
    dotsId: "galleryDots",
    autoScroll: 4000
});

