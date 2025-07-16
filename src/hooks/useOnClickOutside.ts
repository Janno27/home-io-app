import { useEffect, RefObject } from 'react';

type AnyEvent = MouseEvent | TouchEvent;

export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: AnyEvent) => void,
): void {
  useEffect(() => {
    const listener = (event: AnyEvent) => {
      const el = ref?.current;
      const target = event.target as Node;
      
      // Ne rien faire si l'on clique sur l'élément de la ref ou ses descendants
      if (!el || el.contains(target)) {
        return;
      }
      
      // Ne rien faire si on clique sur un popover (qui a un z-index élevé)
      const clickedElement = target as HTMLElement;
      if (clickedElement.closest('[data-radix-popper-content-wrapper]') || 
          clickedElement.closest('[role="dialog"]') ||
          clickedElement.closest('.popover-content')) {
        return;
      }
      
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
} 