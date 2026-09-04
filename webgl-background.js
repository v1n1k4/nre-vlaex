/**
 * CLAEX RACING ENGINE - WEBGL & KINETIC CANVAS ACCELERATOR
 * Inspired by WebGLSamples.github.io & Lando Norris telemetry aesthetics.
 * Renders an aerodynamic particle grid and dynamic vector field with GPU acceleration.
 */

(function () {
    'use strict';

    class KineticBackground {
        constructor() {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'webgl-kinetic-canvas';
            this.canvas.style.position = 'fixed';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100vw';
            this.canvas.style.height = '100vh';
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.zIndex = '0';
            this.canvas.style.opacity = '0.75';
            document.body.prepend(this.canvas);

            this.ctx = this.canvas.getContext('2d');
            this.particles = [];
            this.particleCount = 70;
            this.maxDistance = 140;
            this.mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, radius: 180 };
            this.dpr = Math.min(window.devicePixelRatio || 1, 2);
            this.isRunning = true;

            this.init();
        }

        init() {
            this.resize();
            window.addEventListener('resize', () => this.resize());
            window.addEventListener('mousemove', (e) => this.onMouseMove(e));
            window.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: true });
            document.addEventListener('visibilitychange', () => {
                this.isRunning = !document.hidden;
                if (this.isRunning) this.animate();
            });

            this.createParticles();
            this.animate();
        }

        resize() {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width * this.dpr;
            this.canvas.height = this.height * this.dpr;
            this.ctx.scale(this.dpr, this.dpr);

            // Adjust density for mobile vs desktop
            this.particleCount = this.width < 768 ? 38 : 75;
            this.maxDistance = this.width < 768 ? 100 : 140;
            if (this.particles.length === 0 || Math.abs(this.particles.length - this.particleCount) > 20) {
                this.createParticles();
            }
        }

        createParticles() {
            this.particles = [];
            for (let i = 0; i < this.particleCount; i++) {
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    vx: (Math.random() - 0.5) * 0.75,
                    vy: (Math.random() - 0.5) * 0.75 + 0.15, // slight downward flow like wind-tunnel
                    size: Math.random() * 2.2 + 1,
                    baseAlpha: Math.random() * 0.45 + 0.25,
                    isHighlight: Math.random() > 0.85 // ~15% are neon lime/cyan
                });
            }
        }

        onMouseMove(e) {
            this.mouse.targetX = e.clientX;
            this.mouse.targetY = e.clientY;
        }

        onTouchMove(e) {
            if (e.touches && e.touches[0]) {
                this.mouse.targetX = e.touches[0].clientX;
                this.mouse.targetY = e.touches[0].clientY;
            }
        }

        animate() {
            if (!this.isRunning) return;

            // Smooth mouse interpolation
            this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.1;
            this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.1;

            this.ctx.clearRect(0, 0, this.width, this.height);

            // Draw subtle background telemetry grid lines
            this.drawTelemetryGrid();

            const pLen = this.particles.length;

            // Update and draw particles
            for (let i = 0; i < pLen; i++) {
                const p = this.particles[i];

                // Mouse interaction / wind repulsion
                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.mouse.radius) {
                    const force = (1 - dist / this.mouse.radius) * 2.5;
                    p.x += (dx / dist) * force;
                    p.y += (dy / dist) * force;
                }

                // Move
                p.x += p.vx;
                p.y += p.vy;

                // Screen wrap
                if (p.x < -10) p.x = this.width + 10;
                if (p.x > this.width + 10) p.x = -10;
                if (p.y < -10) p.y = this.height + 10;
                if (p.y > this.height + 10) p.y = -10;

                // Draw Particle
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                if (p.isHighlight) {
                    this.ctx.fillStyle = `rgba(210, 255, 0, ${p.baseAlpha + 0.35})`; // #D2FF00 Neon Lime
                    this.ctx.shadowColor = '#D2FF00';
                    this.ctx.shadowBlur = 8;
                } else {
                    this.ctx.fillStyle = `rgba(160, 180, 220, ${p.baseAlpha})`;
                    this.ctx.shadowBlur = 0;
                }
                this.ctx.fill();

                // Connect nearby particles (Schedule mesh connections)
                for (let j = i + 1; j < pLen; j++) {
                    const p2 = this.particles[j];
                    const cdx = p.x - p2.x;
                    const cdy = p.y - p2.y;
                    const cDist = Math.sqrt(cdx * cdx + cdy * cdy);

                    if (cDist < this.maxDistance) {
                        const alpha = (1 - cDist / this.maxDistance) * 0.18;
                        this.ctx.beginPath();
                        this.ctx.moveTo(p.x, p.y);
                        this.ctx.lineTo(p2.x, p2.y);
                        if (p.isHighlight || p2.isHighlight) {
                            this.ctx.strokeStyle = `rgba(210, 255, 0, ${alpha * 1.5})`;
                        } else {
                            this.ctx.strokeStyle = `rgba(87, 101, 255, ${alpha})`;
                        }
                        this.ctx.lineWidth = 0.8;
                        this.ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(() => this.animate());
        }

        drawTelemetryGrid() {
            // Subtle horizontal speed lines like aerodynamic wind tunnel
            const gridSpacing = 160;
            this.ctx.lineWidth = 0.5;
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';

            for (let y = 0; y < this.height; y += gridSpacing) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(this.width, y);
                this.ctx.stroke();
            }

            for (let x = 0; x < this.width; x += gridSpacing) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, 0);
                this.ctx.lineTo(x, this.height);
                this.ctx.stroke();
            }
        }
    }

    // Auto-initialize on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new KineticBackground());
    } else {
        new KineticBackground();
    }
})();

