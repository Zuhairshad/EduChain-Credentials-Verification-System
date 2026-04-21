'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';

export const Component = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const colorState = {
      hue: 30,
      targetHue: 30,
      saturation: 80,
      targetSaturation: 80,
      lightness: 50,
      targetLightness: 50,
    };

    const waves = [
      { amplitude: 30, frequency: 0.003, speed: 0.02, offset: 0, opacity: 0.9 },
      { amplitude: 25, frequency: 0.004, speed: 0.015, offset: Math.PI * 0.5, opacity: 0.7 },
      { amplitude: 20, frequency: 0.005, speed: 0.025, offset: Math.PI, opacity: 0.5 },
      { amplitude: 35, frequency: 0.002, speed: 0.01, offset: Math.PI * 1.5, opacity: 0.6 },
    ];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.92)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const bassIntensity = 0.4 + Math.sin(time * 0.01) * 0.3;
      const midIntensity = 0.3 + Math.sin(time * 0.015) * 0.2;

      colorState.targetHue = 180 + Math.sin(time * 0.005) * 180;
      colorState.targetSaturation = 70 + Math.sin(time * 0.01) * 30;
      colorState.targetLightness = 50 + Math.sin(time * 0.008) * 20;

      colorState.hue += (colorState.targetHue - colorState.hue) * 0.5;
      colorState.saturation += (colorState.targetSaturation - colorState.saturation) * 0.2;
      colorState.lightness += (colorState.targetLightness - colorState.lightness) * 0.1;

      time++;

      const centerY = canvas.height / 2;

      waves.forEach((wave, waveIndex) => {
        wave.offset += wave.speed * (1 + bassIntensity * 0.8);
        const freqInfluence = waveIndex < 2 ? bassIntensity : midIntensity;
        const dynamicAmplitude = wave.amplitude * (1 + freqInfluence * 5);

        const waveHue = colorState.hue + waveIndex * 15;
        const waveSaturation = colorState.saturation - waveIndex * 5;
        const waveLightness = colorState.lightness + waveIndex * 5;

        const gradient = ctx.createLinearGradient(0, centerY - dynamicAmplitude, 0, centerY + dynamicAmplitude);
        const alpha = wave.opacity * (0.5 + bassIntensity * 0.5);

        gradient.addColorStop(0, `hsla(${waveHue}, ${waveSaturation}%, ${waveLightness}%, 0)`);
        gradient.addColorStop(0.5, `hsla(${waveHue}, ${waveSaturation}%, ${waveLightness + 10}%, ${alpha})`);
        gradient.addColorStop(1, `hsla(${waveHue}, ${waveSaturation}%, ${waveLightness}%, 0)`);

        ctx.beginPath();
        for (let x = -50; x <= canvas.width + 50; x += 2) {
          const y1 = Math.sin(x * wave.frequency + wave.offset) * dynamicAmplitude;
          const y2 = Math.sin(x * wave.frequency * 2 + wave.offset * 1.5) * (dynamicAmplitude * 0.3 * midIntensity);
          const y3 = Math.sin(x * wave.frequency * 0.5 + wave.offset * 0.7) * (dynamicAmplitude * 0.5);
          const y = centerY + y1 + y2 + y3;

          if (x === -50) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width + 50, canvas.height);
        ctx.lineTo(-50, canvas.height);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      // Vignette
      const vignette = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.width * 0.2,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.9
      );
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(0.5, 'rgba(0, 0, 0, 0.12)');
      vignette.addColorStop(0.8, 'rgba(0, 0, 0, 0.24)');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Film flicker
      const flicker = Math.sin(time * 0.3) * 0.02 + Math.random() * 0.01;
      ctx.fillStyle = `rgba(255, 255, 255, ${flicker})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    animate();

    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const cleanup = initCanvas();
    return cleanup;
  }, [initCanvas]);

  return (
    <div className="music-reactive-hero">
      <canvas ref={canvasRef} className="visualization-canvas" />

      <nav className="landing-navbar">
        <span className="navbar-title">EduChain</span>
        <Link href="/login" className="navbar-login-btn">Login</Link>
      </nav>

      <div className="hero-content">
        <p className="hero-tagline">EDU Chain Credentials Verification System</p>
        <h1 className="hero-title">
          <span className="title-line">STUDENT</span>
          <span className="title-line">PORTAL</span>
        </h1>
        <p className="hero-subtitle">View, share, and verify your blockchain-powered academic credentials</p>
        <p className="hero-credit">Powered by Polygon Blockchain</p>
      </div>

      <div className="bottom-info">
        <div className="artist-avatar">EDU</div>
        <span className="artist-name">EDU CHAIN</span>
        <span className="social-handle">@EDUCHAIN</span>
      </div>
    </div>
  );
};
