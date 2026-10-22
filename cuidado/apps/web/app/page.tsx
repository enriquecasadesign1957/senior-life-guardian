import { AnalyzeForm } from "@/components/analyze-form";
import { ConnectorPanel } from "@/components/connector-panel";
import { Checks, Limits } from "@/components/landing/marks";

const partnerMailto =
  "mailto:hola@cuidadoweb.com?subject=Programa%20de%20Reparto%20CuidadoWeb";
const allianceMailto =
  "mailto:hola@cuidadoweb.com?subject=Programa%20Alianza%20CuidadoWeb";

export default function HomePage() {
  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-start gap-12 px-6 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <div className="max-w-xl">
          <p className="text-sm font-medium tracking-wide text-pine">CuidadoWeb.com</p>
          <h1 className="mt-4 text-4xl leading-[1.08] tracking-tight sm:text-6xl">
            Tu WordPress limpio, vigilado y protegido
          </h1>
          <p className="mt-6 text-lg text-stone-700">
            Sin tocar código. Sin riesgos innecesarios. Sin romper tu sitio.
          </p>
          <p className="mt-4 text-base text-stone-600">Diagnostica gratis tu web en menos de 2 minutos.</p>
        </div>
        <div id="analizar" className="scroll-mt-28 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
          <AnalyzeForm inputId="url" buttonLabel="Analizar mi sitio gratis" />
          <p className="mt-3 text-sm text-stone-500">Sin tarjeta de crédito. Sin compromisos. Sin riesgos.</p>
          <ConnectorPanel />
        </div>
      </section>

      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <h2 className="text-3xl tracking-tight sm:text-4xl">WordPress necesita mantenimiento</h2>
            <p className="mt-4 text-stone-700">Con el tiempo, cualquier web acumula:</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              "Plugins desactualizados",
              "Revisiones innecesarias",
              "Spam almacenado",
              "Base de datos inflada",
              "Imágenes pesadas",
              "Problemas de rendimiento",
            ].map((item) => (
              <li key={item} className="rounded-2xl bg-paper px-4 py-4 text-sm">
                {item}
              </li>
            ))}
          </ul>
          <div className="lg:col-span-2 max-w-3xl space-y-4 text-lg leading-relaxed text-stone-800">
            <p>La mayoría de las herramientas intentan arreglarlo todo automáticamente.</p>
            <p className="font-display text-3xl text-ink">Nosotros no.</p>
            <p>Solo automatizamos lo que puede revertirse de forma segura.</p>
            <p>Porque una web caída cuesta más que una web lenta.</p>
          </div>
        </div>
      </section>

      <section id="funciona" className="scroll-mt-28">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-3xl tracking-tight sm:text-4xl">Cómo funciona</h2>
          <div id="precios" className="mt-10 scroll-mt-28 space-y-6">
            <article className="grid gap-8 rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-sm font-medium text-pine">01</p>
                <h3 className="mt-2 text-3xl">Diagnosticar</h3>
                <p className="mt-3 text-stone-700">
                  Recibe un informe claro en español sobre el estado de tu WordPress.
                </p>
                <p className="mt-6 font-display text-4xl">Gratis</p>
                <p className="mt-2 text-sm text-stone-600">1 análisis cada 24 horas por dominio.</p>
                <a href="#analizar" className="mt-6 inline-block rounded-full bg-pine px-5 py-3 text-sm font-medium text-white">
                  Probar análisis gratuito
                </a>
              </div>
              <div>
                <p className="text-sm font-medium text-stone-500">Detectamos</p>
                <div className="mt-4">
                  <Checks
                    items={[
                      "Problemas de velocidad",
                      "Imágenes demasiado pesadas",
                      "Plugins pendientes de actualización",
                      "Parches de seguridad disponibles",
                      "Exceso de revisiones",
                      "Transitorios vencidos",
                      "Spam acumulado",
                      "Problemas de base de datos",
                    ]}
                  />
                </div>
              </div>
            </article>

            <article className="grid gap-8 rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 lg:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-pine">02</p>
                <h3 className="mt-2 text-3xl">Limpiar</h3>
                <p className="mt-3 text-stone-700">Eliminamos de forma segura lo que ya no aporta valor.</p>
                <p className="mt-6 text-sm font-medium text-stone-500">Antes de actuar te mostramos exactamente</p>
                <ul className="mt-3 space-y-2 text-sm text-stone-800">
                  <li>Qué se eliminará</li>
                  <li>Cuánto espacio se recuperará</li>
                  <li>Cuántos elementos están afectados</li>
                </ul>
                <p className="mt-8 text-sm text-stone-500">Rescate</p>
                <p className="font-display text-4xl">$29</p>
                <p className="text-sm text-stone-600">pago único</p>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-stone-500">Eliminamos</p>
                  <div className="mt-3">
                    <Checks
                      items={["Transitorios vencidos", "Revisiones antiguas", "Spam antiguo", "Basura de la base de datos"]}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-500">Además</p>
                  <div className="mt-3">
                    <Checks items={["Restauración disponible durante 7 días", "Historial completo de cambios"]} />
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
              <p className="text-sm font-medium text-pine">03</p>
              <h3 className="mt-2 text-3xl">Reparar</h3>
              <p className="mt-3 max-w-2xl text-stone-700">Cuando existe un parche de seguridad importante:</p>
              <div className="mt-5 max-w-xl">
                <Checks
                  items={[
                    "Te avisamos",
                    "Tú decides",
                    "Actualizamos un único plugin",
                    "Solo si el parche corrige una vulnerabilidad conocida",
                  ]}
                />
              </div>
              <p className="mt-6 text-sm text-stone-600">Nada se actualiza automáticamente sin autorización.</p>
            </article>

            <article className="grid gap-8 rounded-3xl bg-ink p-6 text-white sm:p-8 lg:grid-cols-[1fr_0.7fr] lg:items-end">
              <div>
                <p className="text-sm font-medium text-emerald-200">04</p>
                <h3 className="mt-2 text-3xl">Mantener</h3>
                <p className="mt-3 max-w-xl text-stone-200">
                  Tu sitio permanece vigilado mientras tú trabajas en tu negocio.
                </p>
                <p className="mt-6 text-sm font-medium text-stone-300">Incluye</p>
                <ul className="mt-3 space-y-2 text-sm">
                  {[
                    "Informe semanal",
                    "Limpiezas periódicas",
                    "Alertas de seguridad",
                    "Monitorización de disponibilidad",
                    "Avisos de nuevos parches",
                  ].map((item) => (
                    <li key={item}>✓ {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm text-stone-300">Plan Cuidado</p>
                <p className="font-display text-5xl">$19</p>
                <p className="text-sm text-stone-300">al mes</p>
                <a href="#analizar" className="mt-6 inline-block rounded-full bg-white px-5 py-3 text-sm font-medium text-ink">
                  Empezar por el análisis
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="agencias" className="scroll-mt-28 border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="max-w-2xl text-3xl tracking-tight sm:text-4xl">Para agencias</h2>
          <p className="mt-3 text-stone-700">Dos formas de ganar dinero con CuidadoWeb</p>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <article className="rounded-3xl border border-stone-200 p-6 sm:p-8">
              <h3 className="text-2xl">Programa de Reparto</h3>
              <p className="mt-3 text-stone-700">Recomienda CuidadoWeb a tus clientes.</p>
              <p className="mt-2 text-stone-700">Nosotros hacemos el trabajo técnico.</p>
              <p className="mt-2 text-stone-700">Tú conservas la relación con el cliente.</p>
              <p className="mt-6 text-sm font-medium text-stone-500">Comisiones</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>$6 por cada Rescate vendido</li>
                <li>20% del Plan Cuidado durante 12 meses</li>
              </ul>
              <p className="mt-6 text-sm font-medium text-stone-500">Seguimiento automático</p>
              <p className="mt-2 text-sm leading-6 text-stone-700">
                Cada agencia recibe un código único. Stripe identifica quién ha referido cada cliente y calcula las
                comisiones automáticamente.
              </p>
              <p className="mt-6 text-sm font-medium text-stone-500">Ideal para</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {["Agencias web", "Freelancers", "Mantenimiento WordPress", "Marketing digital"].map((item) => (
                  <li key={item} className="rounded-full bg-paper px-3 py-1 text-sm">
                    {item}
                  </li>
                ))}
              </ul>
              <a href={partnerMailto} className="mt-8 inline-block rounded-full bg-ink px-5 py-3 text-sm font-medium text-white">
                Quiero ser partner
              </a>
              <p className="mt-3 text-xs text-stone-500">Te abrimos el código. Las comisiones se liquidan por Stripe.</p>
            </article>

            <article className="rounded-3xl bg-paper p-6 sm:p-8">
              <h3 className="text-2xl">Programa Alianza</h3>
              <p className="mt-3 text-stone-700">
                Para agencias que quieren ofrecer mantenimiento WordPress bajo su propia marca.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-sm text-stone-500">Plan Agencia 10</p>
                  <p className="mt-1 text-sm">Hasta 10 sitios.</p>
                  <p className="font-display text-3xl">$79/mes</p>
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-sm text-stone-500">Plan Agencia 40</p>
                  <p className="mt-1 text-sm">Hasta 40 sitios.</p>
                  <p className="font-display text-3xl">$199/mes</p>
                </div>
              </div>
              <p className="mt-6 text-sm font-medium text-stone-500">Incluye</p>
              <div className="mt-3">
                <Checks
                  items={[
                    "Informes marca blanca",
                    "Vigilancia de todos los sitios",
                    "Limpiezas programadas",
                    "Alertas de seguridad",
                    "Participación de la agencia en incidencias",
                    "Comunicación conjunta con WakeUpDev cuando sea necesario",
                  ]}
                />
              </div>
              <p className="mt-6 text-sm leading-6 text-stone-700">
                Tus clientes no necesitan cuenta. La agencia gestiona todo. Puede facturar el servicio al precio que
                decida.
              </p>
              <a
                href={allianceMailto}
                className="mt-8 inline-block rounded-full border border-stone-400 px-5 py-3 text-sm font-medium"
              >
                Quiero la alianza
              </a>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-3xl">
          <h2 className="text-3xl tracking-tight sm:text-4xl">Lo que nunca haremos</h2>
          <p className="mt-3 text-stone-700">Porque la mejor automatización es la que sabe cuándo detenerse.</p>
          <div className="mt-8">
            <Limits
              items={[
                "Editar temas automáticamente",
                "Modificar PHP mediante IA",
                "Reescribir functions.php",
                "Actualizar todos los plugins de golpe",
                "Aplicar cambios irreversibles",
              ]}
            />
          </div>
          <p className="mt-8 text-lg">Si no podemos deshacerlo de forma segura, no lo automatizamos.</p>
        </div>

        <article className="mt-16 rounded-3xl border border-dashed border-stone-300 p-6 sm:p-8">
          <p className="text-sm font-medium text-pine">Próximamente</p>
          <h2 className="mt-2 text-3xl">Optimización inteligente de imágenes</h2>
          <p className="mt-3 text-stone-700">Incluida en el Plan Cuidado.</p>
          <div className="mt-5">
            <Checks
              items={[
                "100 imágenes al mes",
                "Conservando el archivo original",
                "Sin cambiar URLs",
                "Compatible con Elementor",
                "Compatible con WooCommerce",
              ]}
            />
          </div>
          <p className="mt-6 text-sm text-stone-600">Paquetes adicionales: $10 por cada 1.000 imágenes.</p>
        </article>
      </section>

      <section className="bg-pine text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl tracking-tight sm:text-5xl">Nuestra promesa</h2>
            <p className="mt-6 text-lg text-emerald-50">La mayoría de herramientas intentan parecer inteligentes.</p>
            <p className="mt-3 font-display text-3xl">Nosotros intentamos ser prudentes.</p>
            <p className="mt-6 text-emerald-50">
              Tu WordPress sigue funcionando porque solo hacemos cambios seguros.
            </p>
          </div>
          <div id="analizar-ahora" className="scroll-mt-28">
            <h3 className="text-2xl">Analiza tu web gratis</h3>
            <p className="mt-2 text-sm text-emerald-50">Sin tarjeta de crédito. Sin compromisos. Sin riesgos.</p>
            <div className="mt-6">
              <AnalyzeForm inputId="url-final" buttonLabel="Analizar mi sitio ahora" variant="inverse" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
