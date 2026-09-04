/**
 * CLAEX UNLUMEN UI PRIMITIVES & INTERACTIVE EFFECTS
 * Inspired by leovvx/unlumen-ui-docs & Lando Norris micro-interactions
 */

(function () {
    'use strict';

    // 1. SPOTLIGHT CARD EFFECT (unlumen-ui Spotlight Card)
    function initSpotlightCards() {
        const cards = document.querySelectorAll('.spotlight-card');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    }

    // 2. CUSTOM TELEMETRY CURSOR
    function initCustomCursor() {
        // Skip on mobile/touch screens
        if (window.matchMedia('(pointer: coarse)').matches) return;

        const cursorDot = document.createElement('div');
        cursorDot.className = 'telemetry-cursor-dot';
        const cursorRing = document.createElement('div');
        cursorRing.className = 'telemetry-cursor-ring';

        document.body.appendChild(cursorDot);
        document.body.appendChild(cursorRing);

        let mouseX = -100, mouseY = -100;
        let ringX = -100, ringY = -100;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        });

        function renderRing() {
            ringX += (mouseX - ringX) * 0.18;
            ringY += (mouseY - ringY) * 0.18;
            cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
            requestAnimationFrame(renderRing);
        }
        renderRing();

        // Expand ring on interactive elements
        const interactiveSelectors = 'a, button, input, select, .interactive, .spotlight-card, .btn-action';
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(interactiveSelectors)) {
                cursorRing.classList.add('active');
            }
        });
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(interactiveSelectors)) {
                cursorRing.classList.remove('active');
            }
        });
    }

    // 3. UNLUMEN SCHEDULE SIMULATOR WIDGET
    function initScheduleSimulator() {
        const container = document.getElementById('claex-interactive-simulator');
        if (!container) return;

        const slots = container.querySelectorAll('.sim-slot');
        const telemetryStatus = container.querySelector('#sim-telemetry-status');
        const telemetryLog = container.querySelector('#sim-telemetry-log');
        const solveBtn = container.querySelector('#sim-solve-btn');

        slots.forEach(slot => {
            slot.addEventListener('click', () => {
                const isConflict = slot.classList.contains('conflict');
                if (isConflict) {
                    // Resolve conflict
                    slot.classList.remove('conflict');
                    slot.classList.add('resolved');
                    slot.innerHTML = `<span class="slot-badge">OK</span> ${slot.dataset.subject} <small>[0 CONFLITO]</small>`;
                    if (telemetryStatus) {
                        telemetryStatus.textContent = 'GRADE EQUILIBRADA // 100% OTIMIZADO';
                        telemetryStatus.style.color = '#D2FF00';
                    }
                    if (telemetryLog) {
                        telemetryLog.textContent = `[SOLVED] Conflito em ${slot.dataset.day} ${slot.dataset.time} resolvido automaticamente pelo motor CLAEX.`;
                    }
                } else if (slot.classList.contains('resolved')) {
                    // Reset to normal
                    slot.classList.remove('resolved');
                    slot.innerHTML = `<span class="slot-badge">LIVRE</span> ${slot.dataset.subject}`;
                } else {
                    // Create simulated conflict
                    slot.classList.add('conflict');
                    slot.innerHTML = `<span class="slot-badge">CHOQUE!</span> ${slot.dataset.subject} <small>Prof. Ocupado</small>`;
                    if (telemetryStatus) {
                        telemetryStatus.textContent = 'ALERTA: CHOQUE DE HORÁRIOS DETECTADO';
                        telemetryStatus.style.color = '#FF3B30';
                    }
                    if (telemetryLog) {
                        telemetryLog.textContent = `[CONFLITO] Professor já alocado em outra instituição simultaneamente neste período.`;
                    }
                }
            });
        });

        if (solveBtn) {
            solveBtn.addEventListener('click', () => {
                const conflicts = container.querySelectorAll('.sim-slot.conflict');
                conflicts.forEach(slot => {
                    slot.classList.remove('conflict');
                    slot.classList.add('resolved');
                    slot.innerHTML = `<span class="slot-badge">OK</span> ${slot.dataset.subject} <small>[0 CONFLITO]</small>`;
                });
                if (telemetryStatus) {
                    telemetryStatus.textContent = 'MOTOR CLAEX: TODOS OS CONFLITOS RESOLVIDOS';
                    telemetryStatus.style.color = '#D2FF00';
                }
                if (telemetryLog) {
                    telemetryLog.textContent = '[AUTO-SYNC] Algoritmo redistribuiu cargas horárias entre instituições com sucesso em 12ms.';
                }
            });
        }
    }

    // 4. GLOBAL NAVIGATION DRAWER & ACCESSIBILITY
    function initNavigation() {
        const bars = document.querySelectorAll('.bars, .menu-icon, #menuToggle');
        const sideMenu = document.querySelector('#side-menu');
        const overlay = document.querySelector('.menu-overlay');

        function toggleMenu() {
            if (sideMenu) {
                sideMenu.classList.toggle('open');
                if (overlay) overlay.classList.toggle('open');
            }
        }

        bars.forEach(bar => bar.addEventListener('click', toggleMenu));

        if (overlay) {
            overlay.addEventListener('click', () => {
                if (sideMenu) sideMenu.classList.remove('open');
                overlay.classList.remove('open');
            });
        }

        const closeMenu = document.querySelector('.close-menu');
        if (closeMenu) {
            closeMenu.addEventListener('click', () => {
                if (sideMenu) sideMenu.classList.remove('open');
                if (overlay) overlay.classList.remove('open');
            });
        }
    }

    // Initialize all modules
    document.addEventListener('DOMContentLoaded', () => {
        initSpotlightCards();
        initCustomCursor();
        initScheduleSimulator();
        initNavigation();
    });
})();

