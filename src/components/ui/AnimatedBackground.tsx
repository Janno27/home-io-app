import { useEffect, useRef } from 'react';

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const drawDots = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const dotSize = 1;
      const spacing = 20;
      const maxDistance = 150;
      
      for (let x = 0; x < canvas.width; x += spacing) {
        for (let y = 0; y < canvas.height; y += spacing) {
          const distance = Math.sqrt(
            Math.pow(x - mouseRef.current.x, 2) + 
            Math.pow(y - mouseRef.current.y, 2)
          );
          
          let opacity = 0.9;
          let size = dotSize;
          
          if (distance < maxDistance) {
            const factor = 1 - (distance / maxDistance);
            opacity = 0.3 + (factor * 0.7);
            size = dotSize + (factor * 2);
          }
          
          ctx.fillStyle = `rgba(209, 213, 219, ${opacity})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      animationRef.current = requestAnimationFrame(drawDots);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    
    drawDots();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}
    />
  );
}