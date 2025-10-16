export const animateScroll = (
  element: HTMLElement,
  to: number,
  duration: number = 500 // Longer for visible spring
) => {
  const start = element.scrollLeft;
  const change = to - start;
  const startTime = performance.now();

  // Smooth spring-like easing (based on damped harmonic oscillator)
  const springEase = (t: number) => {
    const damping = 1; // damping ratio: [0–1], lower = more bounce
    const stiffness = 10; // spring stiffness
    return (
      1 -
      Math.exp(-damping * t * stiffness) *
        Math.cos(t * stiffness * Math.sqrt(1 - damping * damping))
    );
  };

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = springEase(progress);

    element.scrollLeft = start + change * easedProgress;

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
};
