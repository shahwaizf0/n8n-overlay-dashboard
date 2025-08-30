import React, { useEffect, useRef } from "react";

// Simple glowy star background using canvas
export default function StarBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // Generate random stars
    const starCount = Math.floor((canvas.width * canvas.height) / 3000);
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.3,
      a: Math.random() * 0.5 + 0.5,
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const star of stars) {
        ctx.save();
        ctx.globalAlpha = star.a;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, 2 * Math.PI);
        ctx.fillStyle = "#fff";
        ctx.shadowColor = "#fff";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      }
    }
    draw();

    return () => {
      window.removeEventListener("resize", resize);
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
