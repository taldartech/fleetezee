/**
 * FLEETEZEE — Live Fleet Telematics & Freight Corridor Canvas Simulation
 * Visualizes active trucks cruising along national freight corridors between transport hubs.
 * Features:
 *  - Real destination freight depots (Delhi SGTN, Mumbai JNPT, Bangalore Nelamangala, etc.)
 *  - Moving transport trucks with cabins, trailers, glowing headlights, and motion trails
 *  - Dynamic telemetry telemetry tags (LR #TB-94102, FASTag Cleared, In Transit, Speed)
 *  - High-performance, DPI-scaled, auto-pauses offscreen
 */

(function () {
  'use strict';

  // Support both ID and class selectors across all pages
  const canvases = document.querySelectorAll('#heroCanvas, .telematics-bg-canvas');
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

    // Mouse interactive coordinates
    const mouse = { x: null, y: null, radius: 150 };

    // Iconic Indian Freight Hubs (proportional positioning)
    const HUB_DEFINITIONS = [
      { id: 'del', name: 'DELHI (SGTN)', code: 'SGTN-DEL', xRel: 0.22, yRel: 0.22, state: 'NCR Hub' },
      { id: 'jpr', name: 'JAIPUR (VKIA)', code: 'VKIA-JPR', xRel: 0.16, yRel: 0.38, state: 'Transit Depot' },
      { id: 'amd', name: 'AHMEDABAD', code: 'ASLALI-AMD', xRel: 0.14, yRel: 0.60, state: 'Logistics Park' },
      { id: 'bom', name: 'MUMBAI (JNPT)', code: 'JNPT-BOM', xRel: 0.20, yRel: 0.78, state: 'Port Terminal' },
      { id: 'pnq', name: 'PUNE (CHAKAN)', code: 'CHAKAN-PNQ', xRel: 0.30, yRel: 0.85, state: 'Auto Belt' },
      { id: 'blr', name: 'BENGALURU', code: 'NELAMANGALA', xRel: 0.42, yRel: 0.88, state: 'South Freight Hub' },
      { id: 'maa', name: 'CHENNAI', code: 'MADHAVARAM', xRel: 0.58, yRel: 0.84, state: 'Maritime CFS' },
      { id: 'hyd', name: 'HYDERABAD', code: 'AUTONAGAR', xRel: 0.44, yRel: 0.64, state: 'Deccan Junction' },
      { id: 'ngp', name: 'NAGPUR', code: 'KALAMNA-NGP', xRel: 0.40, yRel: 0.46, state: 'Zero-Mile Hub' },
      { id: 'ccu', name: 'KOLKATA', code: 'DANKUNI-CCU', xRel: 0.76, yRel: 0.42, state: 'Eastern Gateway' },
      { id: 'lko', name: 'LUCKNOW/KANPUR', code: 'FAZALGANJ', xRel: 0.48, yRel: 0.28, state: 'Northern Freight' }
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
      ['lko', 'ngp', 'NH-30'],
      ['ngp', 'hyd', 'NH-44'],
      ['hyd', 'blr', 'NH-44'],
      ['ngp', 'ccu', 'NH-53'],
      ['del', 'ngp', 'NH-44'],
      ['bom', 'ngp', 'Samruddhi'],
      ['maa', 'hyd', 'NH-16'],
      ['ccu', 'maa', 'NH-16']
    ];

    const hubs = [];
    const corridors = [];
    const trucks = [];
    const telemetryPings = [];

    function resize() {
      const parent = canvas.parentElement;
      width = parent.offsetWidth;
      height = parent.offsetHeight;
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

      // Adjust distribution based on screen width
      const isMobile = width < 768;
      const xOffset = isMobile ? 0.05 : 0.08;
      const xSpread = isMobile ? 0.90 : 0.84;
      const yOffset = isMobile ? 0.08 : 0.10;
      const ySpread = isMobile ? 0.84 : 0.80;

      HUB_DEFINITIONS.forEach(def => {
        hubs.push({
          id: def.id,
          name: def.name,
          code: def.code,
          state: def.state,
          x: (def.xRel * xSpread + xOffset) * width,
          y: (def.yRel * ySpread + yOffset) * height,
          pingRadius: Math.random() * 20,
          pingAlpha: 0.8,
          isMajor: ['del', 'bom', 'blr', 'ccu'].includes(def.id)
        });
      });

      // Map corridors
      const hubMap = {};
      hubs.forEach(h => { hubMap[h.id] = h; });

      CORRIDOR_CONNECTIONS.forEach(([fromId, toId, code]) => {
        const from = hubMap[fromId];
        const to = hubMap[toId];
        if (from && to) {
          corridors.push({ from, to, code, dashOffset: 0 });
        }
      });

      // Initialize trucks moving between corridors
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
        // Speed: 0.0012 to 0.0028 per frame
        this.speed = (0.0014 + Math.random() * 0.0014);

        // Vehicle Plate & Mission Data
        const states = ['MH', 'GJ', 'DL', 'KA', 'RJ', 'HR', 'WB', 'TN'];
        const state = states[Math.floor(Math.random() * states.length)];
        const num = Math.floor(1000 + Math.random() * 9000);
        this.plate = `${state}-${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}-${num}`;
        
        const payloads = ['FTL 24T', '32 FT MXL', 'CONTAINER', 'REEFER 16T', 'PARCEL EXPRESS', 'STEEL HAUL'];
        this.payload = payloads[Math.floor(Math.random() * payloads.length)];
        
        const statuses = ['IN TRANSIT', 'FASTag OK', 'LR #TB-9' + Math.floor(100 + Math.random() * 900), 'GPS LOCKED', 'POD PENDING'];
        this.status = statuses[Math.floor(Math.random() * statuses.length)];
        this.kmh = Math.floor(52 + Math.random() * 18);

        this.truckLength = 22;
        this.truckWidth = 8.5;
        this.showBadge = Math.random() > 0.35;
        this.trail = [];
      }

      update() {
        this.progress += this.speed;
        if (this.progress >= 1) {
          // Trigger depot arrival telemetry ping
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

        // Record motion trail
        this.trail.unshift({ x: this.x, y: this.y });
        if (this.trail.length > 8) this.trail.pop();
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // 1. Headlights beam projecting forward
        ctx.save();
        const beamGrad = ctx.createRadialGradient(14, 0, 2, 42, 0, 18);
        beamGrad.addColorStop(0, 'rgba(13, 148, 136, 0.45)');
        beamGrad.addColorStop(0.5, 'rgba(37, 99, 235, 0.20)');
        beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(12, -3);
        ctx.lineTo(44, -14);
        ctx.lineTo(44, 14);
        ctx.lineTo(12, 3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 2. Trailer / Container Body
        // Shadow under truck
        ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
        ctx.fillRect(-14, -this.truckWidth / 2 + 1, this.truckLength, this.truckWidth);

        // Container (Slate/Navy with subtle border)
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        roundRect(ctx, -14, -this.truckWidth / 2, 15, this.truckWidth, 2);
        ctx.fill();

        // Brand stripe on cargo container (Emerald Teal)
        ctx.fillStyle = '#0D9488';
        ctx.fillRect(-10, -this.truckWidth / 2 + 1, 8, 1.5);
        ctx.fillRect(-10, this.truckWidth / 2 - 2.5, 8, 1.5);

        // 3. Driver Cabin (Front)
        ctx.fillStyle = '#1E293B';
        ctx.beginPath();
        roundRect(ctx, 1.5, -this.truckWidth / 2 + 0.5, 7.5, this.truckWidth - 1, 2);
        ctx.fill();

        // Windshield glass (Azure glow)
        ctx.fillStyle = '#38BDF8';
        ctx.fillRect(4.5, -this.truckWidth / 2 + 1.5, 2.2, this.truckWidth - 3);

        // Headlight lamps
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(8.5, -this.truckWidth / 2 + 1, 1.2, 1.5);
        ctx.fillRect(8.5, this.truckWidth / 2 - 2.5, 1.2, 1.5);

        // Tail red stop-lights
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(-14, -this.truckWidth / 2 + 1, 1, 1.5);
        ctx.fillRect(-14, this.truckWidth / 2 - 2.5, 1, 1.5);

        ctx.restore();

        // 4. Floating Live Telemetry Badge (Unrotated, legible text)
        if (this.showBadge && width > 640) {
          ctx.save();
          const badgeX = this.x + 14;
          const badgeY = this.y - 14;

          ctx.font = '600 9px "JetBrains Mono", monospace';
          const text = `${this.plate} • ${this.status}`;
          const textWidth = ctx.measureText(text).width;

          // Subtle pill background
          ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
          ctx.strokeStyle = '#E2E8F0';
          ctx.lineWidth = 1;
          ctx.beginPath();
          roundRect(ctx, badgeX - 4, badgeY - 10, textWidth + 14, 15, 4);
          ctx.fill();
          ctx.stroke();

          // Green status indicator dot
          ctx.fillStyle = '#0D9488';
          ctx.beginPath();
          ctx.arc(badgeX + 1, badgeY - 2.5, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Text label
          ctx.fillStyle = '#0F172A';
          ctx.fillText(text, badgeX + 7, badgeY + 1);
          ctx.restore();
        }
      }
    }

    function initTrucks() {
      trucks.length = 0;
      const isMobile = width < 768;
      const count = isMobile ? 6 : 14;
      for (let i = 0; i < count; i++) {
        trucks.push(new MovingTruck(i));
      }
    }

    function drawCorridors() {
      corridors.forEach(c => {
        // Base subtle highway corridor
        ctx.beginPath();
        ctx.moveTo(c.from.x, c.from.y);
        ctx.lineTo(c.to.x, c.to.y);
        ctx.strokeStyle = 'rgba(13, 148, 136, 0.16)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Animated dashed freight telemetry line
        ctx.beginPath();
        ctx.moveTo(c.from.x, c.from.y);
        ctx.lineTo(c.to.x, c.to.y);
        ctx.strokeStyle = 'rgba(37, 99, 235, 0.28)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 8]);
        c.dashOffset = (c.dashOffset - 0.4) % 12;
        ctx.lineDashOffset = c.dashOffset;
        ctx.stroke();
        ctx.setLineDash([]);
      });
    }

    function drawHubs() {
      hubs.forEach(h => {
        // 1. Radar pulse ring
        h.pingRadius += 0.35;
        h.pingAlpha = Math.max(0, 1 - h.pingRadius / 32);
        if (h.pingRadius > 32) {
          h.pingRadius = 4;
          h.pingAlpha = 0.8;
        }

        ctx.beginPath();
        ctx.arc(h.x, h.y, h.pingRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#0D9488';
        ctx.globalAlpha = h.pingAlpha * 0.45;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // 2. Hub core marker
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.isMajor ? 4.5 : 3.2, 0, Math.PI * 2);
        ctx.fillStyle = '#0D9488';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 3. Destination City Label
        if (width > 600) {
          ctx.font = '700 9.5px "JetBrains Mono", monospace';
          ctx.fillStyle = '#0F172A';
          ctx.fillText(h.name, h.x + 8, h.y - 4);

          ctx.font = '500 8px "JetBrains Mono", monospace';
          ctx.fillStyle = '#64748B';
          ctx.fillText(h.state, h.x + 8, h.y + 6);
        }
      });
    }

    function drawTelemetryPings() {
      for (let i = telemetryPings.length - 1; i >= 0; i--) {
        const p = telemetryPings[i];
        p.radius += 0.8;
        p.alpha -= 0.025;

        if (p.alpha <= 0) {
          telemetryPings.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = p.alpha;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    function drawSystemBanner() {
      // Subtle ambient telematics telemetry stream badge in top right (desktop only)
      if (width > 992) {
        ctx.save();
        ctx.font = '600 9px "JetBrains Mono", monospace';
        const text = 'FLEETEZEE TELEMATICS MESH • LIVE CORRIDOR TRACKING';
        ctx.fillStyle = 'rgba(13, 148, 136, 0.75)';
        ctx.fillText(text, width - ctx.measureText(text).width - 32, 38);
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

      // 3. Draw depot arrival pings
      drawTelemetryPings();

      // 4. Update and draw moving trucks
      trucks.forEach(truck => {
        truck.update();
        truck.draw();
      });

      // 5. System banner status
      drawSystemBanner();

      animationFrameId = requestAnimationFrame(render);
    }

    // Window events
    window.addEventListener('resize', resize);

    // Pause when offscreen
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

    // Initial Start
    resize();
    animationFrameId = requestAnimationFrame(render);
  }
})();
