// --- Portfolio System Logic ---

document.addEventListener('DOMContentLoaded', () => {
    initXP();
    initParticles();
    initScrollAnimations();
    initTypewriter();
    initSpotlight();
    initCursor();
    initScramble();
    initTilt();
});

// --- Intersection Observer for Scroll Animations ---
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                entry.target.classList.remove('opacity-0'); // removing the initial opacity hide
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        el.style.animationPlayState = 'paused'; // pause initially
        el.classList.add('animate-fade-in'); // ensure class is there
        el.classList.add('opacity-0'); // start hidden
        observer.observe(el);
    });
}

// --- Typewriter Effect ---
function initTypewriter() {
    const el = document.querySelector('.typewriter');
    if (el) {
        const text = el.getAttribute('data-text');
        el.innerText = '';
        let i = 0;

        function type() {
            if (i < text.length) {
                el.innerText += text.charAt(i);
                i++;
                setTimeout(type, 100); // Typing speed
            } else {
                el.classList.remove('border-r-2'); // Remove caret after typing
            }
        }

        // Start after a slight delay
        setTimeout(type, 500);
    }
}


// --- XP System ---
let currentXP = 0;

function initXP() {
    // Check if XP is stored in session to persist across reloads (optional simulation)
    const storedXP = sessionStorage.getItem('system_xp');
    if (storedXP) {
        currentXP = parseInt(storedXP);
        updateDisplay(currentXP, false);
    }

    // Global exposure for inline HTML calls (legacy support or ease of use)
    window.addXP = addXP;
    window.burstEffect = burstEffect;
}

function updateDisplay(value, animate = true) {
    const xpDisplay = document.getElementById('xp-counter');
    if (!xpDisplay) return;

    xpDisplay.innerText = value.toString().padStart(5, '0');

    if (animate) {
        xpDisplay.classList.add('text-neon-green');
        setTimeout(() => xpDisplay.classList.remove('text-neon-green'), 200);
    }
}

function addXP(amount) {
    const targetXP = currentXP + amount;
    const increment = Math.max(1, Math.ceil(amount / 20));

    const timer = setInterval(() => {
        if (currentXP < targetXP) {
            currentXP += increment;
            if (currentXP > targetXP) currentXP = targetXP;
            updateDisplay(currentXP, true);
        } else {
            clearInterval(timer);
            sessionStorage.setItem('system_xp', currentXP);
        }
    }, 10);
}


// --- Click Burst Effect ---
function burstEffect(e) {
    // If e is not a mouse event (e.g. forced call), minimal fallback
    const x = e.clientX || window.innerWidth / 2;
    const y = e.clientY || window.innerHeight / 2;

    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.classList.add('burst-particle');
        document.body.appendChild(particle);

        const size = Math.random() * 4 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;

        const angle = (i / 12) * 360;
        const radius = Math.random() * 50 + 20;
        const tx = Math.cos(angle * Math.PI / 180) * radius;
        const ty = Math.sin(angle * Math.PI / 180) * radius;

        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);

        setTimeout(() => particle.remove(), 800);
    }
}

// --- Dynamic Particle Background ---
function initParticles() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    let particles = [];
    const particleCount = 70;

    class Particle {
        constructor() {
            this.reset();
            this.x = Math.random() * canvas.width; // Random start pos
            this.y = Math.random() * canvas.height;
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5; // Slightly larger
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            // Gold (#ffd700) or Cyan (#00f3ff)
            this.color = Math.random() > 0.6 ? '#00f3ff' : '#ffd700';
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Wrap around screen
            if (this.x > canvas.width) this.x = 0;
            else if (this.x < 0) this.x = canvas.width;

            if (this.y > canvas.height) this.y = 0;
            else if (this.y < 0) this.y = canvas.height;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animateBg() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.update();
            p.draw();

            // Connect lines
            for (let j = i; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 100) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0, 243, 255, ${1 - dist / 100})`; // Fade out with distance
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animateBg);
    }

    animateBg();
}

// --- Mouse Spotlight ---
function initSpotlight() {
    const spotlight = document.getElementById('spotlight');
    if (!spotlight) return;

    window.addEventListener('mousemove', e => {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;

        spotlight.style.setProperty('--mouse-x', `${x}%`);
        spotlight.style.setProperty('--mouse-y', `${y}%`);
    });
}

// --- Custom Cursor ---
function initCursor() {
    const cursor = document.getElementById('cursor');
    const cursorDot = document.getElementById('cursor-dot');
    if (!cursor || !cursorDot) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    window.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Instant dot movement
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    });

    // Lerp for outer ring
    function animateCursor() {
        const distX = mouseX - cursorX;
        const distY = mouseY - cursorY;

        cursorX += distX * 0.2;
        cursorY += distY * 0.2;

        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effects
    const hoverTargets = document.querySelectorAll('.hover-trigger');
    hoverTargets.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('scale-150', 'bg-neon-blue/10', 'border-fintech-gold');
            cursor.classList.remove('border-neon-blue');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('scale-150', 'bg-neon-blue/10', 'border-fintech-gold');
            cursor.classList.add('border-neon-blue');
        });
    });
}

// --- Hacker Text Scramble ---
function initScramble() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

    // Scramble on load
    const elements = document.querySelectorAll('.data-scramble');

    elements.forEach(el => {
        const originalText = el.innerText;
        let iterations = 0;

        // Wait for element to be visible
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Start scramble
                    const interval = setInterval(() => {
                        el.innerText = originalText
                            .split("")
                            .map((letter, index) => {
                                if (index < iterations) {
                                    return originalText[index];
                                }
                                return letters[Math.floor(Math.random() * 26)];
                            })
                            .join("");

                        if (iterations >= originalText.length) {
                            clearInterval(interval);
                            el.innerText = originalText; // Ensure final text is clean
                        }

                        iterations += 1 / 3; // Speed
                    }, 30);

                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(el);
    });
}

// --- 3D Card Tilt ---
function initTilt() {
    const cards = document.querySelectorAll('.tilt-card');

    cards.forEach(card => {
        // Add glare element
        const glare = document.createElement('div');
        glare.classList.add('tilt-glare');
        card.appendChild(glare);

        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate center
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Normalize (-1 to 1)
            const rotateX = ((y - centerY) / centerY) * -10; // Invert Y for correct tilt 
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

            // Glare effect
            glare.style.opacity = '1';
            glare.style.transform = `translate(${x}px, ${y}px)`; // Simple follow for now, or gradient shift
            glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.2), transparent 40%)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            glare.style.opacity = '0';
        });
    });
}

// --- Profile Tabs ---
window.switchTab = function (tabId) {
    // Hide all contents
    document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('active');
    });

    // Deactivate all buttons
    document.querySelectorAll('.tab-btn').forEach(el => {
        el.classList.remove('active', 'text-fintech-gold');
        el.classList.add('text-slate-500');
    });

    // Show target content
    const target = document.getElementById(tabId);
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('active', 'animate-fade-in');
    }

    // Activate target button
    const btn = event.currentTarget;
    if (btn) {
        btn.classList.add('active', 'text-fintech-gold');
        btn.classList.remove('text-slate-500');
    }
}
