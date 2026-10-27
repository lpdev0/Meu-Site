import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, X } from 'lucide-react'
import { HeroSection, MarqueeSection, AboutSection, ServicesSection, ProjectsSection, ProcessSection, InvestmentSection, ContactSection, Footer } from './components/Sections'
import { projects, siteConfig } from './data'

export default function App() {
  const [modal, setModal] = useState<'contact' | number | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (modal === null) { dialog.current?.close(); return }
    const previousFocus = document.activeElement as HTMLElement | null
    dialog.current?.showModal()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow; previousFocus?.focus() }
  }, [modal])
  return <>
    <a href="#about" className="skip-link">Pular para o conteúdo</a>
    <main className="bg-ink text-silver" style={{ overflowX: 'clip' }}>
      <HeroSection onContact={() => setModal('contact')} />
      <MarqueeSection />
      <AboutSection onContact={() => setModal('contact')} />
      <ServicesSection />
      <ProjectsSection onPreview={setModal} />
      <ProcessSection />
      <InvestmentSection onContact={() => setModal('contact')} />
      <ContactSection onContact={() => setModal('contact')} />
    </main>
    <Footer />
    <dialog ref={dialog} onCancel={() => setModal(null)} onClick={event => { if (event.target === event.currentTarget) setModal(null) }} aria-labelledby="dialog-heading" className="portfolio-dialog rounded-[32px] border border-silver/25 bg-ink p-6 text-silver sm:p-10">
      <button onClick={() => setModal(null)} aria-label="Fechar janela" className="absolute right-4 top-4 rounded-full p-2 transition-colors hover:bg-white/10"><X size={22} /></button>
      {modal === 'contact' ? <div className="py-5">
        <ArrowUpRight size={40} className="mb-5 text-fuchsia-400" />
        <h2 id="dialog-heading" className="mb-5 text-4xl font-black uppercase leading-none">Vamos criar<br />algo incrível.</h2>
        <p className="mb-6 max-w-md font-light leading-relaxed text-silver/70">Fale comigo pelo WhatsApp para conversar sobre seu projeto.</p>
        <a href={siteConfig.contactUrl} target="_blank" rel="noopener noreferrer" className="contact-button inline-flex rounded-full px-6 py-3">Conversar pelo WhatsApp ↗</a>
      </div> : typeof modal === 'number' ? <div>
        <p className="mb-2 text-sm uppercase tracking-widest text-silver/60">{projects[modal].category}</p>
        <h2 id="dialog-heading" className="mb-4 pr-7 text-3xl font-black uppercase">{projects[modal].name}</h2>
        <p className="mb-4 font-light text-silver/70">{projects[modal].description}</p>
        <a href={siteConfig.projectUrls[modal]} target="_blank" rel="noopener noreferrer" className="mb-6 inline-flex underline underline-offset-4">Visitar o site ↗</a>
        <div className="grid gap-4">{projects[modal].images.map((src, i) => <img key={src} src={src} alt={`${projects[modal].name} — imagem ${i + 1}`} className="w-full rounded-2xl" />)}</div>
      </div> : null}
    </dialog>
  </>
}
