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
            <label class="fz-label" for="leadName">Your Name *</label>
            <input type="text" class="fz-input" id="leadName" name="name" placeholder="e.g. Rajesh Sharma" required>
          </div>
          <div class="fz-form-group">
            <label class="fz-label" for="leadCompany">Company Name *</label>
            <input type="text" class="fz-input" id="leadCompany" name="company" placeholder="e.g. Apex Freight Logistics" required>
          </div>
        </div>

        <div class="fz-form-row">
          <div class="fz-form-group">
            <label class="fz-label" for="leadMobile">Mobile Number *</label>
            <input type="tel" class="fz-input" id="leadMobile" name="mobile" placeholder="e.g. 98201 23456" required>
          </div>
          <div class="fz-form-group">
            <label class="fz-label" for="leadEmail">Work Email</label>
            <input type="email" class="fz-input" id="leadEmail" name="email" placeholder="name@company.com">
          </div>
        </div>

        <div class="fz-form-row">
          <div class="fz-form-group">
            <label class="fz-label" for="leadBusinessType">Business Type</label>
            <select class="fz-select" id="leadBusinessType" name="businessType">
              <option value="Transporter">Transporter (Fleet + Market)</option>
              <option value="Fleet Owner">Fleet Owner (Dedicated Assets)</option>
              <option value="Freight Broker / Commission Agent">Freight Broker / Commission Agent</option>
              <option value="3PL / Logistics Enterprise">3PL / Logistics Enterprise</option>
              <option value="Other">Other Transportation Business</option>
            </select>
          </div>
          <div class="fz-form-group">
            <label class="fz-label" for="leadVehicleCount">Number of Vehicles</label>
            <select class="fz-select" id="leadVehicleCount" name="vehicleCount">
              <option value="1-5 Vehicles">1 - 5 Vehicles</option>
              <option value="6-20 Vehicles">6 - 20 Vehicles</option>
              <option value="21-50 Vehicles">21 - 50 Vehicles</option>
              <option value="50+ Vehicles">50+ Vehicles</option>
              <option value="Broker / Non-Asset">Broker / Zero Fleet (Asset-Light)</option>
            </select>
          </div>
        </div>

        <div class="fz-form-group">
          <label class="fz-label" for="leadCurrentMethod">Current Software / Method</label>
          <input type="text" class="fz-input" id="leadCurrentMethod" name="currentMethod" placeholder="e.g. Excel + Tally / Manual Register / Another ERP">
        </div>

        <div class="fz-form-group">
          <label class="fz-label" for="leadNotes">Message / Key Requirement (Optional)</label>
          <textarea class="fz-textarea" id="leadNotes" name="notes" rows="2" placeholder="Tell us about your operations or branches..."></textarea>
        </div>

        <div class="mt-4">
          <button type="submit" class="btn-fz btn-fz-teal w-100 py-3">
            Request a Walkthrough
          </button>
          <p class="text-center text-muted-dark small mt-2 mb-0 font-monospace">
            🔒 Zero spam. Direct engineer demo.
          </p>
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
