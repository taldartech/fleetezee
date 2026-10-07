<?php
/**
 * FLEETEZEE — Header Component (PHP / CMS Ready)
 * @param string $activePage The current active page identifier
 */
if (!isset($activePage)) {
    $activePage = 'home';
}
?>
<header class="fz-header" id="mainHeader">
  <div class="container-fz">
    <div class="header-inner">
      <a href="index.html" class="header-logo-link" aria-label="Fleetezee Home">
        <img src="assets/images/fleetezee-logo.svg" alt="FLEETEZEE" width="200" height="32">
      </a>
      <nav aria-label="Primary Navigation">
        <ul class="nav-desktop-links">
          <li><a href="truckbill.html" class="<?php echo $activePage === 'truckbill' ? 'active' : ''; ?>">TruckBill <span class="badge-flagship">Flagship</span></a></li>
          <li><a href="solutions.html" class="<?php echo $activePage === 'solutions' ? 'active' : ''; ?>">Solutions</a></li>
          <li><a href="technology.html" class="<?php echo $activePage === 'technology' ? 'active' : ''; ?>">Technology</a></li>
          <li><a href="vision.html" class="<?php echo $activePage === 'vision' ? 'active' : ''; ?>">Vision</a></li>
          <li><a href="about.html" class="<?php echo $activePage === 'about' ? 'active' : ''; ?>">Company</a></li>
          <li><a href="insights.html" class="<?php echo $activePage === 'insights' ? 'active' : ''; ?>">Insights</a></li>
          <li><a href="contact.html" class="<?php echo $activePage === 'contact' ? 'active' : ''; ?>">Contact</a></li>
        </ul>
      </nav>
      <div class="nav-desktop-cta">
        <a href="https://www.truckbill.in/" target="_blank" rel="noopener" class="nav-truckbill-btn">
          <img src="assets/images/truckbill-logo.png" alt="TruckBill" height="20">
          <span>truckbill.in ↗</span>
        </a>
        <button class="btn-fz btn-fz-teal btn-fz-sm" data-open-demo data-demo-source="header_desktop">
          Book a Demo
        </button>
      </div>
      <button class="hamburger-toggle" id="hamburgerBtn" aria-label="Toggle navigation menu">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
    </div>
  </div>
</header>

<div class="mobile-nav-drawer" id="mobileDrawer">
  <div>
    <div class="d-flex align-items-center justify-content-between mb-4">
      <span class="eyebrow mb-0">Menu</span>
    </div>
    <ul class="mobile-nav-links">
      <li><a href="truckbill.html"><span>TruckBill ERP</span> <span class="badge-flagship">Flagship</span></a></li>
      <li><a href="solutions.html"><span>Solutions</span> <span>→</span></a></li>
      <li><a href="technology.html"><span>Technology & AI</span> <span>→</span></a></li>
      <li><a href="vision.html"><span>Our Vision</span> <span>→</span></a></li>
      <li><a href="about.html"><span>Company & Story</span> <span>→</span></a></li>
      <li><a href="insights.html"><span>Insights</span> <span>→</span></a></li>
      <li><a href="contact.html"><span>Contact Us</span> <span>→</span></a></li>
    </ul>
  </div>
  <div>
    <a href="https://www.truckbill.in/" target="_blank" rel="noopener" class="nav-truckbill-btn w-100 justify-content-center py-2 mb-3">
      <img src="assets/images/truckbill-logo.png" alt="TruckBill" height="22">
      <span>Visit truckbill.in ↗</span>
    </a>
    <button class="btn-fz btn-fz-teal w-100 py-3 mb-2" data-open-demo data-demo-source="mobile_drawer">
      Book a TruckBill Demo
    </button>
  </div>
</div>
