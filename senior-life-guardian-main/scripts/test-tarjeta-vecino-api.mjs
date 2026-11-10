import { decideLasCondesDiscount, mapOficialTarjetaVecino } from "../src/lib/tarjeta-vecino.ts";

const results = [];

function check(name, ok) {
  results.push({ name, ok });
  console.log(`${ok ? "✓" : "✗"} ${name}`);
}

const vigente = mapOficialTarjetaVecino({
  estado: "VIGENTE",
  estado_interno: "VIGENTE",
  tipo_vecino: "RESIDENTE",
  nombre: "NO DEBE COPIARSE",
  calle: "NO DEBE COPIARSE",
});
check(
  "vigente residente no copia datos personales",
  vigente.estado === "VIGENTE" && vigente.tipo === "RESIDENTE",
);
check("el objeto no trae nombre", !("nombre" in vigente));

const decision15 = decideLasCondesDiscount({
  tier: "general",
  periodo: "mensual",
  ...vigente,
});
check(
  "tarjeta vigente residente aplica 15%",
  decision15.eligible && decision15.activo && !decision15.adultoMayor,
);

const noVigente = mapOficialTarjetaVecino({ estado: "NO_VIGENTE" });
const decisionNo = decideLasCondesDiscount({
  tier: "general",
  periodo: "mensual",
  ...noVigente,
});
check("NO_VIGENTE no aplica descuento", !decisionNo.eligible && !decisionNo.activo);

const bloqueada = mapOficialTarjetaVecino({
  estado: "VIGENTE",
  estado_interno: "ELIMINADO",
  tipo_vecino: "ADULTO MAYOR",
});
const decisionBloqueada = decideLasCondesDiscount({
  tier: "adulto_mayor",
  periodo: "anual",
  ...bloqueada,
});
check(
  "estado interno eliminado gana sobre vigente",
  bloqueada.estado === "ELIMINADO" && !decisionBloqueada.eligible,
);

const mayor = mapOficialTarjetaVecino({
  estado: "VIGENTE",
  estado_interno: "VIGENTE",
  tipo_vecino: "ADULTO MAYOR",
});
const decision20 = decideLasCondesDiscount({
  tier: "adulto_mayor",
  periodo: "mensual",
  ...mayor,
});
check("adulto mayor vigente aplica 20%", decision20.eligible && decision20.adultoMayor);

const decision15sobre20 = decideLasCondesDiscount({
  tier: "adulto_mayor",
  periodo: "mensual",
  ...vigente,
});
check(
  "residente no obtiene el 20%",
  !decision15sobre20.eligible && decision15sobre20.alternateCode === "VECINO-LASCONDES",
);

check(
  "sin vecino no está activo",
  mapOficialTarjetaVecino(null).estado === "" && mapOficialTarjetaVecino(null).found === false,
);

const failed = results.filter((row) => !row.ok);
console.log(`\n${results.length - failed.length}/${results.length} ok`);
process.exit(failed.length ? 1 : 0);
