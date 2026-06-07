import { useState } from 'react';
import { Check, Copy, ExternalLink, Share2 } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { PRODUCTION_URL } from '../utils/platform';

const copyWithFallback = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    return copied;
  }
};

export default function IOSOpenInSafariNotice({ browserName = 'este navegador' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const didCopy = await copyWithFallback(PRODUCTION_URL);
    setCopied(didCopy);
    if (didCopy) {
      window.setTimeout(() => setCopied(false), 2400);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card ios-open-card">
        <BrandLogo variant="full" className="login-brand-logo" />

        <div className="login-header">
          <h2>Abre la app en Safari</h2>
          <p>
            Para iniciar sesión en iPhone, abre Organizador GEMB en Safari.
            {' '}
            {browserName} limita el inicio con Google.
          </p>
        </div>

        <div className="ios-copy-panel">
          <span>{PRODUCTION_URL}</span>
          <button className="btn btn-primary" type="button" onClick={handleCopy}>
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>

        <ol className="ios-steps">
          <li>Toca los tres puntos o el botón de compartir.</li>
          <li>Elige Abrir en Safari.</li>
          <li>Inicia sesión con Google.</li>
          <li>Luego toca Compartir y Añadir a pantalla de inicio.</li>
        </ol>

        <div className="ios-open-actions">
          <a className="btn btn-secondary" href={PRODUCTION_URL} target="_blank" rel="noreferrer">
            <ExternalLink size={18} />
            Abrir enlace
          </a>
          <div className="ios-share-hint">
            <Share2 size={16} aria-hidden="true" />
            En WhatsApp, si el botón abre aquí mismo, copia el enlace y pégalo en Safari.
          </div>
        </div>
      </div>
    </div>
  );
}
