import { useEffect, RefObject } from 'react';

export const useContainerScrollObserver = (
  containerRef: RefObject<HTMLElement>,
  onScroll: () => void,
  isLoading: boolean
) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const handleScroll = () => {
      if (isLoading) {
        return;
      }

      const scrollPercentage =
        (container.scrollTop + container.clientHeight) / container.scrollHeight;

      if (scrollPercentage > 0.85) {
        onScroll();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef, onScroll, isLoading]);
};