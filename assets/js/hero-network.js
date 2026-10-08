/**
 * FLEETEZEE — Complete India Freight Network, Warehouses, Truckyards & Telematics Simulation
 * Full-width background canvas across the entire hero showing:
 *  - Complete geographical silhouette, contour mesh & national arterial highway grid of India
 *  - Strategic Warehouses [WH] (Multi-Modal Logistics Parks & Fulfillment Hubs)
 *  - Strategic Truckyards [TY] (Transport Nagar Terminals, Port Container Yards)
 *  - Active fleet of 2D vector freight trucks cruising corridors with headlights, taillights & live telemetry badges
 *  - Destination arrival radar pulses and live logistics event signals
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

    // Complete India Boundary Polygon in normalized coordinates [0..1] x [0..1]
    const INDIA_BOUNDARY = [
      [0.48, 0.03], // North Kashmir / Siachen
      [0.52, 0.05], // Ladakh East
      [0.55, 0.10], // Himachal North
      [0.57, 0.15], // Uttarakhand
      [0.64, 0.18], // Western Nepal border
      [0.71, 0.19], // Sikkim
      [0.78, 0.20], // Bhutan
      [0.86, 0.17], // Arunachal Pradesh (Tawang)
      [0.93, 0.20], // Easternmost tip (Kibithu)
      [0.92, 0.29], // Nagaland / Manipur
      [0.86, 0.36], // Mizoram
      [0.83, 0.32], // Tripura
      [0.81, 0.30], // Meghalaya
      [0.78, 0.35], // North Bengal / Bangladesh border
      [0.75, 0.40], // Kolkata Sundarbans
      [0.71, 0.48], // Odisha coast (Puri / Paradip)
      [0.66, 0.58], // Visakhapatnam
      [0.62, 0.68], // Vijayawada / Ongole
      [0.59, 0.76], // Chennai / Puducherry
      [0.56, 0.84], // Rameswaram
      [0.52, 0.92], // Kanyakumari (Southernmost tip)
      [0.49, 0.86], // Thiruvananthapuram
      [0.47, 0.78], // Kochi / Kozhikode
      [0.46, 0.70], // Mangaluru
      [0.44, 0.61], // Goa (Mormugao)
      [0.42, 0.54], // Mumbai / JNPT
      [0.39, 0.49], // Surat / Daman
      [0.35, 0.48], // Gulf of Khambhat
      [0.30, 0.49], // Saurashtra / Gir
      [0.25, 0.46], // Porbandar / Dwarka
      [0.26, 0.40], // Gulf of Kutch / Kandla
      [0.29, 0.35], // Rann of Kutch
      [0.33, 0.31], // Barmer / West Rajasthan
      [0.35, 0.23], // Jaisalmer / Bikaner
      [0.39, 0.17], // Punjab / Amritsar
      [0.43, 0.11]  // Jammu / Pir Panjal
    ];

    // Strategic Logistics Warehouses [WH]
    const WAREHOUSES = [
      { id: 'wh_bhiwandi', name: 'BHIWANDI WH', full: 'Bhiwandi Logistics Park', nx: 0.43, ny: 0.54, type: 'wh' },
      { id: 'wh_bilaspur', name: 'BILASPUR WH', full: 'NCR Bilaspur Multi-Modal Hub', nx: 0.48, ny: 0.23, type: 'wh' },
      { id: 'wh_hoskote',  name: 'HOSKOTE WH',  full: 'Hoskote Logistics Cluster', nx: 0.52, ny: 0.77, type: 'wh' },
      { id: 'wh_aslali',   name: 'ASLALI WH',   full: 'Aslali ICD Logistics Park', nx: 0.37, ny: 0.44, type: 'wh' },
      { id: 'wh_dankuni',  name: 'DANKUNI WH',  full: 'Dankuni Multi-Modal Terminal', nx: 0.74, ny: 0.40, type: 'wh' },
      { id: 'wh_chakan',   name: 'CHAKAN WH',   full: 'Chakan Auto-Logistics Park', nx: 0.45, ny: 0.58, type: 'wh' },
      { id: 'wh_butibori', name: 'BUTIBORI WH', full: 'Butibori Zero-Mile Hub', nx: 0.54, ny: 0.49, type: 'wh' },
      { id: 'wh_sricity',  name: 'SRI CITY WH', full: 'Sri City Integrated Logistics', nx: 0.58, ny: 0.76, type: 'wh' }
    ];

    // Strategic Truckyards [TY] (Transporter Terminals & Gateways)
    const TRUCKYARDS = [
      { id: 'ty_sgtn',     name: 'SGTN DELHI',    full: 'Sanjay Gandhi Transport Nagar', nx: 0.47, ny: 0.20, type: 'ty' },
      { id: 'ty_jnpt',     name: 'JNPT YARD',     full: 'JNPT Port Container Terminal', nx: 0.42, ny: 0.56, type: 'ty' },
      { id: 'ty_kalamna',  name: 'KALAMNA YARD',  full: 'Kalamna 0-Mile Truck Terminal', nx: 0.55, ny: 0.48, type: 'ty' },
      { id: 'ty_vkia',     name: 'VKIA JAIPUR',   full: 'Transport Nagar VKIA Jaipur', nx: 0.42, ny: 0.27, type: 'ty' },
      { id: 'ty_autonagar',name: 'AUTONAGAR HYD', full: 'Autonagar Truck Terminal Hyd', nx: 0.54, ny: 0.63, type: 'ty' },
      { id: 'ty_nelamang', name: 'NELAMANGALA TY',full: 'Nelamangala Truck Terminal Blr', nx: 0.50, ny: 0.75, type: 'ty' },
      { id: 'ty_madhavaram',name:'MADHAVARAM TY', full: 'Madhavaram Truck Terminal Chn', nx: 0.59, ny: 0.74, type: 'ty' },
      { id: 'ty_fazalganj',name: 'FAZALGANJ TY',  full: 'Fazalganj Transport Nagar Knp', nx: 0.56, ny: 0.28, type: 'ty' },
      { id: 'ty_amingaon', name: 'AMINGAON TY',   full: 'Amingaon Container Depot Guw', nx: 0.86, ny: 0.27, type: 'ty' },
      { id: 'ty_vapi',     name: 'VAPI GIDC TY',  full: 'Vapi Industrial Truck Yard', nx: 0.40, ny: 0.50, type: 'ty' }
    ];

    // Other Key Freight Nodes / Metros
    const METRO_NODES = [
      { id: 'node_srinagar', name: 'SRINAGAR', nx: 0.45, ny: 0.08, type: 'metro' },
      { id: 'node_ludhiana', name: 'LUDHIANA', nx: 0.44, ny: 0.16, type: 'metro' },
      { id: 'node_lucknow',  name: 'LUCKNOW',  nx: 0.58, ny: 0.26, type: 'metro' },
      { id: 'node_varanasi', name: 'VARANASI', nx: 0.63, ny: 0.31, type: 'metro' },
      { id: 'node_patna',    name: 'PATNA',    nx: 0.68, ny: 0.30, type: 'metro' },
      { id: 'node_siliguri', name: 'SILIGURI', nx: 0.76, ny: 0.26, type: 'metro' },
      { id: 'node_bhuban',   name: 'BHUBANESWAR', nx: 0.69, ny: 0.49, type: 'metro' },
      { id: 'node_vizag',    name: 'VIZAG PORT', nx: 0.65, ny: 0.59, type: 'metro' },
      { id: 'node_vijayawada', name: 'VIJAYAWADA', nx: 0.60, ny: 0.67, type: 'metro' },
      { id: 'node_surat',    name: 'SURAT',    nx: 0.39, ny: 0.48, type: 'metro' },
      { id: 'node_indore',   name: 'INDORE',   nx: 0.45, ny: 0.41, type: 'metro' },
      { id: 'node_raipur',   name: 'RAIPUR',   nx: 0.61, ny: 0.47, type: 'metro' },
      { id: 'node_coimbatore',name: 'COIMBATORE',nx: 0.50, ny: 0.82, type: 'metro' },
      { id: 'node_kochi',    name: 'KOCHI PORT',nx: 0.48, ny: 0.84, type: 'metro' },
      { id: 'node_kanya',    name: 'KANYAKUMARI',nx: 0.52, ny: 0.91, type: 'metro' }
    ];

    // National Highway Arterial Connections
    const CORRIDOR_CONNECTIONS = [
      // Golden Quadrilateral & NH-48 West
      ['ty_sgtn', 'ty_vkia', 'NH-48'],
      ['ty_vkia', 'wh_aslali', 'NH-48'],
      ['wh_aslali', 'node_surat', 'NH-48'],
      ['node_surat', 'ty_vapi', 'NH-48'],
      ['ty_vapi', 'wh_bhiwandi', 'NH-48'],
      ['wh_bhiwandi', 'ty_jnpt', 'Expway'],
      ['wh_bhiwandi', 'wh_chakan', 'Expway'],
      ['wh_chakan', 'ty_nelamang', 'NH-48'],
      ['ty_nelamang', 'wh_hoskote', 'NICE Rd'],
      ['wh_hoskote', 'wh_sricity', 'NH-48'],
      ['wh_sricity', 'ty_madhavaram', 'NH-16'],

      // NH-44 North-South Backbone
      ['node_srinagar', 'node_ludhiana', 'NH-44'],
      ['node_ludhiana', 'ty_sgtn', 'NH-44'],
      ['ty_sgtn', 'wh_bilaspur', 'NH-48'],
      ['ty_sgtn', 'ty_fazalganj', 'NH-19'],
      ['ty_sgtn', 'ty_kalamna', 'NH-44'],
      ['ty_kalamna', 'wh_butibori', 'NH-44'],
      ['wh_butibori', 'ty_autonagar', 'NH-44'],
      ['ty_autonagar', 'ty_nelamang', 'NH-44'],
      ['ty_nelamang', 'node_coimbatore', 'NH-44'],
      ['node_coimbatore', 'node_kochi', 'NH-544'],
      ['node_coimbatore', 'node_kanya', 'NH-44'],

      // NH-19 & NH-27 East-West Corridors
      ['ty_fazalganj', 'node_lucknow', 'NH-27'],
      ['node_lucknow', 'node_varanasi', 'NH-19'],
      ['node_varanasi', 'node_patna', 'NH-19'],
      ['node_patna', 'node_siliguri', 'NH-27'],
      ['node_siliguri', 'ty_amingaon', 'NH-27'],
      ['node_varanasi', 'wh_dankuni', 'NH-19'],

      // Eastern Coastal NH-16
      ['wh_dankuni', 'node_bhuban', 'NH-16'],
      ['node_bhuban', 'node_vizag', 'NH-16'],
      ['node_vizag', 'node_vijayawada', 'NH-16'],
      ['node_vijayawada', 'ty_madhavaram', 'NH-16'],

      // Samruddhi Mahamarg & Central Links
      ['wh_bhiwandi', 'ty_kalamna', 'Samruddhi'],
      ['wh_aslali', 'node_indore', 'NH-47'],
      ['node_indore', 'ty_kalamna', 'NH-47'],
      ['ty_kalamna', 'node_raipur', 'NH-53'],
      ['node_raipur', 'wh_dankuni', 'NH-53'],
      ['node_vijayawada', 'ty_autonagar', 'NH-65']
    ];

    const allNodes = [];
    const corridors = [];
    const trucks = [];
    const telemetryPings = [];
    let transformedBoundary = [];

    function resize() {
      const parent = canvas.parentElement;
      width = parent.offsetWidth || window.innerWidth;
      height = parent.offsetHeight || 600;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      initNetwork();
    }

    function initNetwork() {
      allNodes.length = 0;
      corridors.length = 0;
      transformedBoundary.length = 0;

      // Transform normalized coordinates to fill the full hero canvas gracefully
      // On wide screens (>= 1200px), center India across the canvas with generous scale
      const isWide = width >= 992;
      const mapHeight = height * 0.88;
      const mapWidth = mapHeight * 0.95; // Natural geographic aspect ratio of India

      // Center the map horizontally across the full canvas
      // On desktop, shift slightly to 54% to leave breathing room for left typography
      const offsetX = isWide ? (width * 0.54 - mapWidth * 0.5) : (width * 0.5 - mapWidth * 0.5);
      const offsetY = height * 0.06;

      function toScreen(nx, ny) {
        return {
          x: offsetX + nx * mapWidth,
          y: offsetY + ny * mapHeight
        };
      }

      // 1. Transform India Boundary Polygon
      INDIA_BOUNDARY.forEach(([nx, ny]) => {
        transformedBoundary.push(toScreen(nx, ny));
      });

      // 2. Populate Nodes (Warehouses, Truckyards, Metros)
      const nodeDefinitions = [...WAREHOUSES, ...TRUCKYARDS, ...METRO_NODES];
      nodeDefinitions.forEach(def => {
        const pt = toScreen(def.nx, def.ny);
        allNodes.push({
          id: def.id,
          name: def.name,
          full: def.full,
          type: def.type, // 'wh', 'ty', or 'metro'
          x: pt.x,
          y: pt.y,
          pingRadius: Math.random() * 18,
          pingAlpha: 0.8
        });
      });

      const nodeMap = {};
      allNodes.forEach(n => { nodeMap[n.id] = n; });

      // 3. Populate Arterial Corridors
      CORRIDOR_CONNECTIONS.forEach(([fromId, toId, code]) => {
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
        // Cruising speed
        this.speed = 0.0011 + Math.random() * 0.0013;

        // Vehicle Plate & Mission Data
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
        this.kmh = Math.floor(54 + Math.random() * 16);

        this.truckLength = 18;
        this.truckWidth = 7.5;
        this.showBadge = Math.random() > 0.40;
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

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // 1. Forward Headlights Beam
        ctx.save();
        const beamGrad = ctx.createRadialGradient(8, 0, 1, 32, 0, 14);
        beamGrad.addColorStop(0, 'rgba(13, 148, 136, 0.40)');
        beamGrad.addColorStop(0.5, 'rgba(37, 99, 235, 0.14)');
        beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(8, -2);
        ctx.lineTo(34, -10);
        ctx.lineTo(34, 10);
        ctx.lineTo(8, 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 2. Chassis Shadow
        ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
        ctx.fillRect(-11, -this.truckWidth / 2 + 1, this.truckLength, this.truckWidth);

        // 3. Cargo Trailer (Deep Slate)
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        roundRect(ctx, -11, -this.truckWidth / 2, 12, this.truckWidth, 1.5);
        ctx.fill();

        // Teal Brand Stripe on Cargo Trailer
        ctx.fillStyle = '#0D9488';
        ctx.fillRect(-8, -this.truckWidth / 2 + 0.8, 6, 1.2);
        ctx.fillRect(-8, this.truckWidth / 2 - 2.0, 6, 1.2);

        // 4. Driver Cabin (Front)
        ctx.fillStyle = '#1E293B';
        ctx.beginPath();
        roundRect(ctx, 1.5, -this.truckWidth / 2 + 0.5, 6, this.truckWidth - 1, 1.5);
        ctx.fill();

        // Windshield Glass (Azure)
        ctx.fillStyle = '#38BDF8';
        ctx.fillRect(4.0, -this.truckWidth / 2 + 1.2, 1.8, this.truckWidth - 2.4);

        // Front Headlights
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(7.2, -this.truckWidth / 2 + 0.8, 0.8, 1.2);
        ctx.fillRect(7.2, this.truckWidth / 2 - 2.0, 0.8, 1.2);

        // Rear Brake Stoplights
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(-11, -this.truckWidth / 2 + 0.8, 0.8, 1.2);
        ctx.fillRect(-11, this.truckWidth / 2 - 2.0, 0.8, 1.2);

        ctx.restore();

        // 5. Floating Telemetry Badge (Monospace, unrotated)
        if (this.showBadge && width > 640) {
          ctx.save();
          const badgeX = this.x + 10;
          const badgeY = this.y - 10;

          ctx.font = '600 8px "JetBrains Mono", monospace';
          const text = `${this.plate} • ${this.status}`;
          const textWidth = ctx.measureText(text).width;

          // Frosted pill background
          ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
          ctx.strokeStyle = 'rgba(226, 232, 240, 0.85)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          roundRect(ctx, badgeX - 3, badgeY - 8, textWidth + 10, 13, 3);
          ctx.fill();
          ctx.stroke();

          // Green live status dot
          ctx.fillStyle = '#0D9488';
          ctx.beginPath();
          ctx.arc(badgeX + 1, badgeY - 1.5, 1.8, 0, Math.PI * 2);
          ctx.fill();

          // Text label
          ctx.fillStyle = '#0F172A';
          ctx.fillText(text, badgeX + 6, badgeY + 1);
          ctx.restore();
        }
      }
    }

    function initTrucks() {
      trucks.length = 0;
      const count = width < 768 ? 8 : 18;
      for (let i = 0; i < count; i++) {
        trucks.push(new MovingTruck(i));
      }
    }

    // 1. Draw Complete India Geographical Boundary & Mesh
    function drawIndiaLandmass() {
      if (transformedBoundary.length < 3) return;

      ctx.save();

      // Outer Boundary Path
      ctx.beginPath();
      ctx.moveTo(transformedBoundary[0].x, transformedBoundary[0].y);
      for (let i = 1; i < transformedBoundary.length; i++) {
        ctx.lineTo(transformedBoundary[i].x, transformedBoundary[i].y);
      }
      ctx.closePath();

      // Subtle filled landmass tint
      ctx.fillStyle = 'rgba(13, 148, 136, 0.022)';
      ctx.fill();

      // Subtle boundary outline glow
      ctx.strokeStyle = 'rgba(13, 148, 136, 0.22)';
      ctx.lineWidth = 1.3;
      ctx.stroke();

      // Internal Latitude / Longitude Topographic Grid Mesh
      ctx.save();
      ctx.clip(); // Clip inside India landmass

      ctx.strokeStyle = 'rgba(15, 23, 42, 0.035)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([3, 8]);

      // Horizontal parallels
      for (let y = 0; y < height; y += 42) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Vertical meridians
      for (let x = 0; x < width; x += 42) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();

      ctx.restore();
    }

    // 2. Draw Arterial National Corridors
    function drawCorridors() {
      corridors.forEach(c => {
        // Base highway road
        ctx.beginPath();
        ctx.moveTo(c.from.x, c.from.y);
        ctx.lineTo(c.to.x, c.to.y);
        ctx.strokeStyle = 'rgba(13, 148, 136, 0.15)';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // Traveling dashed telemetry data pulse
        ctx.beginPath();
        ctx.moveTo(c.from.x, c.from.y);
        ctx.lineTo(c.to.x, c.to.y);
        ctx.strokeStyle = 'rgba(37, 99, 235, 0.25)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 7]);
        c.dashOffset = (c.dashOffset - 0.35) % 10;
        ctx.lineDashOffset = c.dashOffset;
        ctx.stroke();
        ctx.setLineDash([]);
      });
    }

    // 3. Draw Nodes (Warehouses, Truckyards, Metros) with custom iconography
    function drawNodes() {
      allNodes.forEach(node => {
        // Pulse ring
        node.pingRadius += 0.28;
        node.pingAlpha = Math.max(0, 1 - node.pingRadius / 22);
        if (node.pingRadius > 22) {
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
        ctx.globalAlpha = node.pingAlpha * 0.4;
        ctx.lineWidth = 1.1;
        ctx.stroke();
        ctx.globalAlpha = 1;

        if (isWH) {
          // --- WAREHOUSE ICON [WH]: Gabled Roof Logistics Shed ---
          ctx.save();
          ctx.translate(node.x, node.y);

          // Mini warehouse building shape
          ctx.fillStyle = '#0D9488';
          ctx.beginPath();
          ctx.moveTo(-4.5, -1);
          ctx.lineTo(0, -5);   // Roof ridge
          ctx.lineTo(4.5, -1);
          ctx.lineTo(4.5, 4);  // Base
          ctx.lineTo(-4.5, 4);
          ctx.closePath();
          ctx.fill();

          // Loading bay dock (white cutout)
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(-1.5, 1, 3, 3);
          ctx.restore();

          // Label
          if (width > 680) {
            ctx.font = '700 7.5px "JetBrains Mono", monospace';
            ctx.fillStyle = '#0F172A';
            ctx.fillText(node.name, node.x + 7, node.y - 2);
          }
        } else if (isTY) {
          // --- TRUCKYARD ICON [TY]: Parking Bay / Gantry Terminal ---
          ctx.save();
          ctx.translate(node.x, node.y);

          // Rounded terminal gantry
          ctx.fillStyle = '#0284C7';
          ctx.beginPath();
          roundRect(ctx, -4.5, -4.5, 9, 9, 2);
          ctx.fill();

          // Parking / Bay glyph (P symbol)
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '800 6px "JetBrains Mono", monospace';
          ctx.fillText('P', -2, 2.5);
          ctx.restore();

          // Label
          if (width > 680) {
            ctx.font = '700 7.5px "JetBrains Mono", monospace';
            ctx.fillStyle = '#0F172A';
            ctx.fillText(node.name, node.x + 7, node.y - 2);
          }
        } else {
          // --- METRO NODE: Clean Dot ---
          ctx.beginPath();
          ctx.arc(node.x, node.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#64748B';
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1;
          ctx.stroke();

          if (width > 768) {
            ctx.font = '500 7px "JetBrains Mono", monospace';
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
        ctx.lineWidth = 1.3;
        ctx.globalAlpha = p.alpha;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    // 5. Draw Ambient HUD Legend / Telemetry Tag
    function drawAmbientHud() {
      if (width >= 992) {
        ctx.save();
        ctx.font = '600 8px "JetBrains Mono", monospace';

        // Right side badge
        ctx.fillStyle = 'rgba(13, 148, 136, 0.75)';
        const text1 = 'BHARAT FREIGHT CORRIDORS • COMPLETE PAN-INDIA MESH';
        const txtWidth1 = ctx.measureText(text1).width;
        ctx.fillText(text1, width - txtWidth1 - 32, 28);

        // Sub legend: Warehouses & Truckyards
        ctx.fillStyle = 'rgba(100, 116, 139, 0.70)';
        const text2 = '■ [WH] WAREHOUSES  ● [TY] TRUCKYARDS  ─ TRUCKS IN TRANSIT';
        const txtWidth2 = ctx.measureText(text2).width;
        ctx.fillText(text2, width - txtWidth2 - 32, 42);
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

      // 1. Draw complete India landmass & mesh across full background
      drawIndiaLandmass();

      // 2. Draw national highway corridors connecting hubs
      drawCorridors();

      // 3. Draw strategic Warehouses, Truckyards, and Metros
      drawNodes();

      // 4. Draw depot arrival telemetry pings
      drawTelemetryPings();

      // 5. Update & draw moving trucks fleet
      trucks.forEach(truck => {
        truck.update();
        truck.draw();
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
