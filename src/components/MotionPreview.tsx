import { useCallback, useEffect, useRef } from 'react'

/** Freeze a decoded GIF frame without downloading a second asset or exporting pixels. */
export function MotionPreview({ src, paused }: { src: string; paused: boolean }) {
  const image = useRef<HTMLImageElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const freeze = useCallback(() => {
    const source = image.current
    const surface = canvas.current
    if (!paused || !source?.complete || !source.naturalWidth || !surface) return
    const context = surface.getContext('2d')
    if (!context) return
    // Cross-origin images can be drawn; no canvas pixels are read or exported.
    const scale = Math.max(420 / source.naturalWidth, 270 / source.naturalHeight)
    const width = source.naturalWidth * scale
    const height = source.naturalHeight * scale
    context.clearRect(0, 0, 420, 270)
    context.drawImage(source, (420 - width) / 2, (270 - height) / 2, width, height)
  }, [paused])
  useEffect(freeze, [freeze, src])
  return <div className="relative h-[270px] w-[420px] shrink-0 overflow-hidden rounded-2xl bg-neutral-900" aria-hidden="true">
    <img ref={image} src={src} alt="" loading="lazy" decoding="async" width={420} height={270}
      onLoad={freeze} className={`h-full w-full object-cover ${paused ? 'invisible' : ''}`} />
    {paused ? <canvas ref={canvas} width={420} height={270} className="absolute inset-0 h-full w-full" /> : null}
  </div>
}
