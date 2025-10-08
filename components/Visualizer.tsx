import React, { useRef, useEffect } from 'react';
import { BiofeedbackState } from '../types';
import { STATE_PROPERTIES } from '../constants';

interface VisualizerProps {
  state: BiofeedbackState;
  heartRate: number;
  isPlaying: boolean;
  isGroundingActive: boolean;
}

// Particle type definition
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
}

// Configuration for state-specific visual properties
const VISUAL_CONFIG = {
  [BiofeedbackState.STRESSED]: {
    particleCount: 150,
    particleSpeed: 2,
    baseColor: [255, 69, 0], // OrangeRed
  },
  [BiofeedbackState.CALM]: {
    particleCount: 50,
    particleSpeed: 0.5,
    baseColor: [30, 144, 255], // DodgerBlue
  },
  [BiofeedbackState.INTUITIVE]: {
    particleCount: 100,
    particleSpeed: 1,
    baseColor: [0, 255, 127], // SpringGreen
  },
};


const Visualizer: React.FC<VisualizerProps> = ({ state, heartRate, isPlaying, isGroundingActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>(0);
  const time = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const createParticle = (centerX: number, centerY: number) => {
        const config = VISUAL_CONFIG[state];
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * config.particleSpeed + 0.1;
        
        let vx = Math.cos(angle) * speed;
        let vy = Math.sin(angle) * speed;

        if (state === BiofeedbackState.INTUITIVE) {
          const spiralAngle = 0.2;
          vx = vx * Math.cos(spiralAngle) - vy * Math.sin(spiralAngle);
          vy = vx * Math.sin(spiralAngle) + vy * Math.cos(spiralAngle);
        }

        const maxLife = Math.random() * 60 + 120;
        
        return {
            x: centerX,
            y: centerY,
            vx,
            vy,
            radius: Math.random() * 2 + 1,
            alpha: 1,
            life: maxLife,
            maxLife: maxLife,
        };
    };

    const draw = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(10, 10, 35, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grounding aura if active
      if (isGroundingActive) {
        const groundingColor = 'rgba(210, 105, 30, 0.4)'; // Chocolate, with alpha
        ctx.strokeStyle = groundingColor;
        ctx.lineWidth = 4;
        ctx.shadowBlur = 20;
        ctx.shadowColor = groundingColor;

        const maxRadius = Math.min(centerX, centerY) * 0.95;
        const groundingRadius = maxRadius - 20 + Math.sin(time.current * 0.02) * 10;

        ctx.beginPath();
        ctx.arc(centerX, centerY, groundingRadius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset shadow
      }
      
      const config = VISUAL_CONFIG[state];
      if (particlesRef.current.length < config.particleCount) {
          particlesRef.current.push(createParticle(centerX, centerY));
      }
      
      ctx.globalCompositeOperation = 'lighter';
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx * (heartRate / 70);
        p.y += p.vy * (heartRate / 70);
        p.life--;
        p.alpha = p.life / p.maxLife;

        if (p.life <= 0) {
            particlesRef.current.splice(i, 1);
        } else {
            ctx.beginPath();
            const [r, g, b] = config.baseColor;
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha})`;
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        }
      }

      ctx.globalCompositeOperation = 'source-over';
      const color = STATE_PROPERTIES[state].color;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 15;
      ctx.shadowColor = color;
      const numCircles = 6;
      
      const radius1 = 60 + Math.sin(time.current * 0.1) * (heartRate / 5);
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius1, 0, 2 * Math.PI);
      ctx.stroke();
      for (let i = 0; i < numCircles; i++) {
        const angle = (i * 2 * Math.PI) / numCircles;
        const x = centerX + Math.cos(angle) * radius1;
        const y = centerY + Math.sin(angle) * radius1;
        ctx.beginPath();
        ctx.arc(x, y, radius1, 0, 2 * Math.PI);
        ctx.stroke();
      }

      const radius2 = 60 + Math.cos(time.current * 0.1) * (heartRate / 5);
      ctx.strokeStyle = `rgba(${config.baseColor.join(',')}, 0.8)`;
      ctx.globalAlpha = 0.8;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius2, 0, 2 * Math.PI);
      ctx.stroke();
      for (let i = 0; i < numCircles; i++) {
        const angle = (i * 2 * Math.PI) / numCircles + time.current * 0.005;
        const x = centerX + Math.cos(angle) * radius2;
        const y = centerY + Math.sin(angle) * radius2;
        ctx.beginPath();
        ctx.arc(x, y, radius2, 0, 2 * Math.PI);
        ctx.stroke();
      }
      
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;

      time.current++;
      animationFrameId.current = requestAnimationFrame(draw);
    };

    if (isPlaying) {
      draw();
    } else {
       ctx.clearRect(0, 0, canvas.width, canvas.height);
       particlesRef.current = [];
    }

    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [isPlaying, state, heartRate, isGroundingActive]);

  return <canvas ref={canvasRef} width="600" height="600" className="border-2 border-gray-700 rounded-full shadow-2xl" />;
};

export default Visualizer;