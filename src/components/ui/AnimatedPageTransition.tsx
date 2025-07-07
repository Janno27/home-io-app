import { ReactNode } from 'react';
import type { Page } from '@/hooks/useNavigation';

interface AnimatedPageTransitionProps {
  children: ReactNode;
  currentPage: Page;
}

export function AnimatedPageTransition({ children, currentPage }: AnimatedPageTransitionProps) {
  return (
    <div 
      key={currentPage} 
      className={`flex-1 transition-all duration-300 ease-out ${
        currentPage === 'accounting-table' 
          ? 'animate-in fade-in-0 zoom-in-95 duration-300' 
          : 'animate-zoom-in'
      }`}
    >
      {children}
    </div>
  );
}