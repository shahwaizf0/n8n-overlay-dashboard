import React, { useEffect, useRef } from "react";

// Animated glow background for the main card
export default function CardGlowBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    let animationFrameId: number;
    function drawGlow(time: number) {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Center of card (approximate)
      const cardX = canvas.width / 2;
      const cardY = canvas.height / 2;
      // Animate glow position and color
      const t = time * 0.0005;
      const dx = Math.sin(t) * 60;
      const dy = Math.cos(t) * 40;
      const glowX = cardX + dx;
      const glowY = cardY + dy;
      const glowRadius = Math.max(canvas.width, canvas.height) / 3.2;
      // Gradient color
      const grad = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, glowRadius);
      grad.addColorStop(0, "rgba(80,180,255,0.18)");
      grad.addColorStop(0.4, "rgba(80,180,255,0.10)");
      grad.addColorStop(1, "rgba(80,180,255,0)");
      ctx.globalAlpha = 1;
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      animationFrameId = requestAnimationFrame(drawGlow);
    }
    animationFrameId = requestAnimationFrame(drawGlow);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh" }}
      aria-hidden="true"
    />
  );
}
