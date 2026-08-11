import gsap from 'gsap'

export function useAnimations() {
  // Card entrance animation
  const animateCardIn = (element: Element | null, delay: number = 0) => {
    if (!element) return

    gsap.fromTo(
      element,
      {
        opacity: 0,
        y: 20,
        scale: 0.95
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        delay,
        ease: 'power2.out'
      }
    )
  }

  // Button hover scale
  const animateButtonHover = (element: Element) => {
    gsap.to(element, {
      scale: 1.05,
      duration: 0.3,
      ease: 'power2.out'
    })
  }

  const animateButtonHoverOut = (element: Element) => {
    gsap.to(element, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out'
    })
  }

  // Staggered list animation
  const animateListItems = (elements: NodeListOf<Element> | Element[], stagger: number = 0.1) => {
    gsap.fromTo(
      elements,
      {
        opacity: 0,
        x: -20
      },
      {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger,
        ease: 'power2.out'
      }
    )
  }

  // Pulse animation
  const animatePulse = (element: Element) => {
    gsap.to(element, {
      boxShadow: '0 0 30px rgba(124, 58, 237, 0.8)',
      duration: 0.6,
      repeat: 3,
      yoyo: true,
      ease: 'sine.inOut'
    })
  }

  // Bounce in
  const animateBounceIn = (element: Element) => {
    gsap.fromTo(
      element,
      {
        opacity: 0,
        scale: 0.8
      },
      {
        opacity: 1,
        scale: 1,
        duration: 0.7,
        ease: 'back.out'
      }
    )
  }

  // Slide in from left
  const animateSlideInLeft = (element: Element, duration: number = 0.6) => {
    gsap.fromTo(
      element,
      {
        opacity: 0,
        x: -100
      },
      {
        opacity: 1,
        x: 0,
        duration,
        ease: 'power3.out'
      }
    )
  }

  // Fade out and slide out
  const animateSlideOutRight = (element: Element, duration: number = 0.4) => {
    return gsap.to(element, {
      opacity: 0,
      x: 100,
      duration,
      ease: 'power2.in'
    })
  }

  // Rotate in
  const animateRotateIn = (element: Element) => {
    gsap.fromTo(
      element,
      {
        opacity: 0,
        rotation: -180,
        scale: 0.8
      },
      {
        opacity: 1,
        rotation: 0,
        scale: 1,
        duration: 0.8,
        ease: 'back.out'
      }
    )
  }

  // Glow pulse
  const animateGlowPulse = (element: Element) => {
    gsap.to(element, {
      keyframes: {
        '0%': { boxShadow: '0 0 10px rgba(124, 58, 237, 0.3)' },
        '50%': { boxShadow: '0 0 30px rgba(124, 58, 237, 0.8)' },
        '100%': { boxShadow: '0 0 10px rgba(124, 58, 237, 0.3)' }
      },
      duration: 2,
      repeat: -1,
      ease: 'sine.inOut'
    })
  }

  return {
    animateCardIn,
    animateButtonHover,
    animateButtonHoverOut,
    animateListItems,
    animatePulse,
    animateBounceIn,
    animateSlideInLeft,
    animateSlideOutRight,
    animateRotateIn,
    animateGlowPulse
  }
}
