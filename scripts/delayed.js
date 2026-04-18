// Scroll-triggered fade-in for below-the-fold content
(function initScrollReveal() {
  const sections = document.querySelectorAll('main > .section');
  // Skip the first section (hero — already visible above the fold)
  const belowFold = [...sections].slice(1);

  belowFold.forEach((section) => {
    section.classList.add('reveal');
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px',
  });

  belowFold.forEach((section) => observer.observe(section));
}());
