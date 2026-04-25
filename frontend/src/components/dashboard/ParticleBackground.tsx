import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  opacity: number;
  pulseSpeed: number;
  pulsePhase: number;
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const particles: Particle[] = [];
    const colors = [
      'rgba(201, 75, 138, ',
      'rgba(179, 157, 219, ',
      'rgba(255, 107, 157, ',
      'rgba(149, 117, 205, ',
    ];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3.5 + 1,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.5 + 0.1,
      pulseSpeed: 0.5 + Math.random() * 1.5,
      pulsePhase: Math.random() * Math.PI * 2,
    });

    const init = () => {
      resize();
      const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 12000));
      for (let i = 0; i < count; i++) {
        particles.push(createParticle());
      }
    };

    const drawAurora = (time: number) => {
      // Aurora gradient sweep
      const auroras = [
        {
          x: canvas.width * 0.25 + Math.sin(time * 0.2) * 150,
          y: canvas.height * 0.25 + Math.cos(time * 0.3) * 100,
          radius: 300,
          color1: 'rgba(201, 75, 138, 0.04)',
          color2: 'transparent',
        },
        {
          x: canvas.width * 0.75 + Math.cos(time * 0.15) * 180,
          y: canvas.height * 0.55 + Math.sin(time * 0.25) * 120,
          radius: 350,
          color1: 'rgba(179, 157, 219, 0.035)',
          color2: 'transparent',
        },
        {
          x: canvas.width * 0.5 + Math.sin(time * 0.18) * 100,
          y: canvas.height * 0.8 + Math.cos(time * 0.22) * 80,
          radius: 280,
          color1: 'rgba(255, 107, 157, 0.03)',
          color2: 'transparent',
        },
        {
          x: canvas.width * 0.15 + Math.cos(time * 0.12) * 60,
          y: canvas.height * 0.65 + Math.sin(time * 0.28) * 90,
          radius: 220,
          color1: 'rgba(149, 117, 205, 0.025)',
          color2: 'transparent',
        },
      ];

      auroras.forEach((a) => {
        const gradient = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, a.radius);
        gradient.addColorStop(0, a.color1);
        gradient.addColorStop(1, a.color2);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });
    };

    const animate = () => {
      const time = Date.now() * 0.001;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawAurora(time);

      // Draw particles with bloom glow
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

        // Pulsing opacity
        const pulse = Math.sin(time * p.pulseSpeed + p.pulsePhase) * 0.15 + 0.85;
        const currentOpacity = p.opacity * pulse;

        // Bloom glow
        const glowGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        glowGradient.addColorStop(0, p.color + (currentOpacity * 0.6) + ')');
        glowGradient.addColorStop(1, p.color + '0)');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(p.x - p.size * 3, p.y - p.size * 3, p.size * 6, p.size * 6);

        // Core particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + currentOpacity + ')';
        ctx.fill();
      });

      // Draw connections with gradient
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const opacity = 0.06 * (1 - dist / 140);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(179, 157, 219, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    init();
    animate();

    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}

export default ParticleBackground;
