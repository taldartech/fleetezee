/**
 * FLEETEZEE — Live National Freight Corridor & Truck Telematics Canvas
 * Seamless, full-bleed hero background simulation with transport trucks cruising along national corridors
 * concentrated on the right side of the screen, leaving the left side pure and crystal clear for text.
 * 
 * Features:
 *  - Seamless full-bleed hero canvas (no artificial bounding boxes or card borders)
 *  - Right-side corridor network connecting 12 major Indian freight depots
 *  - Active 2D freight trucks with cabins, trailers, forward-projecting headlights & exhaust trails
 *  - Live floating telemetry badges [MH-04 • IN TRANSIT], [GJ-01 • FASTAG OK], [LR #TB-94102]
 *  - Destination arrival telemetry radar pulses
 *  - High performance, DPI-scaled, auto-pauses off-screen
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

    // Mouse coordinates
    const mouse = { x: null, y: null };

    // 12 Major Indian Freight Hubs in normalized space
    const HUB_DEFINITIONS = [
      { id: 'del', name: 'DELHI (SGTN)', nx: 0.30, ny: 0.08, isMajor: true },
      { id: 'jpr', name: 'JAIPUR (VKIA)', nx: 0.16, ny: 0.24, isMajor: false },
      { id: 'amd', name: 'AHMEDABAD', nx: 0.06, ny: 0.46, isMajor: true },
      { id: 'bom', name: 'MUMBAI (JNPT)', nx: 0.12, ny: 0.68, isMajor: true },
      { id: 'pnq', name: 'PUNE (CHAKAN)', nx: 0.20, ny: 0.74, isMajor: false },
      { id: 'ngp', name: 'NAGPUR (0-MILE)', nx: 0.48, ny: 0.48, isMajor: true },
      { id: 'lko', name: 'LUCKNOW/KANPUR', nx: 0.56, ny: 0.18, isMajor: false },
      { id: 'ccu', name: 'KOLKATA (DANKUNI)', nx: 0.84, ny: 0.38, isMajor: true },
      { id: 'gau', name: 'GUWAHATI', nx: 0.98, ny: 0.26, isMajor: false },
      { id: 'hyd', name: 'HYDERABAD', nx: 0.48, ny: 0.68, isMajor: true },
      { id: 'blr', name: 'BENGALURU', nx: 0.38, ny: 0.88, isMajor: true },
      { id: 'maa', name: 'CHENNAI', nx: 0.60, ny: 0.90, isMajor: true }
    ];

    // Arterial Highway Corridors Connecting Hubs
    const CORRIDOR_CONNECTIONS = [
      ['del', 'jpr', 'NH-48'],
      ['jpr', 'amd', 'NH-48'],
      ['amd', 'bom', 'NH-48'],
      ['bom', 'pnq', 'Expway'],
      ['pnq', 'blr', 'NH-48'],
      ['blr', 'maa', 'NH-44'],
      ['del', 'lko', 'NH-19'],
      ['lko', 'ccu', 'GT Road'],
      ['del', 'ngp', 'NH-44'],
      ['ngp', 'hyd', 'NH-44'],
      ['hyd', 'blr', 'NH-44'],
      ['bom', 'ngp', 'Samruddhi'],
      ['ngp', 'ccu', 'NH-53'],
      ['ccu', 'maa', 'NH-16'],
      ['maa', 'hyd', 'NH-16'],
      ['ccu', 'gau', 'NH-27']
    ];

    const hubs = [];
    const corridors = [];
    const trucks = [];
    const telemetryPings = [];

    function resize() {
      const parent = canvas.parentElement;
      width = parent.offsetWidth || window.innerWidth;
      height = parent.offsetHeight || 540;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      initHubsAndCorridors();
    }

    function initHubsAndCorridors() {
      hubs.length = 0;
      corridors.length = 0;

      const isDesktop = width >= 992;
      // On desktop, concentrate network strictly on right 50% of the screen
      // On mobile/tablet, span gracefully with lower contrast
      const xStart = isDesktop ? 0.52 : 0.08;
      const xSpan  = isDesktop ? 0.42 : 0.84;
      const yStart = 0.12;
      const ySpan  = 0.76;

      HUB_DEFINITIONS.forEach(def => {
        hubs.push({
          id: def.id,
          name: def.name,
          x: (xStart + def.nx * xSpan) * width,
          y: (yStart + def.ny * ySpan) * height,
          pingRadius: Math.random() * 20,
          pingAlpha: 0.8,
          isMajor: def.isMajor
        });
      });

      const hubMap = {};
      hubs.forEach(h => { hubMap[h.id] = h; });

      CORRIDOR_CONNECTIONS.forEach(([fromId, toId, code]) => {
        const from = hubMap[fromId];
        const to = hubMap[toId];
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
        // Speed: 0.0012 to 0.0026 per frame
        this.speed = 0.0012 + Math.random() * 0.0014;

        // Vehicle Plate & Logistics Mission Data
        const states = ['MH', 'GJ', 'DL', 'KA', 'RJ', 'HR', 'WB', 'TN'];
        const state = states[Math.floor(Math.random() * states.length)];
        const num = Math.floor(1000 + Math.random() * 9000);
        this.plate = `${state}-${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}-${num}`;

        const statuses = ['IN TRANSIT', 'FASTag OK', 'LR #TB-' + Math.floor(100 + Math.random() * 900), 'GPS LOCKED', 'POD PENDING'];
        this.status = statuses[Math.floor(Math.random() * statuses.length)];
        this.kmh = Math.floor(52 + Math.random() * 18);

        this.truckLength = 20;
        this.truckWidth = 8;
        this.showBadge = Math.random() > 0.35;
        this.trail = [];
      }

      update() {
        this.progress += this.speed;
        if (this.progress >= 1) {
          const destHub = this.reversed ? this.corridor.from : this.corridor.to;
          telemetryPings.push({
            x: destHub.x,
            y: destHub.y,
            radius: 4,
            maxRadius: 28,
            alpha: 1,
            color: '#0D9488'
          });
          this.reset();
          this.progress = 0;
        }

        const start = this.reversed ? this.corridor.to : this.corridor.from;
        const end = this.reversed ? this.corridor.from : this.corridor.to;

        this.x = start.x + (end.x - start.x) * this.progress;
        this.y = start.y + (end.y - start.y) * this.progress;
        this.angle = Math.atan2(end.y - start.y, end.x - start.x);

        this.trail.unshift({ x: this.x, y: this.y });
        if (this.trail.length > 8) this.trail.pop();
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // 1. Forward Headlights Beam
        ctx.save();
        const beamGrad = ctx.createRadialGradient(10, 0, 1, 38, 0, 16);
        beamGrad.addColorStop(0, 'rgba(13, 148, 136, 0.42)');
        beamGrad.addColorStop(0.5, 'rgba(37, 99, 235, 0.16)');
        beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(10, -2.5);
        ctx.lineTo(40, -13);
        ctx.lineTo(40, 13);
        ctx.lineTo(10, 2.5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 2. Chassis Shadow
        ctx.fillStyle = 'rgba(15, 23, 42, 0.10)';
        ctx.fillRect(-13, -this.truckWidth / 2 + 1, this.truckLength, this.truckWidth);

        // 3. Cargo Trailer (Deep Slate)
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        roundRect(ctx, -13, -this.truckWidth / 2, 14, this.truckWidth, 2);
        ctx.fill();

        // Teal Brand Stripe on Cargo Body
        ctx.fillStyle = '#0D9488';
        ctx.fillRect(-10, -this.truckWidth / 2 + 1, 7, 1.3);
        ctx.fillRect(-10, this.truckWidth / 2 - 2.3, 7, 1.3);

        // 4. Driver Cabin (Front)
        ctx.fillStyle = '#1E293B';
        ctx.beginPath();
        roundRect(ctx, 1.5, -this.truckWidth / 2 + 0.5, 7, this.truckWidth - 1, 2);
        ctx.fill();

        // Azure Windshield Glass
        ctx.fillStyle = '#38BDF8';
        ctx.fillRect(4.2, -this.truckWidth / 2 + 1.2, 2.2, this.truckWidth - 2.4);

        // Front Headlights
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(8, -this.truckWidth / 2 + 0.8, 1, 1.3);
        ctx.fillRect(8, this.truckWidth / 2 - 2.1, 1, 1.3);

        // Rear Brake Stoplights
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(-13, -this.truckWidth / 2 + 0.8, 0.9, 1.3);
        ctx.fillRect(-13, this.truckWidth / 2 - 2.1, 0.9, 1.3);

        ctx.restore();

        // 5. Floating Telemetry Badge (Unrotated, crisp monospace)
        if (this.showBadge && width > 600) {
          ctx.save();
          const badgeX = this.x + 12;
          const badgeY = this.y - 12;

          ctx.font = '600 8.5px "JetBrains Mono", monospace';
          const text = `${this.plate} • ${this.status}`;
          const textWidth = ctx.measureText(text).width;

          // Translucent white pill
          ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
          ctx.strokeStyle = 'rgba(226, 232, 240, 0.85)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          roundRect(ctx, badgeX - 3, badgeY - 9, textWidth + 12, 14, 4);
          ctx.fill();
          ctx.stroke();

          // Green status indicator dot
          ctx.fillStyle = '#0D9488';
          ctx.beginPath();
          ctx.arc(badgeX + 1, badgeY - 2, 2, 0, Math.PI * 2);
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
      const count = width < 768 ? 6 : 13;
      for (let i = 0; i < count; i++) {
        trucks.push(new MovingTruck(i));
      }
    }

    function drawCorridors() {
      corridors.forEach(c => {
        // Arterial highway corridor track
        ctx.beginPath();
        ctx.moveTo(c.from.x, c.from.y);
        ctx.lineTo(c.to.x, c.to.y);
        ctx.strokeStyle = 'rgba(13, 148, 136, 0.16)';
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Animated traveling dashed telemetry pulse
        ctx.beginPath();
        ctx.moveTo(c.from.x, c.from.y);
        ctx.lineTo(c.to.x, c.to.y);
        ctx.strokeStyle = 'rgba(37, 99, 235, 0.30)';
        ctx.lineWidth = 1.3;
        ctx.setLineDash([4, 7]);
        c.dashOffset = (c.dashOffset - 0.4) % 11;
        ctx.lineDashOffset = c.dashOffset;
        ctx.stroke();
        ctx.setLineDash([]);
      });
    }

    function drawHubs() {
      hubs.forEach(h => {
        // 1. Radar pulse ring
        h.pingRadius += 0.32;
        h.pingAlpha = Math.max(0, 1 - h.pingRadius / 26);
        if (h.pingRadius > 26) {
          h.pingRadius = 3;
          h.pingAlpha = 0.8;
        }

        ctx.beginPath();
        ctx.arc(h.x, h.y, h.pingRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#0D9488';
        ctx.globalAlpha = h.pingAlpha * 0.45;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // 2. Hub core marker dot
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.isMajor ? 4.2 : 3, 0, Math.PI * 2);
        ctx.fillStyle = '#0D9488';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 3. Depot City Label
        if (width > 600) {
          ctx.font = '700 8.5px "JetBrains Mono", monospace';
          ctx.fillStyle = '#0F172A';
          ctx.fillText(h.name, h.x + 6, h.y - 3);
        }
      });
    }

    function drawTelemetryPings() {
      for (let i = telemetryPings.length - 1; i >= 0; i--) {
        const p = telemetryPings[i];
        p.radius += 0.7;
        p.alpha -= 0.025;

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

    function drawAmbientHud() {
      if (width >= 992) {
        ctx.save();
        ctx.font = '600 8.5px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(13, 148, 136, 0.70)';
        const text = 'BHARAT FREIGHT CORRIDORS • LIVE TELEMATICS MESH';
        const txtWidth = ctx.measureText(text).width;
        ctx.fillText(text, width - txtWidth - 32, 38);
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

      // 1. Draw highway corridors
      drawCorridors();

      // 2. Draw destination freight hubs
      drawHubs();

      // 3. Draw depot arrival telemetry pings
      drawTelemetryPings();

      // 4. Update and draw moving trucks
      trucks.forEach(truck => {
        truck.update();
        truck.draw();
      });

      // 5. Ambient HUD telemetry tag
      drawAmbientHud();

      animationFrameId = requestAnimationFrame(render);
    }

    // Window events
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
