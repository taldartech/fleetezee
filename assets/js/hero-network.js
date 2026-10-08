/**
 * FLEETEZEE — End-to-End Pan-India Freight Network, Warehouses, Truckyards & Telematics Simulation
 * Expansive full-width background simulation spanning 100% of the screen from end to end:
 *  - Comprehensive national logistics mesh spanning from 4% (West) to 96% (East) of screen width
 *  - Strategic Warehouses [WH] (Multi-Modal Logistics Parks & Fulfillment Hubs)
 *  - Strategic Truckyards [TY] (Transport Nagar Terminals, Port Container Yards)
 *  - Glowing dual-pass highway expressways with traveling electric telemetry data pulses
 *  - Active fleet of 2D vector freight trucks cruising corridors with forward headlights & taillights
 *  - Intelligent anti-collision badge engine (max 3-4 clean badges, zero overlapping)
 *  - Destination arrival telemetry radar pulses
 *  - Performance-optimized, DPI-scaled, auto-pauses off-screen
 */

(function () {
  'use strict';

  const canvases = document.querySelectorAll('.hero-telematics-canvas, .telematics-india-canvas, #heroCanvas');
  if (!canvases.length) return;

  canvases.forEach((canvas) => {
    initSimulation(canvas);
  });

  function initSimulation(canvas) {
    const ctx = canvas.getContext('2d');
    let animationFrameId = null;
    let isVisible = true;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    // End-to-End Freight Nodes spanning full screen from 4% (Far West) to 96% (Far East)
    const FREIGHT_NODES = [
      // 1. Far West Gateway (4% to 18%)
      { id: 'wh_mundra', name: 'MUNDRA PORT', type: 'wh', nx: 0.05, ny: 0.38, align: 'right' },
      { id: 'ty_porbandar', name: 'PORBANDAR TY', type: 'ty', nx: 0.06, ny: 0.50, align: 'right' },
      { id: 'wh_aslali', name: 'ASLALI WH', type: 'wh', nx: 0.16, ny: 0.44, align: 'top' },
      { id: 'ty_vapi', name: 'VAPI GIDC TY', type: 'ty', nx: 0.19, ny: 0.56, align: 'right' },

      // 2. West-Central & Mumbai-Pune Cluster (22% to 32%)
      { id: 'ty_vkia', name: 'VKIA JAIPUR', type: 'ty', nx: 0.24, ny: 0.28, align: 'left' },
      { id: 'wh_bhiwandi', name: 'BHIWANDI WH', type: 'wh', nx: 0.23, ny: 0.62, align: 'left' },
      { id: 'ty_jnpt', name: 'JNPT YARD', type: 'ty', nx: 0.22, ny: 0.68, align: 'left' },
      { id: 'wh_chakan', name: 'CHAKAN WH', type: 'wh', nx: 0.27, ny: 0.66, align: 'right' },
      { id: 'node_goa', name: 'GOA PORT', type: 'metro', nx: 0.26, ny: 0.76, align: 'left' },
      { id: 'node_mangaluru', name: 'MANGALURU', type: 'metro', nx: 0.28, ny: 0.84, align: 'left' },

      // 3. North & North-Central Backbone (32% to 48%)
      { id: 'node_srinagar', name: 'SRINAGAR', type: 'metro', nx: 0.32, ny: 0.08, align: 'right' },
      { id: 'node_ludhiana', name: 'LUDHIANA', type: 'metro', nx: 0.35, ny: 0.17, align: 'left' },
      { id: 'ty_sgtn', name: 'SGTN DELHI', type: 'ty', nx: 0.38, ny: 0.22, align: 'top' },
      { id: 'wh_bilaspur', name: 'BILASPUR WH', type: 'wh', nx: 0.40, ny: 0.26, align: 'right' },
      { id: 'ty_fazalganj', name: 'FAZALGANJ TY', type: 'ty', nx: 0.47, ny: 0.30, align: 'top' },
      { id: 'node_lucknow', name: 'LUCKNOW', type: 'metro', nx: 0.49, ny: 0.28, align: 'right' },
      { id: 'node_indore', name: 'INDORE', type: 'metro', nx: 0.31, ny: 0.45, align: 'left' },

      // 4. Central Zero-Mile Nexus & Deccan (42% to 56%)
      { id: 'ty_kalamna', name: 'KALAMNA YARD', type: 'ty', nx: 0.43, ny: 0.52, align: 'top' },
      { id: 'wh_butibori', name: 'BUTIBORI WH', type: 'wh', nx: 0.45, ny: 0.56, align: 'right' },
      { id: 'ty_autonagar', name: 'AUTONAGAR HYD', type: 'ty', nx: 0.46, ny: 0.68, align: 'right' },
      { id: 'ty_nelamang', name: 'NELAMANGALA TY', type: 'ty', nx: 0.37, ny: 0.82, align: 'left' },
      { id: 'wh_hoskote', name: 'HOSKOTE WH', type: 'wh', nx: 0.40, ny: 0.84, align: 'right' },
      { id: 'wh_sricity', name: 'SRI CITY WH', type: 'wh', nx: 0.48, ny: 0.77, align: 'top' },
      { id: 'ty_madhavaram', name: 'MADHAVARAM TY', type: 'ty', nx: 0.50, ny: 0.81, align: 'right' },
      { id: 'node_kochi', name: 'KOCHI PORT', type: 'metro', nx: 0.33, ny: 0.91, align: 'left' },
      { id: 'node_kanya', name: 'KANYAKUMARI', type: 'metro', nx: 0.40, ny: 0.96, align: 'right' },

      // 5. Eastern Corridor & Coastal Trunk (58% to 76%)
      { id: 'node_varanasi', name: 'VARANASI', type: 'metro', nx: 0.58, ny: 0.34, align: 'right' },
      { id: 'node_patna', name: 'PATNA', type: 'metro', nx: 0.64, ny: 0.33, align: 'right' },
      { id: 'node_raipur', name: 'RAIPUR', type: 'metro', nx: 0.55, ny: 0.50, align: 'right' },
      { id: 'node_vizag', name: 'VIZAG PORT', type: 'metro', nx: 0.61, ny: 0.64, align: 'right' },
      { id: 'node_bhuban', name: 'BHUBANESWAR', type: 'metro', nx: 0.68, ny: 0.52, align: 'right' },
      { id: 'wh_dankuni', name: 'DANKUNI WH', type: 'wh', nx: 0.75, ny: 0.43, align: 'top' },

      // 6. Northeast Arterial Corridor (78% to 96%)
      { id: 'node_siliguri', name: 'SILIGURI', type: 'metro', nx: 0.81, ny: 0.28, align: 'top' },
      { id: 'ty_amingaon', name: 'AMINGAON TY', type: 'ty', nx: 0.92, ny: 0.29, align: 'top' },
      { id: 'node_dibrugarh', name: 'DIBRUGARH', type: 'metro', nx: 0.96, ny: 0.25, align: 'left' }
    ];

    // Arterial National Highway Corridors Connecting End-to-End
    const CORRIDOR_CONNECTIONS = [
      // Far West Links
      ['wh_mundra', 'ty_porbandar', 'Coastal'],
      ['wh_mundra', 'wh_aslali', 'NH-41'],
      ['ty_porbandar', 'wh_aslali', 'NH-27'],
      ['wh_aslali', 'ty_vapi', 'NH-48'],
      ['ty_vapi', 'wh_bhiwandi', 'NH-48'],

      // West-Central & Expressways
      ['wh_aslali', 'ty_vkia', 'NH-48'],
      ['ty_vkia', 'ty_sgtn', 'NH-48'],
      ['wh_aslali', 'node_indore', 'NH-47'],
      ['node_indore', 'ty_kalamna', 'NH-47'],
      ['wh_bhiwandi', 'ty_jnpt', 'Expway'],
      ['wh_bhiwandi', 'wh_chakan', 'Expway'],
      ['wh_bhiwandi', 'ty_kalamna', 'Samruddhi'],
      ['wh_chakan', 'ty_nelamang', 'NH-48'],
      ['wh_chakan', 'node_goa', 'NH-66'],
      ['node_goa', 'node_mangaluru', 'NH-66'],
      ['node_mangaluru', 'node_kochi', 'NH-66'],

      // North-South Arterial NH-44
      ['node_srinagar', 'node_ludhiana', 'NH-44'],
      ['node_ludhiana', 'ty_sgtn', 'NH-44'],
      ['ty_sgtn', 'wh_bilaspur', 'NH-48'],
      ['ty_sgtn', 'ty_fazalganj', 'NH-19'],
      ['ty_sgtn', 'ty_kalamna', 'NH-44'],
      ['ty_kalamna', 'wh_butibori', 'NH-44'],
      ['wh_butibori', 'ty_autonagar', 'NH-44'],
      ['ty_autonagar', 'ty_nelamang', 'NH-44'],
      ['ty_nelamang', 'wh_hoskote', 'NICE Rd'],
      ['wh_hoskote', 'wh_sricity', 'NH-48'],
      ['wh_sricity', 'ty_madhavaram', 'NH-16'],
      ['ty_nelamang', 'node_kochi', 'NH-544'],
      ['ty_nelamang', 'node_kanya', 'NH-44'],
      ['node_kochi', 'node_kanya', 'NH-66'],

      // East-West National Corridors & Gangetic Arterials
      ['ty_fazalganj', 'node_lucknow', 'NH-27'],
      ['node_lucknow', 'node_varanasi', 'NH-19'],
      ['node_varanasi', 'node_patna', 'NH-19'],
      ['node_patna', 'wh_dankuni', 'NH-19'],
      ['ty_fazalganj', 'ty_kalamna', 'NH-34'],
      ['ty_kalamna', 'node_raipur', 'NH-53'],
      ['node_raipur', 'wh_dankuni', 'NH-53'],

      // Eastern Coastal Arterials NH-16
      ['wh_dankuni', 'node_bhuban', 'NH-16'],
      ['node_bhuban', 'node_vizag', 'NH-16'],
      ['node_vizag', 'ty_madhavaram', 'NH-16'],
      ['ty_autonagar', 'node_vizag', 'NH-65'],

      // Far East & Northeast Trunk Routes
      ['node_patna', 'node_siliguri', 'NH-27'],
      ['wh_dankuni', 'node_siliguri', 'NH-12'],
      ['node_siliguri', 'ty_amingaon', 'NH-27'],
      ['ty_amingaon', 'node_dibrugarh', 'NH-15']
    ];

    // Mobile Freight Nodes: Clean, well-spaced arterial network optimized for portrait handheld viewports
    const MOBILE_FREIGHT_NODES = [
      // North Arterial
      { id: 'node_srinagar', name: 'SRINAGAR', type: 'metro', nx: 0.35, ny: 0.08, align: 'right' },
      { id: 'ty_sgtn', name: 'DELHI SGTN', type: 'ty', nx: 0.44, ny: 0.18, align: 'top' },
      { id: 'node_lucknow', name: 'LUCKNOW', type: 'metro', nx: 0.70, ny: 0.22, align: 'right' },
      // West Arterial & Ports
      { id: 'wh_mundra', name: 'MUNDRA PORT', type: 'wh', nx: 0.12, ny: 0.34, align: 'right' },
      { id: 'wh_aslali', name: 'ASLALI WH', type: 'wh', nx: 0.32, ny: 0.36, align: 'top' },
      { id: 'ty_jnpt', name: 'JNPT MUMBAI', type: 'ty', nx: 0.22, ny: 0.54, align: 'left' },
      { id: 'wh_chakan', name: 'PUNE WH', type: 'wh', nx: 0.38, ny: 0.58, align: 'right' },
      // Central Zero-Mile Hub
      { id: 'ty_kalamna', name: 'NAGPUR YARD', type: 'ty', nx: 0.58, ny: 0.46, align: 'top' },
      // Eastern Trunk & Gangetic Corridor
      { id: 'node_patna', name: 'PATNA', type: 'metro', nx: 0.82, ny: 0.30, align: 'left' },
      { id: 'wh_dankuni', name: 'KOLKATA WH', type: 'wh', nx: 0.86, ny: 0.48, align: 'left' },
      { id: 'node_vizag', name: 'VIZAG PORT', type: 'metro', nx: 0.74, ny: 0.65, align: 'right' },
      // Deccan & Southern Corridors
      { id: 'ty_autonagar', name: 'HYDERABAD TY', type: 'ty', nx: 0.55, ny: 0.68, align: 'right' },
      { id: 'ty_nelamang', name: 'BENGALURU TY', type: 'ty', nx: 0.42, ny: 0.80, align: 'left' },
      { id: 'ty_madhavaram', name: 'CHENNAI TY', type: 'ty', nx: 0.70, ny: 0.82, align: 'right' },
      { id: 'node_kochi', name: 'KOCHI PORT', type: 'metro', nx: 0.36, ny: 0.94, align: 'left' }
    ];

    const MOBILE_CORRIDOR_CONNECTIONS = [
      ['node_srinagar', 'ty_sgtn', 'NH-44'],
      ['ty_sgtn', 'node_lucknow', 'NH-19'],
      ['node_lucknow', 'node_patna', 'NH-19'],
      ['node_patna', 'wh_dankuni', 'NH-19'],
      ['wh_mundra', 'wh_aslali', 'NH-41'],
      ['ty_sgtn', 'wh_aslali', 'NH-48'],
      ['wh_aslali', 'ty_jnpt', 'NH-48'],
      ['ty_jnpt', 'wh_chakan', 'Expway'],
      ['wh_aslali', 'ty_kalamna', 'NH-53'],
      ['ty_kalamna', 'wh_dankuni', 'NH-53'],
      ['wh_chakan', 'ty_autonagar', 'NH-65'],
      ['ty_kalamna', 'ty_autonagar', 'NH-44'],
      ['wh_dankuni', 'node_vizag', 'NH-16'],
      ['node_vizag', 'ty_madhavaram', 'NH-16'],
      ['ty_autonagar', 'ty_nelamang', 'NH-44'],
      ['ty_autonagar', 'node_vizag', 'NH-65'],
      ['wh_chakan', 'ty_nelamang', 'NH-48'],
      ['ty_nelamang', 'ty_madhavaram', 'NH-48'],
      ['ty_nelamang', 'node_kochi', 'NH-544']
    ];

    const nodes = [];
    const corridors = [];
    const trucks = [];
    const telemetryPings = [];

    function resize() {
      const parent = canvas.parentElement;
      width = parent.offsetWidth || window.innerWidth;
      height = parent.offsetHeight || 580;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      initNetwork();
    }

    function initNetwork() {
      nodes.length = 0;
      corridors.length = 0;

      const isMobile = width < 768;
      const activeNodes = isMobile ? MOBILE_FREIGHT_NODES : FREIGHT_NODES;
      const activeCorridors = isMobile ? MOBILE_CORRIDOR_CONNECTIONS : CORRIDOR_CONNECTIONS;

      // Coordinate transformation adapted for viewport aspect ratio
      const animWidth = isMobile ? (width * 0.90) : (width * 0.96);
      const animHeight = isMobile ? (height * 0.88) : (height * 0.88);
      const offsetX = isMobile ? (width * 0.05) : (width * 0.02);
      const offsetY = isMobile ? (height * 0.06) : (height * 0.06);

      activeNodes.forEach(def => {
        nodes.push({
          id: def.id,
          name: def.name,
          type: def.type, // 'wh', 'ty', or 'metro'
          align: def.align || 'right',
          x: offsetX + def.nx * animWidth,
          y: offsetY + def.ny * animHeight,
          pingRadius: Math.random() * (isMobile ? 12 : 18),
          pingAlpha: 0.8
        });
      });

      const nodeMap = {};
      nodes.forEach(n => { nodeMap[n.id] = n; });

      activeCorridors.forEach(([fromId, toId, code]) => {
        const from = nodeMap[fromId];
        const to = nodeMap[toId];
        if (from && to) {
          corridors.push({ from, to, code, dashOffset: 0 });
        }
      });

      initTrucks();
    }

    class MovingTruck {
      constructor(index) {
        this.index = index;
        this.reset();
      }

      reset() {
        if (!corridors.length) return;
        this.corridor = corridors[Math.floor(Math.random() * corridors.length)];
        this.reversed = Math.random() > 0.5;
        this.progress = Math.random();
        
        const isMobile = width < 768;
        // Cruising speed adapted for screen distance
        this.speed = isMobile ? (0.0016 + Math.random() * 0.0015) : (0.0011 + Math.random() * 0.0013);

        // Vehicle Plate & Logistics Data
        const states = ['MH', 'GJ', 'DL', 'KA', 'RJ', 'HR', 'WB', 'TN', 'UP', 'TS'];
        const state = states[Math.floor(Math.random() * states.length)];
        const num = Math.floor(1000 + Math.random() * 9000);
        this.plate = `${state}-${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}-${num}`;

        const statuses = [
          'IN TRANSIT',
          'FASTag OK',
          'LR #TB-' + Math.floor(100 + Math.random() * 900),
          'DOCK ACTIVE',
          'YARD BOUND',
          'GPS LOCKED'
        ];
        this.status = statuses[Math.floor(Math.random() * statuses.length)];

        this.truckLength = 17;
        this.truckWidth = 7;
        // Badges only active on desktop for zero-clutter on mobile
        this.badgeEligible = !isMobile && (this.index % 5 === 0);
      }

      update() {
        this.progress += this.speed;
        if (this.progress >= 1) {
          const dest = this.reversed ? this.corridor.from : this.corridor.to;
          telemetryPings.push({
            x: dest.x,
            y: dest.y,
            radius: 3,
            maxRadius: dest.type === 'wh' ? 24 : 20,
            alpha: 1,
            color: dest.type === 'wh' ? '#0D9488' : (dest.type === 'ty' ? '#0284C7' : '#2563EB')
          });
          this.reset();
          this.progress = 0;
        }

        const start = this.reversed ? this.corridor.to : this.corridor.from;
        const end = this.reversed ? this.corridor.from : this.corridor.to;

        this.x = start.x + (end.x - start.x) * this.progress;
        this.y = start.y + (end.y - start.y) * this.progress;
        this.angle = Math.atan2(end.y - start.y, end.x - start.x);
      }

      draw(renderedBadges) {
        const isMobile = width < 768;
        const isSmallMobile = width < 576;
        const scale = isSmallMobile ? 0.72 : (isMobile ? 0.84 : 1.0);

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.scale(scale, scale);

        // 1. Forward Headlights Glowing Beam
        ctx.save();
        const beamGrad = ctx.createRadialGradient(8, 0, 1, 32, 0, 14);
        beamGrad.addColorStop(0, 'rgba(13, 148, 136, 0.45)');
        beamGrad.addColorStop(0.5, 'rgba(37, 99, 235, 0.18)');
        beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(8, -2.2);
        ctx.lineTo(34, -10);
        ctx.lineTo(34, 10);
        ctx.lineTo(8, 2.2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 2. Chassis Shadow
        ctx.fillStyle = 'rgba(15, 23, 42, 0.10)';
        ctx.fillRect(-10, -this.truckWidth / 2 + 1, this.truckLength, this.truckWidth);

        // 3. Cargo Trailer (Deep Slate)
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        roundRect(ctx, -10, -this.truckWidth / 2, 11, this.truckWidth, 1.5);
        ctx.fill();

        // Vibrant Teal Brand Stripe on Cargo Trailer
        ctx.fillStyle = '#0D9488';
        ctx.fillRect(-7.5, -this.truckWidth / 2 + 0.8, 5.5, 1.1);
        ctx.fillRect(-7.5, this.truckWidth / 2 - 1.9, 5.5, 1.1);

        // 4. Driver Cabin (Front)
        ctx.fillStyle = '#1E293B';
        ctx.beginPath();
        roundRect(ctx, 1.5, -this.truckWidth / 2 + 0.5, 5.5, this.truckWidth - 1, 1.5);
        ctx.fill();

        // Windshield Glass (Azure)
        ctx.fillStyle = '#38BDF8';
        ctx.fillRect(3.8, -this.truckWidth / 2 + 1.2, 1.6, this.truckWidth - 2.4);

        // Front Headlights
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(6.8, -this.truckWidth / 2 + 0.8, 0.8, 1.1);
        ctx.fillRect(6.8, this.truckWidth / 2 - 1.9, 0.8, 1.1);

        // Rear Brake Stoplights
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(-10, -this.truckWidth / 2 + 0.8, 0.8, 1.1);
        ctx.fillRect(-10, this.truckWidth / 2 - 1.9, 0.8, 1.1);

        ctx.restore();

        // 5. Anti-Collision Floating Telemetry Badges (Desktop Only)
        if (this.badgeEligible && width > 768) {
          const badgeX = this.x + 8;
          const badgeY = this.y - 10;
          const badgeW = 94;
          const badgeH = 13;

          let collides = false;
          for (let i = 0; i < renderedBadges.length; i++) {
            const b = renderedBadges[i];
            if (Math.abs(badgeX - b.x) < 75 && Math.abs(badgeY - b.y) < 22) {
              collides = true;
              break;
            }
          }

          if (!collides) {
            renderedBadges.push({ x: badgeX, y: badgeY });

            ctx.save();
            ctx.font = '600 7.5px "JetBrains Mono", monospace';
            const text = `${this.plate} • ${this.status}`;

            // Frosted white pill
            ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
            ctx.strokeStyle = 'rgba(226, 232, 240, 0.90)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            roundRect(ctx, badgeX - 3, badgeY - 8, badgeW, badgeH, 3);
            ctx.fill();
            ctx.stroke();

            // Status indicator dot
            ctx.fillStyle = '#0D9488';
            ctx.beginPath();
            ctx.arc(badgeX + 1.5, badgeY - 1.5, 1.8, 0, Math.PI * 2);
            ctx.fill();

            // Label
            ctx.fillStyle = '#0F172A';
            ctx.fillText(text, badgeX + 6.5, badgeY + 1);
            ctx.restore();
          }
        }
      }
    }

    function initTrucks() {
      trucks.length = 0;
      const count = width < 576 ? 8 : (width < 768 ? 12 : 20);
      for (let i = 0; i < count; i++) {
        trucks.push(new MovingTruck(i));
      }
    }

    // 1. Draw High-Tech Ambient Matrix Dots across the Whole Canvas
    function drawBackgroundMatrix() {
      ctx.save();
      const isMobile = width < 768;
      ctx.fillStyle = isMobile ? 'rgba(15, 23, 42, 0.035)' : 'rgba(15, 23, 42, 0.045)';
      const step = isMobile ? 54 : 44;
      for (let x = step / 2; x < width; x += step) {
        for (let y = step / 2; y < height; y += step) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // 2. Draw Dual-Pass Expressways with Traveling Energy Pulses
    function drawCorridors() {
      const isMobile = width < 768;
      corridors.forEach(c => {
        // Under-glow pass
        ctx.beginPath();
        ctx.moveTo(c.from.x, c.from.y);
        ctx.lineTo(c.to.x, c.to.y);
        ctx.strokeStyle = 'rgba(13, 148, 136, 0.18)';
        ctx.lineWidth = isMobile ? 1.8 : 2.4;
        ctx.stroke();

        // Crisp active road track
        ctx.beginPath();
        ctx.moveTo(c.from.x, c.from.y);
        ctx.lineTo(c.to.x, c.to.y);
        ctx.strokeStyle = 'rgba(13, 148, 136, 0.38)';
        ctx.lineWidth = isMobile ? 1.0 : 1.3;
        ctx.stroke();

        // Traveling dashed telemetry data pulse
        ctx.beginPath();
        ctx.moveTo(c.from.x, c.from.y);
        ctx.lineTo(c.to.x, c.to.y);
        ctx.strokeStyle = 'rgba(2, 132, 199, 0.70)';
        ctx.lineWidth = isMobile ? 0.9 : 1.2;
        ctx.setLineDash([3, 7]);
        c.dashOffset = (c.dashOffset - (isMobile ? 0.45 : 0.4)) % 10;
        ctx.lineDashOffset = c.dashOffset;
        ctx.stroke();
        ctx.setLineDash([]);
      });
    }

    // 3. Draw Nodes (Warehouses, Truckyards, Metros)
    function drawNodes() {
      const isMobile = width < 768;
      const maxPing = isMobile ? 16 : 22;
      const pingStep = isMobile ? 0.22 : 0.28;

      nodes.forEach(node => {
        // Radar pulse ring
        node.pingRadius += pingStep;
        node.pingAlpha = Math.max(0, 1 - node.pingRadius / maxPing);
        if (node.pingRadius > maxPing) {
          node.pingRadius = 2.5;
          node.pingAlpha = 0.8;
        }

        const isWH = node.type === 'wh';
        const isTY = node.type === 'ty';
        const color = isWH ? '#0D9488' : (isTY ? '#0284C7' : '#64748B');

        // Radar wave
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.pingRadius, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.globalAlpha = node.pingAlpha * (isMobile ? 0.40 : 0.45);
        ctx.lineWidth = isMobile ? 0.9 : 1.1;
        ctx.stroke();
        ctx.globalAlpha = 1;

        if (isWH) {
          // --- WAREHOUSE ICON [WH]: Gabled Logistics Shed ---
          ctx.save();
          ctx.translate(node.x, node.y);
          if (isMobile) ctx.scale(0.85, 0.85);

          ctx.fillStyle = '#0D9488';
          ctx.beginPath();
          ctx.moveTo(-4.5, -1);
          ctx.lineTo(0, -5);   // Roof ridge
          ctx.lineTo(4.5, -1);
          ctx.lineTo(4.5, 4);  // Base
          ctx.lineTo(-4.5, 4);
          ctx.closePath();
          ctx.fill();

          // White loading dock bay
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(-1.5, 1, 3, 3);
          ctx.restore();

          // Non-colliding label on desktop only
          if (width > 720) {
            ctx.font = '700 7px "JetBrains Mono", monospace';
            ctx.fillStyle = '#0F172A';
            const lx = node.align === 'left' ? (node.x - 62) : (node.align === 'top' ? node.x - 24 : node.x + 7);
            const ly = node.align === 'top' ? (node.y - 8) : (node.y - 2);
            ctx.fillText(node.name, lx, ly);
          }
        } else if (isTY) {
          // --- TRUCKYARD ICON [TY]: Terminal Gantry / Parking Bay ---
          ctx.save();
          ctx.translate(node.x, node.y);
          if (isMobile) ctx.scale(0.85, 0.85);

          ctx.fillStyle = '#0284C7';
          ctx.beginPath();
          roundRect(ctx, -4.5, -4.5, 9, 9, 2);
          ctx.fill();

          // Parking P glyph
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '800 6px "JetBrains Mono", monospace';
          ctx.fillText('P', -2, 2.5);
          ctx.restore();

          // Non-colliding label on desktop only
          if (width > 720) {
            ctx.font = '700 7px "JetBrains Mono", monospace';
            ctx.fillStyle = '#0F172A';
            const lx = node.align === 'left' ? (node.x - 60) : (node.align === 'top' ? node.x - 24 : node.x + 7);
            const ly = node.align === 'top' ? (node.y - 8) : (node.y - 2);
            ctx.fillText(node.name, lx, ly);
          }
        } else {
          // --- METRO NODE: Glowing Dot ---
          ctx.beginPath();
          ctx.arc(node.x, node.y, isMobile ? 2 : 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#64748B';
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1;
          ctx.stroke();

          if (width > 860) {
            ctx.font = '500 6.5px "JetBrains Mono", monospace';
            ctx.fillStyle = 'rgba(71, 85, 105, 0.75)';
            ctx.fillText(node.name, node.x + 5, node.y - 1);
          }
        }
      });
    }

    // 4. Draw Arrival Telemetry Pings
    function drawTelemetryPings() {
      for (let i = telemetryPings.length - 1; i >= 0; i--) {
        const p = telemetryPings[i];
        p.radius += 0.65;
        p.alpha -= 0.022;

        if (p.alpha <= 0) {
          telemetryPings.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.4;
        ctx.globalAlpha = p.alpha;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    // 5. Draw Ambient HUD Legend (Positioned top-right to balance left-aligned hero card)
    function drawAmbientHud() {
      if (width >= 992) {
        ctx.save();
        ctx.font = '600 8px "JetBrains Mono", monospace';

        // Top right telemetry indicator
        ctx.fillStyle = 'rgba(13, 148, 136, 0.85)';
        const text1 = 'BHARAT FREIGHT CORRIDORS • FULL-WIDTH TELEMATICS MESH';
        const w1 = ctx.measureText(text1).width;
        ctx.fillText(text1, width - w1 - 36, 28);

        // Sub legend
        ctx.fillStyle = 'rgba(100, 116, 139, 0.75)';
        const text2 = '■ [WH] WAREHOUSES  ● [TY] TRUCKYARDS  ─ TRUCKS IN TRANSIT';
        const w2 = ctx.measureText(text2).width;
        ctx.fillText(text2, width - w2 - 36, 42);
        ctx.restore();
      }
    }

    function roundRect(ctx, x, y, width, height, radius) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    }

    function render() {
      if (!isVisible) return;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle background matrix dots
      drawBackgroundMatrix();

      // 2. Draw national express corridors
      drawCorridors();

      // 3. Draw strategic Warehouses, Truckyards, and Metros
      drawNodes();

      // 4. Draw depot arrival telemetry pings
      drawTelemetryPings();

      // 5. Update & draw moving trucks fleet with anti-collision badge tracker
      const renderedBadges = [];
      trucks.forEach(truck => {
        truck.update();
        truck.draw(renderedBadges);
      });

      // 6. Draw ambient telemetry HUD
      drawAmbientHud();

      animationFrameId = requestAnimationFrame(render);
    }

    // Window resize event
    window.addEventListener('resize', resize);

    // Auto-pause when off-screen to preserve CPU & battery
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isVisible = entry.isIntersecting;
          if (isVisible && !animationFrameId) {
            animationFrameId = requestAnimationFrame(render);
          } else if (!isVisible && animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
        });
      }, { threshold: 0.05 });

      observer.observe(canvas.parentElement || canvas);
    }

    // Initialize simulation
    resize();
    animationFrameId = requestAnimationFrame(render);
  }
})();
