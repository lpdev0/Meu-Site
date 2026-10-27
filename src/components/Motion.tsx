import { useEffect, useRef, type ReactNode } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { useMotionPreference } from '../hooks/useMotionPreference'

const elements = {
  div: motion.create('div'), section: motion.create('section'),
  nav: motion.create('nav'), h1: motion.create('h1'), h2: motion.create('h2'),
}

export function FadeIn({ children, delay = 0, duration = 0.7, x = 0, y = 30, className = '', as = 'div' }: {
  children: ReactNode; delay?: number; duration?: number; x?: number; y?: number; className?: string; as?: keyof typeof elements
}) {
  const reduced = useMotionPreference()
  const Component = elements[as]
  return <Component className={className} initial={reduced ? false : { opacity: 0, x, y }}
    animate={reduced ? { opacity: 1, x: 0, y: 0 } : undefined}
    whileInView={{ opacity: 1, x: 0, y: 0 }} viewport={{ once: true, margin: '50px', amount: 0 }}
    transition={{ duration: reduced ? 0 : duration, delay: reduced ? 0 : delay, ease: [0.25, 0.1, 0.25, 1] }}>{children}</Component>
}

export function Magnet({ children, padding = 150, strength = 3, activeTransition = 'transform 0.3s ease-out', inactiveTransition = 'transform 0.6s ease-in-out' }: {
  children: ReactNode; padding?: number; strength?: number; activeTransition?: string; inactiveTransition?: string
}) {
  const anchor = useRef<HTMLDivElement>(null)
  const moving = useRef<HTMLDivElement>(null)
  const reduced = useMotionPreference()
  useEffect(() => {
    const element = moving.current
    if (!element) return
    // Clear any previous pointer offset when the preference or input changes.
    element.style.transition = 'none'
    element.style.transform = 'translate3d(0,0,0)'
    if (reduced || !window.matchMedia('(pointer: fine)').matches) return
    let frame = 0
    const reset = () => {
      cancelAnimationFrame(frame)
      if (!moving.current) return
      moving.current.style.transition = inactiveTransition
      moving.current.style.transform = 'translate3d(0,0,0)'
    }
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (!anchor.current || !moving.current) return
        const bounds = anchor.current.getBoundingClientRect()
        const x = event.clientX - bounds.left - bounds.width / 2
        const y = event.clientY - bounds.top - bounds.height / 2
        if (Math.abs(x) < bounds.width / 2 + padding && Math.abs(y) < bounds.height / 2 + padding) {
          moving.current.style.transition = activeTransition
          moving.current.style.transform = `translate3d(${x / Math.max(1, strength)}px,${y / Math.max(1, strength)}px,0)`
        } else reset()
      })
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('blur', reset)
    window.addEventListener('scroll', reset, { passive: true })
    document.documentElement.addEventListener('pointerleave', reset)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('blur', reset)
      window.removeEventListener('scroll', reset)
      document.documentElement.removeEventListener('pointerleave', reset)
      cancelAnimationFrame(frame)
      element.style.transform = 'translate3d(0,0,0)'
    }
  }, [reduced, padding, strength, activeTransition, inactiveTransition])
  return <div ref={anchor}><div ref={moving} style={{ willChange: 'transform' }}>{children}</div></div>
}

function Character({ children, progress, start, end }: { children: string; progress: MotionValue<number>; start: number; end: number }) {
  const opacity = useTransform(progress, [start, end], [0.2, 1])
  return <span className="relative"><span className="invisible">{children}</span><motion.span className="absolute inset-0" style={{ opacity }}>{children}</motion.span></span>
}

export function AnimatedText({ text }: { text: string }) {
  const paragraph = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: paragraph, offset: ['start 0.8', 'end 0.2'] })
  const reduced = useMotionPreference()
  let position = 0
  return <p ref={paragraph} className="max-w-[560px] text-center text-[clamp(1rem,2vw,1.35rem)] font-medium leading-relaxed text-silver">
    <span className="sr-only">{text}</span>
    <span aria-hidden="true">{reduced ? text : text.split(' ').map((word, wordIndex) => {
      const start = position
      position += word.length + 1
      return <span key={wordIndex}><span className="inline-block whitespace-nowrap">{Array.from(word).map((char, i) => <Character key={i} progress={scrollYProgress} start={(start + i) / text.length} end={(start + i + 1) / text.length}>{char}</Character>)}</span>{' '}</span>
    })}</span>
  </p>
}
