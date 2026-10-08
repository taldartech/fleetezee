/**
 * FLEETEZEE — Interactive UI Engine
 * Controls navigation, product mockups, interactive ecosystem,
 * demo modals, and micro-interactions.
 */

// Lead submission — every enquiry is processed centrally by truckbill.in/submit.php
const LEAD_SUBMIT_URL = window.location.hostname.endsWith('.test')
  ? 'https://truckbill.test/submit.php'
  : 'https://www.truckbill.in/submit.php';
const LEAD_TRACKING_KEY = 'fleetezee_lead_tracking';
const LEAD_SUBMIT_ERROR = 'We could not submit your request right now. Please try again or call +91 97844 51256.';

const getLeadTracking = () => {
  try {
    const stored = sessionStorage.getItem(LEAD_TRACKING_KEY);
    if (stored) return JSON.parse(stored);
  } catch (err) {}

  const params = new URLSearchParams(window.location.search);
  const data = {
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    landing_url: window.location.href,
    referrer: document.referrer || ''
  };

  try {
    sessionStorage.setItem(LEAD_TRACKING_KEY, JSON.stringify(data));
  } catch (err) {}

  return data;
};

const submitLead = (form, formName) => {
  const body = new URLSearchParams(new FormData(form));
  body.set('userType', 'Demo Request');
  body.set('form_name', formName);
  body.set('page_url', window.location.href);

  const tracking = getLeadTracking();
  Object.keys(tracking).forEach((key) => {
    if (tracking[key]) body.set(key, tracking[key]);
  });

  return fetch(LEAD_SUBMIT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body
  })
    .then((response) => response.json().catch(() => ({})), () => ({}))
    .then((result) => {
      if (result && result.success) return result;
      throw new Error((result && result.message) || LEAD_SUBMIT_ERROR);
    });
};

getLeadTracking();

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // 1. STICKY HEADER SCROLL EFFECT
  const header = document.querySelector('.fz-header');
  if (header) {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // 2. MOBILE NAVIGATION DRAWER
  const hamburger = document.querySelector('.hamburger-toggle');
  const mobileDrawer = document.querySelector('.mobile-nav-drawer');

  if (hamburger && mobileDrawer) {
    const toggleMenu = () => {
      const isOpen = mobileDrawer.classList.contains('open');
      if (isOpen) {
        hamburger.classList.remove('active');
        mobileDrawer.classList.remove('open');
        document.body.style.overflow = '';
      } else {
        hamburger.classList.add('active');
        mobileDrawer.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    };

    hamburger.addEventListener('click', toggleMenu);

    // Close when clicking any nav link
    mobileDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileDrawer.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
        toggleMenu();
      }
    });
  }

  // 3. TRUCKBILL PRODUCT CONSOLE TABS
  const consoleTabs = document.querySelectorAll('.console-tab-btn');
  const consoleViews = document.querySelectorAll('.console-view-panel');

  if (consoleTabs.length > 0 && consoleViews.length > 0) {
    consoleTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const targetViewId = tab.dataset.targetView;

        consoleTabs.forEach((t) => t.classList.remove('active'));
        consoleViews.forEach((v) => v.classList.remove('active'));

        tab.classList.add('active');
        const targetView = document.getElementById(targetViewId);
        if (targetView) {
          targetView.classList.add('active');
        }

        if (window.FleetezeeAnalytics) {
          window.FleetezeeAnalytics.track('truckbill_console_tab_change', {
            tab: targetViewId
          });
        }
      });
    });
  }

  // 4. INTERACTIVE ECOSYSTEM NODES
  const ecoNodes = document.querySelectorAll('.ecosystem-node-card');
  const ecoDetailDisplay = document.getElementById('ecoNodeDetail');

  if (ecoNodes.length > 0) {
    ecoNodes.forEach((node) => {
      node.addEventListener('click', () => {
        ecoNodes.forEach((n) => n.classList.remove('active'));
        node.classList.add('active');

        if (ecoDetailDisplay) {
          const title = node.querySelector('h4') ? node.querySelector('h4').textContent : '';
          const desc = node.dataset.detail || (node.querySelector('p') ? node.querySelector('p').textContent : '');
          const techSpec = node.dataset.tech || 'REST / gRPC / Webhook streaming / Event Mesh';

          const nodeTag = node.querySelector('.node-tag') ? node.querySelector('.node-tag').textContent : 'CONNECTED NODE';

          ecoDetailDisplay.innerHTML = `
            <div class="eco-detail-box p-3 rounded bg-white border border-light-subtle shadow-sm">
              <span class="badge-flagship">CONNECTED ${nodeTag}</span>
              <h4 class="text-dark mt-2 mb-1" style="color: #0F172A !important; font-weight: 800;">${title}</h4>
              <p class="mb-2 font-monospace small" style="color: #475569 !important;">${desc}</p>
              <div class="d-flex align-items-center gap-2 small text-teal">
                <span class="hero-badge-dot"></span>
                <span style="color: #0D9488 !important; font-weight: 600;">Active Data Stream: ${techSpec}</span>
              </div>
            </div>
          `;
        }
      });
    });
  }

  // 5. DEMO REQUEST MODAL LOGIC
  const modalBackdrop = document.getElementById('demoModal');
  const openButtons = document.querySelectorAll('[data-open-demo]');
  const closeButton = document.getElementById('closeDemoModal');
  const demoForm = document.getElementById('fleetezeeDemoForm');
  const modalSuccessState = document.getElementById('demoSuccessState');
  const modalFormContainer = document.getElementById('demoFormContainer');
  const whatsappCta = document.getElementById('instantWhatsAppCta');

  function openDemoModal(source = 'unknown') {
    if (!modalBackdrop) return;
    modalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (window.FleetezeeAnalytics) {
      window.FleetezeeAnalytics.track('demo_modal_opened', { source: source });
    }
  }

  function closeDemoModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  openButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const source = btn.dataset.demoSource || btn.getAttribute('href') || 'cta_button';
      openDemoModal(source);
    });
  });

  if (closeButton) {
    closeButton.addEventListener('click', closeDemoModal);
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeDemoModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalBackdrop.classList.contains('active')) {
        closeDemoModal();
      }
    });
  }

  // Handle Demo Form Submission
  if (demoForm) {
    demoForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = demoForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Submit';

      const formData = {
        name: demoForm.name ? demoForm.name.value.trim() : '',
        email: demoForm.email ? demoForm.email.value.trim() : '',
        mobile: demoForm.mobile ? demoForm.mobile.value.trim() : '',
        company: demoForm.company ? demoForm.company.value.trim() : '',
        city: demoForm.city ? demoForm.city.value.trim() : '',
        state: demoForm.state ? demoForm.state.value.trim() : '',
        remark: demoForm.remark ? demoForm.remark.value.trim() : (demoForm.notes ? demoForm.notes.value.trim() : '')
      };

      if (!formData.name || !formData.email || !formData.mobile || !formData.company || !formData.city || !formData.state) {
        alert('Please fill in all required fields (Name, Email, Mobile, Company, City, State).');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Preparing TruckBill Walkthrough...
        `;
      }

      // Track lead in analytics
      if (window.FleetezeeAnalytics) {
        window.FleetezeeAnalytics.track('demo_lead_submitted', {
          businessType: formData.businessType,
          vehicleCount: formData.vehicleCount,
          company: formData.company
        });
      }

      submitLead(demoForm, 'demo_modal').then(() => {
        if (modalFormContainer) modalFormContainer.style.display = 'none';
        if (modalSuccessState) {
          modalSuccessState.classList.add('active');

          const confirmName = document.getElementById('confirmLeadName');
          if (confirmName) confirmName.textContent = formData.name;

          const confirmMobile = document.getElementById('confirmLeadMobile');
          if (confirmMobile) confirmMobile.textContent = formData.mobile;

          // Configure instant WhatsApp link
          if (whatsappCta) {
            const waText = encodeURIComponent(
              `Hello Fleetezee Team, I am ${formData.name} from ${formData.company || 'transport business'}. I would like to schedule a demo of TruckBill ERP for our fleet (${formData.vehicleCount || 'operations'}).`
            );
            whatsappCta.href = `https://wa.me/919784451256?text=${waText}`;
          }
        }
      }).catch((err) => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
        alert(err.message || LEAD_SUBMIT_ERROR);
      });
    });
  }

  // 6. ANIMATED METRICS COUNTER
  const counterElements = document.querySelectorAll('[data-counter-target]');
  if (counterElements.length > 0 && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseFloat(el.dataset.counterTarget);
          const prefix = el.dataset.counterPrefix || '';
          const suffix = el.dataset.counterSuffix || '';
          const duration = 1600;
          const startTime = performance.now();

          const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out quad
            const easeOut = 1 - (1 - progress) * (1 - progress);
            const currentVal = Math.floor(easeOut * target);

            el.textContent = `${prefix}${currentVal.toLocaleString()}${suffix}`;

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              el.textContent = `${prefix}${target.toLocaleString()}${suffix}`;
            }
          };

          requestAnimationFrame(updateCounter);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.2 });

    counterElements.forEach((el) => counterObserver.observe(el));
  }
});
