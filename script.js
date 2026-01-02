// --- Portfolio System Logic ---

document.addEventListener('DOMContentLoaded', () => {
    initXP();
    initParticles();
    initScrollAnimations();
    initTypewriter();
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
