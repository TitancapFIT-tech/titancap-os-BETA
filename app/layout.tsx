import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Doit — Menos pantalla. Más vida real.', description: 'Organiza planes, reúne a tus personas y convierte las buenas intenciones en encuentros reales.', applicationName: 'Doit', appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Doit' }, icons: { icon: '/favicon.svg' } };
export const viewport: Viewport = { themeColor: '#f7f8f5', width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es"><body>{children}</body></html>; }
