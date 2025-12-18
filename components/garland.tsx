"use client"

import React, { useEffect, useRef } from 'react';

// Helper to parse hex color
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};


const Garland: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 50;
    let animationFrameId: number;

    const bulbs: Bulb[] = [];
    const colors = ['#00ff00', '#0000ff', '#ff0000'];
    const bulbCount = 40; // Number of bulbs

    class Bulb {
      x: number;
      y: number;
      size: number;
      color: string;
      rgbColor: { r: number; g: number; b: number; };

      // For twinkling effect
      alpha: number;
      twinkleSpeed: number;
      twinkleOffset: number;


      constructor(x: number, y: number, size: number, color: string) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.rgbColor = hexToRgb(color) || { r: 255, g: 255, b: 255 };

        // Random values for a natural twinkling effect
        this.alpha = Math.random();
        this.twinkleSpeed = 0.001 + Math.random() * 0.002;
        this.twinkleOffset = Math.random() * 1000;
      }

      update(time: number) {
        // Use a sine wave for a smooth twinkling effect
        this.alpha = (Math.sin((time + this.twinkleOffset) * this.twinkleSpeed) + 1) / 2; // a value between 0 and 1
      }

      draw() {
        if (!ctx) return;
        const glowRadius = this.size * 3;
        const baseAlpha = 0.7; // Minimum brightness
        const currentAlpha = baseAlpha + (1 - baseAlpha) * this.alpha;

        // 1. Draw the glow
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
          this.x,
          this.y,
          this.size / 2,
          this.x,
          this.y,
          glowRadius
        );
        const { r, g, b } = this.rgbColor;
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${currentAlpha * 0.5})`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${currentAlpha * 0.2})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(
          this.x - glowRadius,
          this.y - glowRadius,
          glowRadius * 2,
          glowRadius * 2
        );

        // 2. Draw the bulb center
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha * 0.8})`; // Bright white center
        ctx.fill();

        // 3. Draw the colored bulb glass
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${currentAlpha})`;
        ctx.fill();
      }
    }

    const init = () => {
      bulbs.length = 0;
      const sag = height * 0.6; // How much the garland sags
      const startY = height * 0.2;

      // Draw the wire first
      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(0, startY);
      // Use a quadratic curve for the sag
      ctx.quadraticCurveTo(width / 2, startY + sag, width, startY);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();


      for (let i = 0; i < bulbCount; i++) {
        const fraction = (i + 1) / (bulbCount + 1);
        const x = fraction * width;

        // Calculate y position on the quadratic curve
        // Formula for quadratic curve: y = (1-t)^2*p0 + 2*(1-t)*t*p1 + t^2*p2
        const t = fraction;
        const p0 = { x: 0, y: startY };
        const p1 = { x: width / 2, y: startY + sag };
        const p2 = { x: width, y: startY };

        const y = Math.pow(1-t, 2) * p0.y + 2 * (1-t) * t * p1.y + Math.pow(t, 2) * p2.y;

        const size = Math.random() * 2 + 2.5;
        const color = colors[i % colors.length]; // Cycle through colors
        bulbs.push(new Bulb(x, y, size, color));
      }
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = 50;
      init();
    };

    const animate = (time: number) => {
      if (!ctx) return;

      // Clear previous frame
      ctx.clearRect(0, 0, width, height);

      // --- Redraw wire ---
      const sag = height * 0.6;
      const startY = height * 0.2;
      ctx.beginPath();
      ctx.moveTo(0, startY);
      ctx.quadraticCurveTo(width / 2, startY + sag, width, startY);
      ctx.strokeStyle = 'rgba(50, 50, 50, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // --- Update and draw bulbs ---
      for (const bulb of bulbs) {
        bulb.update(time);
        bulb.draw();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial setup

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '50px' }} />;
};

export default Garland;
