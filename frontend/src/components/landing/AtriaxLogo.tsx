import logoLight from '@/assets/images/logo_sin_fondo3.svg';
import logoDark from '@/assets/images/logo_sin_fondo2.svg';

interface AtriaxLogoProps {
  className?: string;
}

export function AtriaxLogo({ className = 'size-8 shrink-0' }: AtriaxLogoProps) {
  return (
    <>
      <img
        src={logoLight}
        alt="Atriax"
        className={`${className} dark:hidden`}
      />
      <img
        src={logoDark}
        alt="Atriax"
        className={`${className} hidden dark:block`}
      />
    </>
  );
}
