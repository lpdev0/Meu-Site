import { ArrowUpRight } from 'lucide-react'
import { siteConfig } from '../data'

function WhatsAppIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" className="h-[1.25em] w-[1.25em] shrink-0" aria-hidden="true" focusable="false">
    <path d="M20.52 3.48A11.9 11.9 0 0 0 12.05 0C5.46 0 .1 5.36.1 11.95c0 2.1.55 4.16 1.6 5.97L0 24l6.24-1.64a11.95 11.95 0 0 0 5.8 1.48h.01C18.64 23.84 24 18.48 24 11.9a11.8 11.8 0 0 0-3.48-8.42ZM12.05 21.82a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.7.97.99-3.61-.24-.37a9.9 9.9 0 0 1-1.52-5.27c0-5.48 4.46-9.94 9.95-9.94a9.87 9.87 0 0 1 7.03 2.92 9.87 9.87 0 0 1 2.9 7.04c0 5.48-4.46 9.85-10 9.85Zm5.45-7.43c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.9-.8-1.5-1.78-1.67-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.48.71.3 1.27.48 1.7.62.71.22 1.36.19 1.87.11.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.08-.12-.28-.2-.58-.35Z" />
  </svg>
}

export function ContactButton({ onContact, label = 'Vamos conversar' }: { onContact: () => void; label?: string }) {
  const className = 'contact-button inline-flex max-w-full items-center justify-center gap-2.5 rounded-full px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-white transition-transform duration-200 hover:scale-105 active:scale-95 sm:px-10 sm:py-3.5 sm:text-sm md:px-12 md:py-4 md:text-base'
  const content = <><span>{label}</span><WhatsAppIcon /></>
  return siteConfig.contactUrl
    ? <a className={className} href={siteConfig.contactUrl} target="_blank" rel="noopener noreferrer" aria-label={`${label} pelo WhatsApp`}>{content}</a>
    : <button className={className} onClick={onContact}>{content}</button>
}

export function LiveProjectButton({ href, onPreview }: { href: string; onPreview: () => void }) {
  const className = 'inline-flex shrink-0 items-center justify-center gap-2.5 rounded-full border-2 border-silver px-8 py-3 text-sm font-medium uppercase tracking-widest text-silver transition-colors hover:bg-silver/10 sm:px-10 sm:py-3.5 sm:text-base'
  const content = <><span>Explorar projeto</span><ArrowUpRight className="h-[1.25em] w-[1.25em] shrink-0" aria-hidden="true" focusable="false" /></>
  return href ? <a className={className} href={href} target="_blank" rel="noopener noreferrer">{content}</a>
    : <button className={className} onClick={onPreview}>{content}</button>
}
