<?php
/**
 * FLEETEZEE — High Converting Demo Request Modal Component
 */
?>
<div class="fz-modal-backdrop" id="demoModal" role="dialog" aria-modal="true" aria-labelledby="demoModalTitle">
  <div class="fz-modal-dialog">
    <div class="fz-modal-header">
      <div>
        <span class="eyebrow mb-1">FLAGSHIP WALKTHROUGH</span>
        <h3 class="h4 text-white mb-0" id="demoModalTitle">Request a TruckBill Demo</h3>
      </div>
      <button class="fz-modal-close" id="closeDemoModal" aria-label="Close modal">✕</button>
    </div>

    <div class="fz-modal-body" id="demoFormContainer">
      <p class="text-muted-dark small mb-4">
        Experience how TruckBill transforms trips, bills, FASTag, TDS, and fleet profitability in 30 minutes.
      </p>

              <form id="fleetezeeDemoForm" novalidate>
          <div class="fz-form-row">
            <div class="fz-form-group">
              <label class="fz-label" for="leadName">Name *</label>
              <input type="text" class="fz-input" id="leadName" name="name" placeholder="e.g. Rajesh Sharma" required autocomplete="name">
            </div>
            <div class="fz-form-group">
              <label class="fz-label" for="leadEmail">Email *</label>
              <input type="email" class="fz-input" id="leadEmail" name="email" placeholder="e.g. rajesh@company.com" required autocomplete="email">
            </div>
          </div>

          <div class="fz-form-row">
            <div class="fz-form-group">
              <label class="fz-label" for="leadMobile">Mobile *</label>
              <input type="tel" class="fz-input" id="leadMobile" name="mobile" placeholder="e.g. 98765 43210" required autocomplete="tel">
            </div>
            <div class="fz-form-group">
              <label class="fz-label" for="leadCompany">Company *</label>
              <input type="text" class="fz-input" id="leadCompany" name="company" placeholder="e.g. Sharma Roadways Pvt Ltd" required autocomplete="organization">
            </div>
          </div>

          <div class="fz-form-row">
            <div class="fz-form-group">
              <label class="fz-label" for="leadCity">City *</label>
              <input type="text" class="fz-input" id="leadCity" name="city" placeholder="e.g. Jaipur, Mumbai, Ahmedabad" required autocomplete="address-level2">
            </div>
            <div class="fz-form-group">
              <label class="fz-label" for="leadState">State *</label>
              <input type="text" class="fz-input" id="leadState" name="state" placeholder="e.g. Rajasthan, Maharashtra" required autocomplete="address-level1">
            </div>
          </div>

          <div class="fz-form-group">
            <label class="fz-label" for="leadRemark">Remark <span class="text-muted-dark small">(Optional)</span></label>
            <textarea class="fz-textarea" id="leadRemark" name="remark" rows="2" placeholder="Tell us about your fleet operations or specific requirements..."></textarea>
          </div>

          <div class="mt-4">
            <button type="submit" class="btn-fz btn-fz-teal w-100 py-3">
              Request a Walkthrough
            </button>
            <div class="d-flex justify-content-between align-items-center mt-2 font-monospace" style="font-size: 0.75rem;">
              <span class="text-muted-dark">🔒 100% Free • No Credit Card</span>
              <span class="text-muted-dark">Call: <a href="tel:+919784451256" class="text-teal">+91 97844 51256</a> / <a href="tel:+919001010007" class="text-teal">+91 9001010007</a></span>
            </div>
          </div>
        </form>
    </div>

    <div class="modal-success-state" id="demoSuccessState">
      <div class="success-icon-badge">✓</div>
      <h3 class="h4 text-white mb-2">Request Received</h3>
      <p class="text-muted-dark small mb-4">
        Thank you, <strong id="confirmLeadName" class="text-white"></strong>. Our solution engineers will reach you at <strong id="confirmLeadMobile" class="text-teal"></strong> within 2 hours to arrange a personalized TruckBill walkthrough.
      </p>
      <div class="d-flex flex-column gap-2">
        <a href="#" id="instantWhatsAppCta" target="_blank" rel="noopener" class="btn-fz btn-fz-teal py-3">
          Start Instant WhatsApp Chat
        </a>
      </div>
    </div>
  </div>
</div>
