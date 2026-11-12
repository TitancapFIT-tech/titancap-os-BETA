import type { Metadata, Viewport } from 'next';
import './globals.css';
import './pwa-install.css';
import './motion-brand.css';
import InstallPrompt from './components/InstallPrompt';

export const metadata: Metadata = {
  title: 'Doit — Menos pantalla. Más vida real.',
  description: 'Organiza planes, reúne a tus personas y convierte las buenas intenciones en encuentros reales.',
  applicationName: 'Doit',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Doit' },
  icons: {
    icon: [{ url: '/doit-icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/doit-icon.svg', type: 'image/svg+xml' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#f7f8f5',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
