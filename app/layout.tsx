import type { Metadata } from 'next';
import Script from 'next/script';
import AnalyticsConsent from './analytics-consent';
import './globals.css';
import './product.css';
import './access/access.css';
import './visual-foundation.css';
export const metadata: Metadata = { title:'Startupia — Piensa en grande. Empieza inteligente.',description:'Inteligencia artificial, mentorías y un workspace conectado para transformar tus ideas en startups reales.',icons:{icon:'/isotipo.png'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><head><link rel="stylesheet" href="/motion-v5.css"/><link rel="stylesheet" href="/ecosystem.css"/></head><body>{children}<AnalyticsConsent/><Script src="/motion-v5.js" strategy="afterInteractive"/></body></html>}
