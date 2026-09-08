// GSAP Scroll Animation System for Knowledge Visualization
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

/**
 * Initialize scroll-based animations for knowledge cards
 */
export function initKnowledgeCardAnimations() {
  // Animate knowledge cards as they enter the viewport
  gsap.utils.toArray('.knowledge-card').forEach((card, index) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: true,
        markers: false
      },
      y: 50,
      opacity: 0,
      scale: 0.9,
      duration: 0.8,
      ease: 'power3.out',
      delay: index * 0.1
    });
  });

  // Animate knowledge connection lines
  gsap.utils.toArray('.knowledge-connection').forEach((connection, index) => {
    gsap.fromTo(connection,
      { drawSVG: '0%' },
      {
        drawSVG: '100%',
        scrollTrigger: {
          trigger: connection,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: true
        },
        duration: 1,
        ease: 'none',
        delay: index * 0.05
      }
    );
  });
}

/**
 * Create scroll progress indicator
 */
export function initScrollProgressIndicator() {
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress-bar';
  progressBar.innerHTML = '<div class="scroll-progress-fill"></div>';
  document.body.appendChild(progressBar);

  // Update progress on scroll
  ScrollTrigger.create({
    onUpdate: self => {
      const fill = progressBar.querySelector('.scroll-progress-fill');
      fill.style.width = `${self.progress * 100}%`;
    }
  });
}

/**
 * Smooth scroll to section
 */
export function smoothScrollTo(element) {
  gsap.to(window, {
    scrollTo: {
      y: element,
      offsetY: 70
    },
    duration: 1,
    ease: 'power3.out'
  });
}

/**
 * Initialize all scroll animations
 */
export function initScrollAnimations() {
  initKnowledgeCardAnimations();
  initScrollProgressIndicator();

  // Add smooth scroll behavior to all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          smoothScrollTo(targetElement);
        }
      }
    });
  });
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollAnimations);
} else {
  initScrollAnimations();
}