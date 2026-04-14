/**
 * stackbuilder-api.js
 * Portfolio/assets/js/stackbuilder-api.js
 */

(function () {
    const API_BASE = 'http://localhost:5000';
    
    // ─── Button helpers ───────────────────────────────────────────────────────
    function setBtnState(btn, text, bg, disabled) {
        btn.innerHTML = text;
        btn.style.background = bg;
        btn.disabled = disabled;
        if (window.lucide) lucide.createIcons();
    }

    function resetBtn(btn, originalHTML) {
        btn.innerHTML = originalHTML;
        btn.style.background = '';
        btn.disabled = false;
        if (window.lucide) lucide.createIcons();
    }

    // ─── CONTACT FORM ─────────────────────────────────────────────────────────
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const fresh = contactForm.cloneNode(true);
        contactForm.parentNode.replaceChild(fresh, contactForm);

        fresh.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = fresh.querySelector('.form-submit');
            const originalHTML = btn.innerHTML;

            setBtnState(btn, '⏳ Sending...', 'linear-gradient(135deg,#6366f1,#8b5cf6)', true);

            const payload = {
                name: fresh.querySelector('#name').value.trim(),
                email: fresh.querySelector('#email').value.trim(),
                subject: fresh.querySelector('#subject').value.trim(),
                message: fresh.querySelector('#message').value.trim(),
            };

            try {
                const res = await fetch(`${API_BASE}/api/contact`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                const data = await res.json();

                if (data.success) {
                    setBtnState(btn, '✅ Message Sent!', 'linear-gradient(135deg,#10b981,#059669)', true);
                    setTimeout(() => { resetBtn(btn, originalHTML); fresh.reset(); }, 3000);
                } else {
                    const msg = data.message || data.error || 'Something went wrong.';
                    setBtnState(btn, '❌ Failed. Try again.', 'linear-gradient(135deg,#ef4444,#dc2626)', false);
                    alert('Could not send message:\n\n' + msg);
                    setTimeout(() => resetBtn(btn, originalHTML), 3000);
                }
            } catch (err) {
                console.error('[Contact API]', err);
                setBtnState(btn, '❌ Network Error', 'linear-gradient(135deg,#ef4444,#dc2626)', false);
                alert('Network error. Please check your connection.');
                setTimeout(() => resetBtn(btn, originalHTML), 3000);
            }
        });

        console.log('[StackBuilder API] ✅ Contact form wired');
    }

    // ─── ORDER FORM ───────────────────────────────────────────────────────────
    // Use event delegation on document so it works even when modal is hidden
    document.addEventListener('click', async (e) => {
        const btn = e.target.closest('#orderSubmitBtn');
        if (!btn) return;

        e.preventDefault();
        e.stopPropagation();

        // Validate services selected
        const selectedChips = document.querySelectorAll('.service-chip.selected');
        const services = Array.from(selectedChips).map(c => c.getAttribute('data-service'));

        if (services.length === 0) {
            alert('Please select at least one service.');
            return;
        }

        // Collect all fields
        const projectName = (document.getElementById('orderProjectName')?.value || '').trim();
        const description = (document.getElementById('orderDescription')?.value || '').trim();
        const budget = document.getElementById('orderBudget')?.value || '';
        const timeline = document.getElementById('orderTimeline')?.value || '';
        const clientName = (document.getElementById('orderName')?.value || '').trim();
        const clientEmail = (document.getElementById('orderEmail')?.value || '').trim();
        const clientPhone = (document.getElementById('orderPhone')?.value || '').trim();
        const extraNotes = (document.getElementById('orderExtra')?.value || '').trim();

        // Basic frontend validation
        if (!projectName) { alert('Please enter a project name.'); return; }
        if (!description) { alert('Please enter a project description.'); return; }
        if (!clientName) { alert('Please enter your name.'); return; }
        if (!clientEmail) { alert('Please enter your email.'); return; }

        const originalHTML = btn.innerHTML;
        setBtnState(btn, '⏳ Submitting...', 'linear-gradient(135deg,#6366f1,#8b5cf6)', true);

        const payload = {
            services,
            projectName,
            description,
            budget,
            timeline,
            clientName,
            clientEmail,
            clientPhone,
            extraNotes,
        };

        console.log('[Order API] Sending payload:', payload);

        try {
            const res = await fetch(`${API_BASE}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            console.log('[Order API] Response:', data);

            if (data.success) {
                setBtnState(btn, '✅ Order Submitted!', 'linear-gradient(135deg,#10b981,#059669)', true);
                setTimeout(() => {
                    resetBtn(btn, originalHTML);
                    // Reset form fields
                    document.getElementById('orderProjectName').value = '';
                    document.getElementById('orderDescription').value = '';
                    document.getElementById('orderBudget').value = '';
                    document.getElementById('orderTimeline').value = '';
                    document.getElementById('orderName').value = '';
                    document.getElementById('orderEmail').value = '';
                    document.getElementById('orderPhone').value = '';
                    document.getElementById('orderExtra').value = '';
                    // Deselect chips
                    document.querySelectorAll('.service-chip.selected')
                        .forEach(c => c.classList.remove('selected'));
                    // Close modal
                    const modal = document.getElementById('orderModal');
                    if (modal) {
                        modal.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                }, 3000);
            } else {
                const msg = data.message || data.error || 'Something went wrong.';
                setBtnState(btn, '❌ Failed. Try again.', 'linear-gradient(135deg,#ef4444,#dc2626)', false);
                alert('Could not submit order:\n\n' + msg);
                setTimeout(() => resetBtn(btn, originalHTML), 3000);
            }
        } catch (err) {
            console.error('[Order API] Error:', err);
            setBtnState(btn, '❌ Network Error', 'linear-gradient(135deg,#ef4444,#dc2626)', false);
            alert('Network error. Please email us directly at vermaarpit627@gmail.com');
            setTimeout(() => resetBtn(btn, originalHTML), 3000);
        }
    });

    console.log('[StackBuilder API] ✅ Order button wired via delegation');

})();