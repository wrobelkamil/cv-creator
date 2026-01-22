import { useEffect } from 'react';

const useAutoFit = (containerRef, data, minFontSize = 8, maxFontSize = 10) => {
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Reset to max font size to start calculation
        let currentFontSize = maxFontSize;
        container.style.fontSize = `${currentFontSize}pt`;

        const checkOverflow = () => {
            // Allow a small tolerance (1px) for rounding errors
            return container.scrollHeight > container.clientHeight + 1;
        };

        // Optimization: Binary search could be better, but linear is fine for this small range
        // Loop while overflowing and font size is above minimum
        while (checkOverflow() && currentFontSize > minFontSize) {
            currentFontSize -= 0.1;
            container.style.fontSize = `${currentFontSize}pt`;
        }

        // If still overflowing at minFontSize, we might need to cut content or warn user
        if (checkOverflow()) {
            console.warn("Content does not fit even at minimum font size.");
            // Optional: Add visual warning
            container.style.border = "2px solid red";
        } else {
            container.style.border = "none";
        }

    }, [data, containerRef, minFontSize, maxFontSize]);
};

export default useAutoFit;
