// Vacío hasta que exista un enlace real de afiliado. Un mailto no paga comisión.
export const SPECIALIST_AFFILIATE_URL: string | null = null;

export const specialistHref =
  SPECIALIST_AFFILIATE_URL ??
  "mailto:hola@cuidadoweb.com?subject=Problema%20grave%20en%20mi%20WordPress";

export const specialistAction = SPECIALIST_AFFILIATE_URL
  ? "Ir al especialista en desinfección"
  : "Pedir la derivación";

export const specialistDisclosure = SPECIALIST_AFFILIATE_URL
  ? "Nota de transparencia: si contratas el servicio del especialista a través de este enlace, CuidadoWeb recibe una comisión de afiliación. CuidadoWeb no hace la limpieza ni promete que el sitio quede limpio. Esa garantía es del especialista. Si la duda es sobre esa limpieza, el soporte te devuelve con ellos."
  : "CuidadoWeb no hace esa limpieza ni promete que el sitio quede limpio. Este correo solo pide la derivación. La garantía será del especialista. Si la duda es sobre esa limpieza, el soporte te devuelve con ellos.";
