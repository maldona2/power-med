import { AtriaxLogo } from './AtriaxLogo';

export function LandingFooter() {
  return (
    <footer className="py-12 bg-background border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <AtriaxLogo />
            <span className="text-xl font-semibold text-foreground">
              Atriax
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Términos
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Privacidad
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Contacto
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Blog
            </a>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2026 Atriax. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
}
