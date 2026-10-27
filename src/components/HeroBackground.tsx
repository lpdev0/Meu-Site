import { useEffect, useRef } from 'react'
import { Mesh, Program, Renderer, Triangle } from 'ogl'
import { useMotionPreference } from '../hooks/useMotionPreference'

const vertex = /* glsl */ `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

const fragment = /* glsl */ `
  precision highp float;
  uniform float uPhase;
  uniform float uAspect;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float value = 0.0;
    float weight = 0.5;
    for (int i = 0; i < 4; i++) {
      value += noise(p) * weight;
      p = p * 2.03 + 9.2;
      weight *= 0.5;
    }
    return value;
  }
  void main() {
    vec2 uv = vUv;
    vec2 orbit = vec2(cos(uPhase), sin(uPhase));
    vec2 field = vec2(uv.x * min(uAspect, 2.0), uv.y);
    float cloud = fbm(field * 3.0 + orbit * 0.65);
    float center = 0.55 + 0.14 * sin(uv.x * 5.0 + uPhase)
      + 0.12 * (fbm(field * 2.5 + orbit) - 0.5);
    float ribbon = exp(-pow((uv.y - center) * 6.0, 2.0));
    float edge = exp(-abs(uv.y - center - 0.04) * 24.0);
    vec3 violet = vec3(0.34, 0.08, 0.58);
    vec3 rose = vec3(0.50, 0.07, 0.36);
    vec3 blue = vec3(0.09, 0.16, 0.45);
    vec3 tint = mix(violet, rose, smoothstep(0.2, 0.9, uv.x));
    tint = mix(tint, blue, smoothstep(0.5, 1.0, cloud) * 0.6);
    float glow = ribbon * (0.22 + cloud * 0.7) + edge * cloud * 0.24;
    float fade = smoothstep(0.0, 0.18, uv.y) * (1.0 - smoothstep(0.8, 1.0, uv.y));
    vec3 color = vec3(0.047) + tint * glow * fade;
    gl_FragColor = vec4(color, 1.0);
  }
`

/** Decorative OGL layer. Only the hero owns the canvas and its animation loop. */
export function HeroBackground() {
  const container = useRef<HTMLDivElement>(null)
  const reduced = useMotionPreference()

  useEffect(() => {
    const host = container.current
    if (!host) return
    host.dataset.motion = 'fallback'
    let renderer: Renderer
    try {
      renderer = new Renderer({
        alpha: false, antialias: false, depth: false, stencil: false,
        dpr: Math.min(window.devicePixelRatio || 1, 1.5),
        powerPreference: 'low-power',
      })
    } catch {
      return // The CSS gradient remains visible when WebGL is unavailable.
    }
    const gl = renderer.gl
    const canvas = gl.canvas as HTMLCanvasElement
    const geometry = new Triangle(gl)
    const program = new Program(gl, {
      vertex, fragment, depthTest: false, depthWrite: false,
      uniforms: { uPhase: { value: 0 }, uAspect: { value: 1 } },
    })
    const mesh = new Mesh(gl, { geometry, program })
    canvas.setAttribute('aria-hidden', 'true')
    host.appendChild(canvas)

    // Optional deterministic frame for visual review, in seconds.
    const parameter = new URLSearchParams(window.location.search).get('heroTime')
    const frozen = parameter !== null && Number.isFinite(Number(parameter)) && Number(parameter) >= 0
    let elapsed = frozen ? Number(parameter) : 0
    let frame = 0
    let previousTime = 0
    let visible = host.getBoundingClientRect().bottom > 0
    let contextLost = false
    const render = () => {
      program.uniforms.uPhase.value = (elapsed % 28) / 28 * Math.PI * 2
      renderer.render({ scene: mesh })
    }
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      if (!previousTime) previousTime = now
      const delta = now - previousTime
      if (delta < 1000 / 30) return
      elapsed += Math.min(delta, 100) / 1000
      previousTime = now
      render()
    }
    const syncPlayback = () => {
      cancelAnimationFrame(frame)
      frame = 0
      previousTime = 0
      const running = visible && !document.hidden && !reduced && !frozen && !contextLost
      host.dataset.motion = contextLost ? 'fallback' : reduced || frozen ? 'static' : running ? 'running' : 'paused'
      if (running) frame = requestAnimationFrame(tick)
    }
    const resize = () => {
      if (contextLost) return
      const { width, height } = host.getBoundingClientRect()
      renderer.setSize(Math.max(1, width), Math.max(1, height))
      program.uniforms.uAspect.value = width / Math.max(1, height)
      render()
    }
    const onContextLost = (event: Event) => {
      event.preventDefault()
      contextLost = true
      canvas.style.visibility = 'hidden'
      syncPlayback()
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      syncPlayback()
    })
    const resizeObserver = new ResizeObserver(resize)
    observer.observe(host)
    resizeObserver.observe(host)
    document.addEventListener('visibilitychange', syncPlayback)
    canvas.addEventListener('webglcontextlost', onContextLost)
    resize()
    syncPlayback()

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', syncPlayback)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      geometry.remove()
      program.remove()
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      canvas.remove()
    }
  }, [reduced])

  return <div ref={container} className="hero-background" aria-hidden="true" />
}
