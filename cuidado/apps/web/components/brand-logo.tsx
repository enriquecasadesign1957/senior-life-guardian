type BrandLogoProps = {
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ className = "h-8 w-auto", priority = false }: BrandLogoProps) {
  return (
    <picture>
      <source srcSet="/logo-cuidadoweb.webp" type="image/webp" />
      <img
        src="/logo-cuidadoweb.png"
        alt="CuidadoWeb"
        width={800}
        height={267}
        className={className}
        decoding="async"
        loading={priority ? "eager" : "lazy"}
      />
    </picture>
  );
}
