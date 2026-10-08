/**
 * FLEETEZEE — Hero Digital Transportation Ecosystem Canvas
 * High-performance, ambient route network with active telematics telemetry pulses.
 * Optimized for crisp, luminous, modern light-mode backgrounds.
 * Pauses automatically when offscreen to preserve battery and memory.
 */

(function () {
  'use strict';

  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId = null;
  let isVisible = true;
  let width = 0;
  let height = 0;

  // Mouse interaction coordinates
  const mouse = {
    x: null,
    y: null,
    radius: 130
  };

  // Node & Corridor configuration
  const nodes = [];
  const pulses = [];
  const isMobile = window.innerWidth < 768;
  const nodeCount = isMobile ? 22 : 44;
  const connectionDistance = isMobile ? 120 : 175;

  function resize() {
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  }

  window.addEventListener('resize', () => {
    resize();
    initNodes();
  });

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    if (e.clientY <= rect.bottom) {
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    } else {
      mouse.x = null;
      mouse.y = null;
    }
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class TransportNode {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      this.radius = Math.random() > 0.85 ? 3.2 : 2.0;
      this.isHub = this.radius > 2.8;
      this.baseAlpha = this.isHub ? 0.85 : 0.45;
      this.color = this.isHub ? '#0D9488' : '#64748B';
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Gentle interactive gravity towards mouse
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x += (dx / dist) * force * 0.8;
          this.y += (dy / dist) * force * 0.8;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.baseAlpha;
      ctx.fill();

      if (this.isHub) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2.5, 0, Math.PI * 2);
        ctx.strokeStyle = '#2563EB';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.35;
        ctx.stroke();
      }
    }
  }

  class TelematicsPulse {
    constructor(nodeA, nodeB) {
      this.nodeA = nodeA;
      this.nodeB = nodeB;
      this.progress = 0;
      this.speed = 0.008 + Math.random() * 0.012;
      this.color = Math.random() > 0.5 ? '#0D9488' : '#2563EB';
    }

    update() {
      this.progress += this.speed;
      return this.progress <= 1;
    }

    draw() {
      const curX = this.nodeA.x + (this.nodeB.x - this.nodeA.x) * this.progress;
      const curY = this.nodeA.y + (this.nodeB.y - this.nodeA.y) * this.progress;

      ctx.beginPath();
      ctx.arc(curX, curY, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = 0.9;
      ctx.fill();

      // Pulse trail
      ctx.beginPath();
      ctx.arc(curX, curY, 6, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = 0.25;
      ctx.fill();
    }
  }

  function initNodes() {
    nodes.length = 0;
    for (let i = 0; i < nodeCount; i++) {
      nodes.push(new TransportNode());
    }
  }

  function spawnPulses() {
    if (pulses.length < (isMobile ? 4 : 8) && Math.random() < 0.05) {
      const a = nodes[Math.floor(Math.random() * nodes.length)];
      for (let j = 0; j < nodes.length; j++) {
        const b = nodes[j];
        if (a !== b) {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDistance) {
            pulses.push(new TelematicsPulse(a, b));
            break;
          }
        }
      }
    }
  }

  function render() {
    if (!isVisible) return;

    ctx.clearRect(0, 0, width, height);

    // Update and draw transport corridors
    for (let i = 0; i < nodes.length; i++) {
      const nodeA = nodes[i];
      nodeA.update();
      nodeA.draw();

      for (let j = i + 1; j < nodes.length; j++) {
        const nodeB = nodes[j];
        const dx = nodeA.x - nodeB.x;
        const dy = nodeA.y - nodeB.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connectionDistance) {
          const alpha = (1 - dist / connectionDistance) * 0.22;
          ctx.beginPath();
          ctx.moveTo(nodeA.x, nodeA.y);
          ctx.lineTo(nodeB.x, nodeB.y);
          ctx.strokeStyle = '#0D9488';
          ctx.lineWidth = 1;
          ctx.globalAlpha = alpha;
          ctx.stroke();
        }
      }
    }

    // Update and draw pulses
    spawnPulses();
    for (let i = pulses.length - 1; i >= 0; i--) {
      const pulse = pulses[i];
      if (pulse.update()) {
        pulse.draw();
      } else {
        pulses.splice(i, 1);
      }
    }

    ctx.globalAlpha = 1.0;
    animationFrameId = requestAnimationFrame(render);
  }

  // IntersectionObserver to pause rendering when hero is offscreen
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animationFrameId) {
          animationFrameId = requestAnimationFrame(render);
        } else if (!isVisible && animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      });
    }, { threshold: 0.05 });

    observer.observe(canvas.parentElement);
  }

  resize();
  initNodes();
  animationFrameId = requestAnimationFrame(render);
})();
