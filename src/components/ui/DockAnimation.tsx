import { useEffect, useState } from 'react';

interface DockAnimationProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
  originPoint?: { x: number; y: number };
}

export const DockAnimation: React.FC<DockAnimationProps> = ({
  isOpen,
  children,
  className = "",
  originPoint,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
    } else if (isVisible) {
      // Déclencher l'animation de fermeture
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
      }, 400); // Durée de l'animation dock-out
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, isVisible]);

  if (!isVisible) return null;

  const hasOriginPoint = originPoint && originPoint.x !== undefined && originPoint.y !== undefined;
  const animationClass = hasOriginPoint 
    ? (isClosing ? 'dock-out-to-icon' : 'dock-in-from-icon')
    : (isClosing ? 'dock-out' : 'dock-in');

  const transformOrigin = hasOriginPoint 
    ? `${originPoint.x}px ${originPoint.y}px`
    : 'center bottom';

  return (
    <div 
      className={`fixed inset-0 z-[9998] ${className}`}
      style={{ pointerEvents: 'none' }}
    >
      <div
        className={`h-full w-full ${animationClass}`}
        style={{ transformOrigin, pointerEvents: 'none' }}
      >
        {children}
      </div>
    </div>
  );
} 