import { Home, Share2 } from 'lucide-react';

export default function IOSInstallGuide() {
  return (
    <div className="ios-install-guide">
      <div className="ios-install-icon" aria-hidden="true">
        <Home size={18} />
      </div>
      <div>
        <strong>Instala la app en iPhone</strong>
        <p>
          En Safari toca <Share2 size={14} aria-hidden="true" /> Compartir y luego
          {' '}Añadir a pantalla de inicio.
        </p>
      </div>
    </div>
  );
}
