/**
 * StackBuilder API Connector
 * Overrides form handlers to send data to the backend API.
 * Falls back to mailto: if backend is unreachable.
 * 
 * This file does NOT modify any HTML or CSS.
 */

(function () {
    'use strict';

    // Guard against double-load (script is in both <head> and end of <body>)
    if (window.__SB_API_LOADED) return;
    window.__SB_API_LOADED = true;

    // ===== Configuration =====
    // Auto-detect environment: Use localhost for development, or a production URL when deployed
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // TODO: Once you deploy your backend (e.g., on Render), paste its URL here
    const PRODUCTION_API_URL = 'https://a-tech-builder-1.onrender.com/api';

    const API_BASE = isLocalhost
        ? (window.location.port === '5000' ? '/api' : 'http://localhost:5000/api')
        : PRODUCTION_API_URL;

    let backendAvailable = false;

    // ===== Check Backend Availability =====
    async function checkBackend() {
        try {
            const res = await fetch(`${API_BASE}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(3000)
            });
            if (res.ok) {
                backendAvailable = true;
                console.log('✅ StackBuilder API connected');
            }
        } catch {
            backendAvailable = false;
            console.warn('⚠️  StackBuilder API not available — using mailto fallback');
        }
    }

    // ===== Toast Notification System =====
    function showToast(message, type = 'success') {
        // Remove existing toast
        const existing = document.getElementById('sb-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.id = 'sb-toast';

        const colors = {
            success: { bg: 'linear-gradient(135deg, #10b981, #059669)', icon: '✅' },
            error: { bg: 'linear-gradient(135deg, #ef4444, #dc2626)', icon: '❌' },
            loading: { bg: 'linear-gradient(135deg, #3b82f6, #2563eb)', icon: '⏳' }
        };
        const c = colors[type] || colors.success;

        toast.innerHTML = `<span style="margin-right:8px;font-size:16px;">${c.icon}</span>${message}`;
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            padding: '14px 24px',
            background: c.bg,
            color: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            zIndex: '99999',
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            transform: 'translateY(100px)',
            opacity: '0',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            maxWidth: '400px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)'
        });

        document.body.appendChild(toast);
        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
        });

        // Auto-dismiss after 5 seconds (except loading)
        if (type !== 'loading') {
            setTimeout(() => {
                toast.style.transform = 'translateY(100px)';
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 400);
            }, 5000);
        }

        return toast;
    }

    // ===== Override Contact Form =====
    function overrideContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        // Prevent duplicate event listeners
        if (form.dataset.apiBound) return;
        form.dataset.apiBound = 'true';


        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = form.querySelector('#name').value.trim();
            const email = form.querySelector('#email').value.trim();
            const subject = form.querySelector('#subject').value.trim();
            const message = form.querySelector('#message').value.trim();

            if (!name || !email || !message) {
                showToast('Please fill in all required fields.', 'error');
                return;
            }

            // If backend is not available, fallback to mailto
            if (!backendAvailable) {
                const mailtoLink = `mailto:vermaarpit627@gmail.com,anshbnsingh28@gmail.com?subject=${encodeURIComponent(subject || 'Portfolio Contact')}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
                window.open(mailtoLink);
                showToast('Opening email client (backend offline)', 'success');
                return;
            }

            // Show loading state
            const btn = form.querySelector('.form-submit');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px;">⏳ Sending...</span>';
            btn.disabled = true;
            showToast('Sending your message...', 'loading');

            try {
                const res = await fetch(`${API_BASE}/contact`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, subject, message })
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    showToast(data.message || 'Message sent successfully!', 'success');
                    btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px;">✅ Sent!</span>';
                    btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                    form.reset();

                    setTimeout(() => {
                        btn.innerHTML = originalHTML;
                        btn.style.background = '';
                        btn.disabled = false;
                        if (typeof lucide !== 'undefined') lucide.createIcons();
                    }, 3000);
                } else {
                    throw new Error(data.message || 'Failed to send message');
                }

            } catch (err) {
                showToast(err.message || 'Failed to send. Please try again.', 'error');
                btn.innerHTML = originalHTML;
                btn.style.background = '';
                btn.disabled = false;
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        });
    }

    // ===== Override Order Form =====
    function overrideOrderForm() {
        const form = document.getElementById('orderForm');
        if (!form) return;

        // We need to intercept the submit event without breaking step navigation
        // The step navigation buttons use type="button", so they won't trigger submit
        // Only the final submit button triggers form submit

        // Prevent duplicate event listeners
        if (form.dataset.apiBound) return;
        form.dataset.apiBound = 'true';

        // Re-attach service chip selection logic
        const selectedServices = new Set();
        form.querySelectorAll('.service-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                chip.classList.toggle('selected');
                const service = chip.getAttribute('data-service');
                if (selectedServices.has(service)) {
                    selectedServices.delete(service);
                } else {
                    selectedServices.add(service);
                }
            });
        });

        // Re-attach step navigation
        const steps = {
            1: form.querySelector('#orderStep1'),
            2: form.querySelector('#orderStep2'),
            3: form.querySelector('#orderStep3'),
        };

        // Get step indicators from the modal (they're inside the form)
        const stepIndicators = form.querySelectorAll('.form-step');
        const stepLines = form.querySelectorAll('.form-step-line');

        function goToStep(n) {
            Object.values(steps).forEach(s => { if (s) s.classList.add('hidden'); });
            if (steps[n]) steps[n].classList.remove('hidden');

            stepIndicators.forEach((si, i) => {
                if (i + 1 <= n) si.classList.add('active');
                else si.classList.remove('active');
            });
            stepLines.forEach((sl, i) => {
                if (i + 1 < n) sl.classList.add('active');
                else sl.classList.remove('active');
            });

            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        const toStep2Btn = form.querySelector('#toStep2');
        const toStep3Btn = form.querySelector('#toStep3');
        const backToStep1Btn = form.querySelector('#backToStep1');
        const backToStep2Btn = form.querySelector('#backToStep2');

        if (toStep2Btn) {
            toStep2Btn.addEventListener('click', () => {
                if (selectedServices.size === 0) {
                    const chips = form.querySelector('#serviceChips');
                    if (chips) {
                        chips.style.animation = 'shake 0.4s ease';
                        setTimeout(() => chips.style.animation = '', 400);
                    }
                    showToast('Please select at least one service.', 'error');
                    return;
                }
                goToStep(2);
            });
        }

        if (toStep3Btn) toStep3Btn.addEventListener('click', () => goToStep(3));
        if (backToStep1Btn) backToStep1Btn.addEventListener('click', () => goToStep(1));
        if (backToStep2Btn) backToStep2Btn.addEventListener('click', () => goToStep(2));

        // Handle form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const orderData = {
                services: [...selectedServices],
                projectName: (form.querySelector('#orderProjectName')?.value || '').trim(),
                description: (form.querySelector('#orderDescription')?.value || '').trim(),
                budget: form.querySelector('#orderBudget')?.value || '',
                timeline: form.querySelector('#orderTimeline')?.value || '',
                clientName: (form.querySelector('#orderName')?.value || '').trim(),
                clientEmail: (form.querySelector('#orderEmail')?.value || '').trim(),
                clientPhone: (form.querySelector('#orderPhone')?.value || '').trim(),
                extraNotes: (form.querySelector('#orderExtra')?.value || '').trim()
            };

            // Basic validation
            if (orderData.services.length === 0) {
                showToast('Please select at least one service.', 'error');
                return;
            }
            if (!orderData.clientName || !orderData.clientEmail) {
                showToast('Please fill in your name and email.', 'error');
                return;
            }

            // If backend is not available, fallback to mailto
            if (!backendAvailable) {
                const body = `--- PROJECT ORDER ---\n\nServices Needed: ${orderData.services.join(', ')}\nProject Name: ${orderData.projectName}\nDescription: ${orderData.description}\nBudget: ${orderData.budget || 'Not specified'}\nTimeline: ${orderData.timeline || 'Not specified'}\n\n--- CLIENT INFO ---\n\nName: ${orderData.clientName}\nEmail: ${orderData.clientEmail}\nPhone: ${orderData.clientPhone || 'Not provided'}\n\nAdditional Notes: ${orderData.extraNotes || 'None'}`;
                const mailtoLink = `mailto:vermaarpit627@gmail.com,anshbnsingh28@gmail.com?subject=${encodeURIComponent('Project Order: ' + orderData.projectName)}&body=${encodeURIComponent(body)}`;
                window.open(mailtoLink);
                showToast('Opening email client (backend offline)', 'success');
                return;
            }

            // Show loading
            const btn = form.querySelector('#orderSubmitBtn');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px;">⏳ Submitting...</span>';
            btn.disabled = true;
            showToast('Submitting your order...', 'loading');

            try {
                const res = await fetch(`${API_BASE}/orders`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    showToast(data.message || 'Order submitted successfully!', 'success');
                    btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px;">✅ Submitted!</span>';
                    btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';

                    setTimeout(() => {
                        btn.innerHTML = originalHTML;
                        btn.style.background = '';
                        btn.disabled = false;
                        form.reset();
                        selectedServices.clear();
                        form.querySelectorAll('.service-chip').forEach(c => c.classList.remove('selected'));
                        goToStep(1);

                        // Close modal
                        const modal = document.getElementById('orderModal');
                        if (modal) {
                            modal.classList.remove('active');
                            document.body.style.overflow = '';
                        }
                        if (typeof lucide !== 'undefined') lucide.createIcons();
                    }, 2500);
                } else {
                    throw new Error(data.message || 'Failed to submit order');
                }

            } catch (err) {
                showToast(err.message || 'Failed to submit. Please try again.', 'error');
                btn.innerHTML = originalHTML;
                btn.style.background = '';
                btn.disabled = false;
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        });
    }

    // ===== Initialize =====
    async function init() {
        // Wait for DOM to be fully ready
        await checkBackend();
        overrideContactForm();
        overrideOrderForm();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Delay slightly so original inline script runs first
            setTimeout(init, 100);
        });
    } else {
        setTimeout(init, 100);
    }

})();
