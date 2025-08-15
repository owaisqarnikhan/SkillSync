import { useState, useEffect } from 'react';

export function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updatePosition = () => {
      const position = window.pageYOffset;
      setScrollPosition(position);
      setIsScrolled(position > 20); // Consider scrolled after 20px
    };

    window.addEventListener('scroll', updatePosition, { passive: true });
    updatePosition(); // Initial call

    return () => window.removeEventListener('scroll', updatePosition);
  }, []);

  return { scrollPosition, isScrolled };
}