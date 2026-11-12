'use client';

import { useEffect, useState } from 'react';
import { ArrowDownToLine, Check, ChevronRight, Download, Info, Smartphone, X } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const DISMISSAL_KEY = 'doit-install-dismissed-until';
const INSTALLED_KEY = 'doit-install-confirmed';
const WEEK = 7 * 24 * 60 * 60 * 1000;

function readNumber(key: string) {
  try { return Number(window.localStorage.getItem(key) || 0); } catch { return 0; }
}

function writeValue(key: string, value: string) {
  try { window.localStorage.setItem(key, value); } catch { /* Storage can be unavailable in private mode. */ }
}

export default function InstallPrompt() {
  const [userId, setUserId] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    const ios = /iphone|ipad|ipod/i.test(window.navigator.userAgent)
      || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    setIsIOS(ios);
    setInstalled(standalone || readNumber(INSTALLED_KEY) === 1);

    const supabase = getSupabase();
    let alive = true;
    if (supabase) {
      void supabase.auth.getSession().then(({ data }) => {
        if (alive) setUserId(data.session?.user?.id ?? null);
      });
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUserId(session?.user?.id ?? null);
      });
      var unsubscribe = () => listener.subscription.unsubscribe();
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setOpen(false);
      writeValue(INSTALLED_KEY, '1');
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.info('Doit offline support is not available in this browser yet.', error);
      });
    }

    return () => {
      alive = false;
      unsubscribe?.();
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  useEffect(() => {
    if (!userId || installed) {
      setOpen(false);
      return;
    }
    if (readNumber(DISMISSAL_KEY) > Date.now()) return;
    const timer = window.setTimeout(() => setOpen(true), 1600);
    return () => window.clearTimeout(timer);
  }, [userId, installed]);

  const dismiss = () => {
    writeValue(DISMISSAL_KEY, String(Date.now() + WEEK));
    setOpen(false);
  };

  const install = async () => {
    if (!deferredPrompt) {
      dismiss();
      return;
    }
    setBusy(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      if (choice.outcome === 'accepted') {
        setInstalled(true);
        writeValue(INSTALLED_KEY, '1');
        setOpen(false);
      }
    } catch (error) {
      console.error('Doit installation prompt failed:', error);
    } finally {
      setBusy(false);
    }
  };

  if (!userId || installed) return null;

  const steps = isIOS
    ? [
        'Abre Doit en Safari desde tu iPhone o iPad.',
        'Pulsa el botón Compartir (el cuadrado con la flecha hacia arriba).',
        'Desliza las opciones y selecciona “Añadir a pantalla de inicio”.',
        'Pulsa “Añadir”. El icono de Doit quedará junto a tus aplicaciones.',
      ]
    : [
        'Abre Doit en Chrome o en el navegador compatible de tu celular.',
        'Pulsa el menú del navegador (⋮) en la parte superior.',
        'Selecciona “Instalar aplicación” o “Añadir a pantalla de inicio”.',
        'Confirma con “Instalar” o “Añadir”. Después abre Doit desde su icono.',
      ];

  return (
    <>
      {!open && (
        <button type="button" className="doit-install-chip" onClick={() => setOpen(true)}>
          <Download size={15} />
          Instalar Doit
        </button>
      )}
      {open && (
        <div className="doit-install-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) dismiss();
        }}>
          <section className="doit-install-dialog" role="dialog" aria-modal="true" aria-labelledby="doit-install-title">
            <button type="button" className="doit-install-close" aria-label="Cerrar" onClick={dismiss}>
              <X size={19} />
            </button>
            <div className="doit-install-mark"><span>d<span>.</span></span></div>
            <div className="doit-install-eyebrow">DOIT · MÁS CERCA DE TU VIDA REAL</div>
            <h2 id="doit-install-title">Lleva Doit contigo.</h2>
            <p className="doit-install-lead">Añade Doit a la pantalla de inicio para abrir tus planes como una aplicación, sin buscar el enlace cada vez.</p>
            <div className="doit-install-device">
              <Smartphone size={18} />
              <span>{isIOS ? 'Instalación en iPhone o iPad' : 'Instalación en Android'}</span>
              <Check size={16} />
            </div>
            <ol className="doit-install-steps">
              {steps.map((step, index) => (
                <li key={step}>
                  <span className="doit-install-step-number">{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <div className="doit-install-note">
              <Info size={16} />
              <span>La instalación es opcional y gratuita. Puedes seguir usando Doit desde el navegador.</span>
            </div>
            {deferredPrompt ? (
              <button type="button" className="doit-install-primary" onClick={install} disabled={busy}>
                <ArrowDownToLine size={17} />
                {busy ? 'Abriendo instalación…' : 'Instalar Doit ahora'}
                <ChevronRight size={17} />
              </button>
            ) : (
              <button type="button" className="doit-install-primary" onClick={dismiss}>
                Entendido, lo haré después
                <ChevronRight size={17} />
              </button>
            )}
            <button type="button" className="doit-install-secondary" onClick={dismiss}>Ahora no</button>
          </section>
        </div>
      )}
    </>
  );
}
