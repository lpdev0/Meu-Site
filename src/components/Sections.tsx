import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { FadeIn, Magnet, AnimatedText } from './Motion'
import { MotionPreview } from './MotionPreview'
import { HeroBackground } from './HeroBackground'
import { useMotionPreference } from '../hooks/useMotionPreference'
import { ContactButton, LiveProjectButton } from './Buttons'
import { aboutText, marqueeImages, portrait, processSteps, projects, services, siteConfig } from '../data'

export function HeroSection({ onContact }: { onContact: () => void }) {
  const title = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const element = title.current
    const container = element?.parentElement
    if (!element || !container) return
    const fit = () => { element.style.transform = `scaleX(${Math.min(1, container.clientWidth / element.scrollWidth)})` }
    const observer = new ResizeObserver(fit)
    observer.observe(container)
    observer.observe(element)
    void document.fonts.ready.then(fit)
    fit()
    return () => observer.disconnect()
  }, [])
  return <section className="hero relative flex h-screen min-h-[760px] flex-col overflow-x-clip bg-ink" aria-label="Apresentação">
    <HeroBackground />
    <FadeIn as="nav" y={-20} className="relative z-20 flex justify-between px-6 pt-6 text-sm font-medium uppercase tracking-wider text-silver md:px-10 md:pt-8 md:text-lg lg:text-[1.4rem]">
      <a href="#about" className="transition-opacity duration-200 hover:opacity-70">Sobre</a>
      <a href="#investment" className="transition-opacity duration-200 hover:opacity-70">Investimento</a>
      <a href="#projects" className="transition-opacity duration-200 hover:opacity-70">Projetos</a>
      <a href="#contact" className="transition-opacity duration-200 hover:opacity-70">Contato</a>
    </FadeIn>
    <div className="hero-title relative z-[1] mt-6 overflow-hidden px-5 sm:mt-4 md:-mt-5 md:px-8">
      <FadeIn as="h1" delay={0.15} y={40} className="w-full whitespace-nowrap text-center text-[14vw] font-black uppercase leading-none tracking-tight sm:text-[15vw] md:text-[16vw] lg:text-[17.5vw]"><span ref={title} className="hero-heading mx-auto block w-max origin-left">Oi, sou<span className="hero-title-break"> </span>Lorenzo.</span></FadeIn>
    </div>
    <div className="hero-portrait-frame absolute left-1/2 top-1/2 z-10 w-[280px] -translate-x-1/2 -translate-y-1/2 sm:bottom-0 sm:top-auto sm:w-[360px] sm:translate-y-0 md:w-[440px] lg:w-[520px]">
      <FadeIn delay={0.6} y={30}><Magnet padding={150} strength={3} activeTransition="transform 0.3s ease-out" inactiveTransition="transform 0.6s ease-in-out">
        <img src={portrait} alt="Ilustração de personagem em 3D" className="hero-portrait h-auto w-full object-contain" fetchPriority="high" />
      </Magnet></FadeIn>
    </div>
    <div className="hero-bottom relative z-20 mt-auto flex items-end justify-between gap-4 px-6 pb-7 sm:pb-8 md:px-10 md:pb-10">
      <FadeIn delay={0.35} y={20}><p className="max-w-[200px] text-[clamp(0.75rem,1.2vw,1.1rem)] font-light uppercase leading-snug tracking-wide text-silver sm:max-w-[250px] md:max-w-[300px]">Desenvolvo experiências digitais que unem design, estratégia e tecnologia para transformar a presença online de negócios.</p></FadeIn>
      <FadeIn delay={0.5} y={20} className="hero-contact flex flex-col items-end gap-4"><p className="text-right text-xs uppercase tracking-wider sm:text-sm">Web designer & desenvolvedor</p><ContactButton onContact={onContact} /></FadeIn>
    </div>
  </section>
}

const rows = [marqueeImages.slice(0, 11), marqueeImages.slice(11)]
function MarqueeRow({ images, x, paused }: { images: string[]; x: MotionValue<number>; paused: boolean }) {
  return <div className="relative h-[270px]"><motion.div className="absolute flex w-max gap-3" style={{ x, left: -(images.length * 432), willChange: 'transform' }}>
    {[...images, ...images, ...images].map((src, i) => <MotionPreview key={`${src}-${i}`} src={src} paused={paused} />)}
  </motion.div></div>
}

export function MarqueeSection() {
  const section = useRef<HTMLElement>(null)
  const offset = useMotionValue(0)
  const right = useTransform(offset, value => value - 200)
  const left = useTransform(offset, value => -(value - 200))
  const reduced = useMotionPreference()
  useEffect(() => {
    if (reduced) return
    let frame = 0
    let sectionTop = 0
    const update = () => {
      if (!frame) frame = requestAnimationFrame(() => { offset.set((window.scrollY - sectionTop + window.innerHeight) * 0.3); frame = 0 })
    }
    const measure = () => { sectionTop = (section.current?.getBoundingClientRect().top ?? 0) + window.scrollY; update() }
    const observer = new ResizeObserver(measure)
    observer.observe(document.body)
    measure()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', measure)
    return () => { observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener('scroll', update); window.removeEventListener('resize', measure) }
  }, [offset, reduced])
  return <section ref={section} className="flex flex-col gap-3 overflow-hidden bg-ink pb-10 pt-24 sm:pt-32 md:pt-40" aria-label="Galeria de inspiração criativa">
    <MarqueeRow images={rows[0]} x={right} paused={reduced} /><MarqueeRow images={rows[1]} x={left} paused={reduced} />
  </section>
}

export function AboutSection({ onContact }: { onContact: () => void }) {
  return <section id="about" className="about-section relative flex min-h-screen items-center justify-center px-5 py-20 sm:px-8 md:px-10">
    <div className="relative z-10 flex w-full flex-col items-center gap-16 sm:gap-20 md:gap-24">
      <div className="flex flex-col items-center gap-10 sm:gap-14 md:gap-16">
        <FadeIn as="h2" y={40} className="hero-heading section-heading">Sobre mim.</FadeIn>
        <AnimatedText text={aboutText} />
        <FadeIn className="max-w-[640px] space-y-6 text-center text-base font-light leading-relaxed text-silver/80 sm:text-lg">
          <p>Meu trabalho vai além de criar sites visualmente atraentes. Desenvolvo soluções que combinam <strong className="font-medium text-silver">design estratégico, tecnologia e experiência do usuário</strong>, ajudando empresas a transmitir profissionalismo, fortalecer sua identidade e criar novas oportunidades no ambiente digital.</p>
          <p>Acredito que cada negócio possui uma identidade única. Por isso, busco entender seus objetivos e necessidades para desenvolver projetos personalizados, funcionais e preparados para oferecer uma excelente experiência em qualquer dispositivo.</p>
          <p className="font-medium text-silver">Meu objetivo é simples: criar sites que não sejam apenas bonitos, mas que tenham um propósito e contribuam para o crescimento de cada negócio.</p>
        </FadeIn>
      </div>
      <FadeIn className="max-w-full"><ContactButton onContact={onContact} label="Vamos tirar sua ideia do papel" /></FadeIn>
    </div>
  </section>
}

export function ServicesSection() {
  return <section id="services" className="rounded-t-[40px] bg-white px-5 py-20 text-ink sm:rounded-t-[50px] sm:px-8 sm:py-24 md:rounded-t-[60px] md:px-10 md:py-32">
    <FadeIn as="h2" y={40} className="section-heading mb-16 sm:mb-20 md:mb-28">Serviços.</FadeIn>
    <div className="mx-auto max-w-5xl pb-10">{services.map((service, i) => <FadeIn key={service.name} delay={i * 0.1}>
      <article className={`flex items-center gap-6 border-ink/15 py-8 sm:gap-12 sm:py-10 md:gap-20 md:py-12 ${i < services.length - 1 ? 'border-b' : ''}`}>
        <span className="w-[1.25em] shrink-0 text-[clamp(3rem,10vw,140px)] font-black leading-none tracking-tight">{String(i + 1).padStart(2, '0')}</span>
        <div><h3 className="mb-3 text-[clamp(1rem,2.2vw,2.1rem)] font-medium uppercase">{service.name}</h3><p className="max-w-2xl text-[clamp(0.85rem,1.6vw,1.25rem)] font-light leading-relaxed opacity-60">{service.description}</p></div>
      </article>
    </FadeIn>)}</div>
  </section>
}

function ProjectCard({ project, index, progress, onPreview, stacking }: { project: typeof projects[number]; index: number; progress: MotionValue<number>; onPreview: (index: number) => void; stacking: boolean }) {
  const targetScale = 1 - (projects.length - 1 - index) * 0.03
  const scale = useTransform(progress, [index / projects.length, 1], [1, targetScale])
  return <div className="project-slot sticky top-24 h-[85vh] md:top-32" style={{ zIndex: index + 1 }}>
    <motion.article className="project-card relative origin-top rounded-[40px] border-2 border-silver bg-ink p-4 sm:rounded-[50px] sm:p-6 md:rounded-[60px] md:p-8" style={{ top: stacking ? index * 28 : 0, scale: stacking ? scale : 1 }}>
      <div className="project-card-header mb-5 flex flex-wrap items-center gap-x-6 gap-y-3 sm:mb-6 md:gap-x-10">
        <span className="text-[clamp(3rem,10vw,140px)] font-black leading-none tracking-tight">{String(index + 1).padStart(2, '0')}</span>
        <div className="min-w-0 flex-1"><p className="mb-1 text-xs font-light uppercase tracking-[0.18em] text-silver/60 sm:text-sm">{project.category}</p><h3 className="text-[clamp(1.15rem,2.6vw,2.5rem)] font-medium uppercase leading-tight">{project.name}</h3></div>
        <LiveProjectButton href={siteConfig.projectUrls[index]} onPreview={() => onPreview(index)} />
      </div>
      <p className="mb-6 max-w-3xl text-sm font-light leading-relaxed text-silver/70 sm:text-base">{project.description}</p>
      <div className="project-images grid grid-cols-[2fr_3fr] gap-3 sm:gap-4 md:gap-5">
        <div className="grid gap-3 sm:gap-4 md:gap-5">
          <img src={project.images[0]} alt={`${project.name} — página inicial no computador`} loading="lazy" decoding="async" className="project-image project-image-top h-[clamp(130px,16vw,230px)]" />
          <img src={project.images[1]} alt={`${project.name} — conteúdo e detalhes do site`} loading="lazy" decoding="async" className="project-image project-image-bottom h-[clamp(160px,22vw,340px)]" />
        </div>
        <div className="relative min-h-0">
          <img src={project.images[2]} alt={`${project.name} — apresentação da página inicial`} loading="lazy" decoding="async" className="project-image project-main-preview absolute inset-0 h-full" />
        </div>
      </div>
    </motion.article>
  </div>
}

export function ProjectsSection({ onPreview }: { onPreview: (index: number) => void }) {
  const stack = useRef<HTMLDivElement>(null)
  const reduced = useMotionPreference()
  const stacking = !reduced
  const { scrollYProgress } = useScroll({ target: stack, offset: ['start start', 'end end'] })
  return <section id="projects" className="relative z-10 -mt-10 rounded-t-[40px] bg-ink px-5 pb-20 pt-20 sm:-mt-12 sm:rounded-t-[50px] sm:px-8 sm:pt-24 md:-mt-14 md:rounded-t-[60px] md:px-10 md:pt-32">
    <FadeIn as="h2" y={40} className="hero-heading section-heading mb-10 sm:mb-14">Projetos.</FadeIn>
    <FadeIn className="mx-auto mb-16 max-w-3xl space-y-5 text-center text-lg font-light leading-relaxed text-silver/80 sm:mb-20 md:mb-28">
      <p>Cada projeto é uma oportunidade de transformar um desafio em uma solução digital.</p>
      <p>Explore alguns dos meus trabalhos e descubra como combino criatividade, desenvolvimento e estratégia para construir experiências que valorizam cada marca.</p>
    </FadeIn>
    <div ref={stack} data-stacking={stacking} className="project-stack relative mx-auto max-w-[1600px] pb-24">{projects.map((project, index) => <ProjectCard key={project.name} project={project} index={index} progress={scrollYProgress} onPreview={onPreview} stacking={stacking} />)}</div>
  </section>
}

export function ProcessSection() {
  return <section id="process" className="rounded-t-[40px] bg-white px-5 py-20 text-ink sm:px-8 md:rounded-t-[60px] md:px-10 md:py-32">
    <FadeIn as="h2" className="section-heading mb-10">Como eu trabalho.</FadeIn>
    <FadeIn className="mx-auto mb-14 max-w-3xl space-y-5 text-center text-lg font-light leading-relaxed">
      <p className="font-medium">Um bom site não começa pelo código. Começa por entender o seu negócio.</p>
      <p>Meu processo de criação une planejamento, comunicação e desenvolvimento para construir uma solução alinhada aos seus objetivos.</p>
    </FadeIn>
    <div className="mx-auto grid max-w-5xl gap-x-14 sm:grid-cols-2">{processSteps.map((step, index) => <FadeIn key={step.name}>
      <article className="border-t border-ink/20 py-8">
        <span className="mb-5 block text-5xl font-black">{String(index + 1).padStart(2, '0')}</span>
        <h3 className="mb-4 text-xl font-medium uppercase">{step.name}</h3>
        <p className="font-light leading-relaxed text-ink/70">{step.description}</p>
      </article>
    </FadeIn>)}</div>
  </section>
}

export function InvestmentSection({ onContact }: { onContact: () => void }) {
  return <section id="investment" className="px-5 py-20 sm:px-8 md:px-10 md:py-32">
    <FadeIn as="h2" className="hero-heading section-heading mb-14">Seu próximo passo.</FadeIn>
    <FadeIn className="mx-auto flex max-w-3xl flex-col items-center gap-7 text-center">
      <h3 className="text-2xl font-medium uppercase leading-tight sm:text-4xl">Seu negócio merece uma presença digital à altura do que oferece.</h3>
      <p className="text-lg font-light leading-relaxed text-silver/80">Cada projeto possui suas próprias necessidades, desafios e objetivos. Por isso, trabalho com propostas personalizadas, buscando oferecer uma solução que faça sentido para o momento do seu negócio.</p>
      <p className="text-lg font-light leading-relaxed text-silver/80">Vamos conversar sobre o que você precisa e encontrar o melhor caminho para tirar sua ideia do papel.</p>
      <ContactButton onContact={onContact} label="Solicitar uma proposta" />
    </FadeIn>
  </section>
}

export function ContactSection({ onContact }: { onContact: () => void }) {
  return <section id="contact" className="rounded-t-[40px] border-t border-silver/20 px-5 py-20 sm:px-8 md:rounded-t-[60px] md:px-10 md:py-32">
    <FadeIn as="h2" className="hero-heading section-heading mb-14">Vamos conversar.</FadeIn>
    <FadeIn className="mx-auto flex max-w-3xl flex-col items-center gap-7 text-center">
      <h3 className="text-2xl font-medium uppercase leading-tight sm:text-4xl">Sua próxima grande ideia merece um site à altura.</h3>
      <p className="text-lg font-light leading-relaxed text-silver/80">Se você busca um site profissional, um redesign ou uma presença digital mais estratégica, estou pronto para entender seu projeto e ajudar a transformá-lo em realidade.</p>
      <p className="text-lg font-medium uppercase">Vamos criar algo incrível juntos?</p>
      <p className="text-sm font-light text-silver/70">Fale comigo pelo WhatsApp para conversar sobre seu projeto.</p>
      <ContactButton onContact={onContact} label="Iniciar conversa" />
    </FadeIn>
  </section>
}

export function Footer() {
  return <footer className="border-t border-silver/20 px-6 py-10 text-center text-xs uppercase tracking-wider text-silver/60 sm:px-10 sm:text-sm">
    <p className="mb-3 font-medium text-silver">Lorenzo — Web designer & desenvolvedor</p>
    <p className="mb-8">Design. Desenvolvimento. Experiências digitais.</p>
    <p>© 2026 Lorenzo. Todos os direitos reservados.</p>
  </footer>
}
