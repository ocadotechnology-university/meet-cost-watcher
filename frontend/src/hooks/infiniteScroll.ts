import { useEffect, RefObject } from 'react';

export const useContainerScroll = (
    containerRef: RefObject<HTMLElement>,
    callback: () => void,
    isLoading: boolean
) => {
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            if (isLoading) return;

            const scrollPercentage =
                (container.scrollTop + container.clientHeight) / container.scrollHeight;

            if (scrollPercentage > 0.85) {
                callback();
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, [containerRef, callback, isLoading]);
};