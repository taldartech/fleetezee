/**
 * FLEETEZEE — Bharat Freight Corridors & Live Fleet Telematics Canvas Simulation
 * Visualizes active transport trucks moving along national highway corridors within India.
 * 
 * Features:
 *  - High-precision geometric vector map of India (Bharat)
 *  - 12 Major Indian freight hubs (Delhi SGTN, Mumbai JNPT, Bengaluru Nelamangala, etc.)
 *  - Arterial highway corridors (Golden Quadrilateral, NH-44, NH-16, Samruddhi)
 *  - Moving 2D freight trucks with cabins, cargo trailers, headlights & motion trails
 *  - Dynamic telemetry tags: [MH-04 • IN TRANSIT], [GJ-01 • FASTAG OK], [LR #TB-94102]
 *  - Destination arrival telemetry radar pulses
 *  - High performance, DPI-scaled, auto-pauses when off-screen
 */

(function () {
  'use strict';

  // Support both new console canvas and legacy fallbacks
  const canvases = document.querySelectorAll('.telematics-india-canvas, #heroCanvas, .telematics-bg-canvas');
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
    const mouse = { x: null, y: null, radius: 80 };

    // Authentic Geometric Outline of India (normalized 0..1 coordinates)
    const INDIA_POLYGON = [
      { x: 0.39, y: 0.04 }, { x: 0.43, y: 0.03 }, { x: 0.47, y: 0.07 }, { x: 0.49, y: 0.12 },
      { x: 0.48, y: 0.16 }, { x: 0.52, y: 0.20 }, { x: 0.58, y: 0.23 }, { x: 0.64, y: 0.25 },
      { x: 0.69, y: 0.25 }, { x: 0.71, y: 0.24 }, { x: 0.76, y: 0.23 }, { x: 0.84, y: 0.21 },
      { x: 0.91, y: 0.24 }, { x: 0.94, y: 0.29 }, { x: 0.94, y: 0.35 }, { x: 0.90, y: 0.42 },
      { x: 0.86, y: 0.46 }, { x: 0.81, y: 0.45 }, { x: 0.78, y: 0.42 }, { x: 0.75, y: 0.40 },
      { x: 0.72, y: 0.44 }, { x: 0.73, y: 0.50 }, { x: 0.72, y: 0.53 }, { x: 0.69, y: 0.57 },
      { x: 0.66, y: 0.62 }, { x: 0.62, y: 0.68 }, { x: 0.58, y: 0.74 }, { x: 0.54, y: 0.80 },
      { x: 0.52, y: 0.83 }, { x: 0.49, y: 0.89 }, { x: 0.46, y: 0.95 }, { x: 0.44, y: 0.99 },
      { x: 0.43, y: 0.96 }, { x: 0.40, y: 0.90 }, { x: 0.38, y: 0.84 }, { x: 0.35, y: 0.78 },
      { x: 0.33, y: 0.72 }, { x: 0.30, y: 0.66 }, { x: 0.28, y: 0.62 }, { x: 0.24, y: 0.62 },
      { x: 0.18, y: 0.60 }, { x: 0.14, y: 0.54 }, { x: 0.16, y: 0.48 }, { x: 0.22, y: 0.46 },
      { x: 0.23, y: 0.40 }, { x: 0.25, y: 0.33 }, { x: 0.28, y: 0.26 }, { x: 0.32, y: 0.20 },
      { x: 0.34, y: 0.13 }, { x: 0.37, y: 0.05 }
    ];

    // Major Freight Hubs accurately located in normalized coordinate space
    const HUB_DEFINITIONS = [
      { id: 'del', name: 'DELHI', full: 'DELHI (SGTN)', nx: 0.39, ny: 0.28, state: 'NCR Hub', isMajor: true },
      { id: 'jpr', name: 'JAIPUR', full: 'JAIPUR (VKIA)', nx: 0.34, ny: 0.35, state: 'Transit Depot', isMajor: false },
      { id: 'amd', name: 'AHMEDABAD', full: 'AHMEDABAD (ASLALI)', nx: 0.25, ny: 0.49, state: 'Logistics Park', isMajor: true },
      { id: 'bom', name: 'MUMBAI', full: 'MUMBAI (JNPT)', nx: 0.31, ny: 0.65, state: 'Port Terminal', isMajor: true },
      { id: 'pnq', name: 'PUNE', full: 'PUNE (CHAKAN)', nx: 0.35, ny: 0.68, state: 'Auto Belt', isMajor: false },
      { id: 'ngp', name: 'NAGPUR', full: 'NAGPUR (KALAMNA)', nx: 0.46, ny: 0.52, state: 'Zero-Mile Hub', isMajor: true },
      { id: 'hyd', name: 'HYDERABAD', full: 'HYDERABAD (AUTONAGAR)', nx: 0.47, ny: 0.66, state: 'Deccan Junction', isMajor: true },
      { id: 'blr', name: 'BENGALURU', full: 'BENGALURU (NELAMANGALA)', nx: 0.43, ny: 0.82, state: 'South Freight Hub', isMajor: true },
      { id: 'maa', name: 'CHENNAI', full: 'CHENNAI (MADHAVARAM)', nx: 0.51, ny: 0.80, state: 'Maritime CFS', isMajor: true },
      { id: 'ccu', name: 'KOLKATA', full: 'KOLKATA (DANKUNI)', nx: 0.71, ny: 0.48, state: 'Eastern Gateway', isMajor: true },
      { id: 'lko', name: 'LUCKNOW', full: 'LUCKNOW / KANPUR', nx: 0.50, ny: 0.33, state: 'Gangetic Freight', isMajor: false },
      { id: 'gau', name: 'GUWAHATI', full: 'GUWAHATI (AMINGAON)', nx: 0.84, ny: 0.33, state: 'NE Gateway', isMajor: false }
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

    let transform = { scale: 1, offsetX: 0, offsetY: 0 };
    const hubs = [];
    const corridors = [];
    const trucks = [];
    const telemetryPings = [];

    function resize() {
      const parent = canvas.parentElement;
      width = parent.offsetWidth || 500;
      height = parent.offsetHeight || 500;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      // Compute scale & offsets to center India inside canvas
      const minX = 0.14, maxX = 0.94;
      const minY = 0.03, maxY = 0.99;
      const polyW = maxX - minX;
      const polyH = maxY - minY;

      const padX = width < 480 ? 16 : 28;
      const padY = height < 480 ? 16 : 28;
      const availW = width - padX * 2;
      const availH = height - padY * 2;

      const scale = Math.min(availW / polyW, availH / polyH);
      const offsetX = (width - polyW * scale) / 2 - minX * scale;
      const offsetY = (height - polyH * scale) / 2 - minY * scale;

      transform = { scale, offsetX, offsetY };

      initHubsAndCorridors();
    }

    function toCanvas(nx, ny) {
      return {
        x: transform.offsetX + nx * transform.scale,
        y: transform.offsetY + ny * transform.scale
      };
    }

    function initHubsAndCorridors() {
      hubs.length = 0;
      corridors.length = 0;

      HUB_DEFINITIONS.forEach(def => {
        const pt = toCanvas(def.nx, def.ny);
        hubs.push({
          id: def.id,
          name: def.name,
          full: def.full,
          state: def.state,
          x: pt.x,
          y: pt.y,
          pingRadius: Math.random() * 18,
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
        // Cruising speed
        this.speed = 0.0012 + Math.random() * 0.0016;

        // Realistic Indian Vehicle Plates & Logistics Missions
        const states = ['MH', 'GJ', 'DL', 'KA', 'RJ', 'HR', 'WB', 'TN'];
        const state = states[Math.floor(Math.random() * states.length)];
        const num = Math.floor(1000 + Math.random() * 9000);
        this.plate = `${state}-${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}-${num}`;

        const statuses = ['IN TRANSIT', 'FASTag OK', 'LR #TB-' + Math.floor(100 + Math.random() * 900), 'GPS LOCKED', 'POD PENDING'];
        this.status = statuses[Math.floor(Math.random() * statuses.length)];
        this.kmh = Math.floor(52 + Math.random() * 18);

        this.truckLength = 19;
        this.truckWidth = 7.5;
        this.showBadge = Math.random() > 0.40;
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
            maxRadius: 26,
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
        if (this.trail.length > 7) this.trail.pop();
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // 1. Forward Headlights Beam
        ctx.save();
        const beamGrad = ctx.createRadialGradient(10, 0, 1, 36, 0, 16);
        beamGrad.addColorStop(0, 'rgba(13, 148, 136, 0.40)');
        beamGrad.addColorStop(0.5, 'rgba(37, 99, 235, 0.15)');
        beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(9, -2.5);
        ctx.lineTo(38, -12);
        ctx.lineTo(38, 12);
        ctx.lineTo(9, 2.5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 2. Chassis Shadow
        ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
        ctx.fillRect(-12, -this.truckWidth / 2 + 1, this.truckLength, this.truckWidth);

        // 3. Cargo Trailer / Container (Deep Slate)
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        roundRect(ctx, -12, -this.truckWidth / 2, 13, this.truckWidth, 2);
        ctx.fill();

        // Teal Brand Stripe on Cargo Box
        ctx.fillStyle = '#0D9488';
        ctx.fillRect(-9, -this.truckWidth / 2 + 1, 6, 1.2);
        ctx.fillRect(-9, this.truckWidth / 2 - 2.2, 6, 1.2);

        // 4. Driver Cabin (Front)
        ctx.fillStyle = '#1E293B';
        ctx.beginPath();
        roundRect(ctx, 1.5, -this.truckWidth / 2 + 0.5, 6.5, this.truckWidth - 1, 2);
        ctx.fill();

        // Windshield Glass (Azure)
        ctx.fillStyle = '#38BDF8';
        ctx.fillRect(4, -this.truckWidth / 2 + 1.2, 2, this.truckWidth - 2.4);

        // Headlight lamps
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(7.5, -this.truckWidth / 2 + 0.8, 1, 1.2);
        ctx.fillRect(7.5, this.truckWidth / 2 - 2.0, 1, 1.2);

        // Rear stop lights
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(-12, -this.truckWidth / 2 + 0.8, 0.8, 1.2);
        ctx.fillRect(-12, this.truckWidth / 2 - 2.0, 0.8, 1.2);

        ctx.restore();

        // 5. Floating Telemetry Badge
        if (this.showBadge && width > 420) {
          ctx.save();
          const badgeX = this.x + 10;
          const badgeY = this.y - 12;

          ctx.font = '600 8.5px "JetBrains Mono", monospace';
          const text = `${this.plate} • ${this.status}`;
          const textWidth = ctx.measureText(text).width;

          // Crisp white pill
          ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
          ctx.strokeStyle = '#E2E8F0';
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
      const count = width < 500 ? 7 : 12;
      for (let i = 0; i < count; i++) {
        trucks.push(new MovingTruck(i));
      }
    }

    function drawIndiaMap() {
      if (INDIA_POLYGON.length < 3) return;

      ctx.save();

      // Path of India boundary
      ctx.beginPath();
      const first = toCanvas(INDIA_POLYGON[0].x, INDIA_POLYGON[0].y);
      ctx.moveTo(first.x, first.y);
      for (let i = 1; i < INDIA_POLYGON.length; i++) {
        const pt = toCanvas(INDIA_POLYGON[i].x, INDIA_POLYGON[i].y);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();

      // Subtle high-tech fill inside India
      ctx.fillStyle = 'rgba(13, 148, 136, 0.04)';
      ctx.fill();

      // Glowing outer technological contour
      ctx.strokeStyle = '#0D9488';
      ctx.lineWidth = 1.6;
      ctx.shadowColor = 'rgba(13, 148, 136, 0.35)';
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Subtle tech coordinate grid inside India
      ctx.save();
      ctx.clip(); // Restrict grid inside India boundary
      ctx.strokeStyle = 'rgba(13, 148, 136, 0.06)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      // Ambient Territory Watermark
      ctx.font = '700 8.5px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(100, 116, 139, 0.35)';
      ctx.letterSpacing = '0.12em';
      const watermark = 'BHARAT FREIGHT CORRIDORS';
      ctx.fillText(watermark, width * 0.08, height * 0.94);

      ctx.restore();
    }

    function drawCorridors() {
      corridors.forEach(c => {
        // Base arterial highway track
        ctx.beginPath();
        ctx.moveTo(c.from.x, c.from.y);
        ctx.lineTo(c.to.x, c.to.y);
        ctx.strokeStyle = 'rgba(13, 148, 136, 0.20)';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Traveling dashed telematics telemetry line
        ctx.beginPath();
        ctx.moveTo(c.from.x, c.from.y);
        ctx.lineTo(c.to.x, c.to.y);
        ctx.strokeStyle = 'rgba(37, 99, 235, 0.35)';
        ctx.lineWidth = 1.4;
        ctx.setLineDash([4, 6]);
        c.dashOffset = (c.dashOffset - 0.45) % 10;
        ctx.lineDashOffset = c.dashOffset;
        ctx.stroke();
        ctx.setLineDash([]);
      });
    }

    function drawHubs() {
      hubs.forEach(h => {
        // 1. Radar pulse ring
        h.pingRadius += 0.3;
        h.pingAlpha = Math.max(0, 1 - h.pingRadius / 24);
        if (h.pingRadius > 24) {
          h.pingRadius = 3;
          h.pingAlpha = 0.8;
        }

        ctx.beginPath();
        ctx.arc(h.x, h.y, h.pingRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#0D9488';
        ctx.globalAlpha = h.pingAlpha * 0.5;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // 2. Hub core marker dot
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.isMajor ? 4 : 2.8, 0, Math.PI * 2);
        ctx.fillStyle = '#0D9488';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 3. Depot City Label
        if (width > 380) {
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
        p.alpha -= 0.03;

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

      // 1. Draw India geometric boundary and grid
      drawIndiaMap();

      // 2. Draw national highway corridors
      drawCorridors();

      // 3. Draw destination freight hubs
      drawHubs();

      // 4. Draw depot arrival telemetry pings
      drawTelemetryPings();

      // 5. Update and draw moving trucks
      trucks.forEach(truck => {
        truck.update();
        truck.draw();
      });

      animationFrameId = requestAnimationFrame(render);
    }

    // Window events
    window.addEventListener('resize', resize);

    // Mouse tracking for subtle hover responsiveness
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

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
