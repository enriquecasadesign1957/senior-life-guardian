globalThis.__nitro_main__ = import.meta.url;
import "./_libs/unenv.mjs";

import { H as HTTPError, d as defineLazyEventHandler, a as H3Core } from "./_libs/h3.mjs";
import { H as HookableCore } from "./_libs/hookable.mjs";

import { a as FastResponse } from "./_libs/srvx.mjs";


import "./_libs/rou3.mjs";





function lazyService(loader) {
  let promise, mod;
  return {
    fetch(req) {
      if (mod) {
        return mod.fetch(req);
      }
      if (!promise) {
        promise = loader().then((_mod) => mod = _mod.default || _mod);
      }
      return promise.then((mod2) => mod2.fetch(req));
    }
  };
}
const services = {
  ["ssr"]: lazyService(() => import("./_ssr/index.mjs"))
};
globalThis.__nitro_vite_envs__ = services;
const assets = {
  "/BingSiteAuth.xml": {
    "type": "application/xml",
    "etag": '"56-IoeYAcETV13KlzAeP7H0FMXjM+A"',
    "mtime": "2026-11-02T02:00:30.610Z",
    "size": 86,
    "path": "../client/BingSiteAuth.xml"
  },
  "/flyer-cuadrado.html": {
    "type": "text/html; charset=utf-8",
    "etag": '"2553-uZfXC0vf9/Va1qLHg2V8iqyr+Vo"',
    "mtime": "2026-11-02T02:00:30.610Z",
    "size": 9555,
    "path": "../client/flyer-cuadrado.html"
  },
  "/brochure.html": {
    "type": "text/html; charset=utf-8",
    "etag": '"5618-FalWcHmeSZrkQyK9LXfiyv8W03c"',
    "mtime": "2026-11-02T02:00:30.610Z",
    "size": 22040,
    "path": "../client/brochure.html"
  },
  "/manifest.json": {
    "type": "application/json",
    "etag": '"62d-U97v6TKtv7p/6x7t3V7Xro6jDgA"',
    "mtime": "2026-11-02T02:00:30.610Z",
    "size": 1581,
    "path": "../client/manifest.json"
  },
  "/offline.html": {
    "type": "text/html; charset=utf-8",
    "etag": '"520-Q6BRKmNSApXZnzDAIHATvAksiqU"',
    "mtime": "2026-11-02T02:00:30.610Z",
    "size": 1312,
    "path": "../client/offline.html"
  },
  "/flyer.html": {
    "type": "text/html; charset=utf-8",
    "etag": '"2b58-lPvTxNMR9Q3XgdBJG6VXMy8BSM0"',
    "mtime": "2026-11-02T02:00:30.610Z",
    "size": 11096,
    "path": "../client/flyer.html"
  },
  "/robots.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": '"2e5-HHQr6g+k8vdaPDl5rb0VqcvT9P4"',
    "mtime": "2026-11-02T02:00:30.610Z",
    "size": 741,
    "path": "../client/robots.txt"
  },
  "/senior-life-guardian-192.webp": {
    "type": "image/webp",
    "etag": '"2e96-EduSZXlC/wgWqRPhr3qoxuKfFIw"',
    "mtime": "2026-11-02T02:00:30.610Z",
    "size": 11926,
    "path": "../client/senior-life-guardian-192.webp"
  },
  "/og-senior-safe-v2.jpg": {
    "type": "image/jpeg",
    "etag": '"20f62-W3Xy2pgjyCl9gRE85X4Vhb/hlIU"',
    "mtime": "2026-11-02T02:00:30.610Z",
    "size": 135010,
    "path": "../client/og-senior-safe-v2.jpg"
  },
  "/senior-life-guardian-512.webp": {
    "type": "image/webp",
    "etag": '"ab34-uzzaKm5JNL2IBiDwmTCcKDspHRI"',
    "mtime": "2026-11-02T02:00:30.610Z",
    "size": 43828,
    "path": "../client/senior-life-guardian-512.webp"
  },
  "/senior-safe-192.webp": {
    "type": "image/webp",
    "etag": '"2b7a-nsqNzIDOOcjSMaYivtD1ODsmkWI"',
    "mtime": "2026-11-02T02:00:30.610Z",
    "size": 11130,
    "path": "../client/senior-safe-192.webp"
  },
  "/og-senior-safe.jpg": {
    "type": "image/jpeg",
    "etag": '"20f62-W3Xy2pgjyCl9gRE85X4Vhb/hlIU"',
    "mtime": "2026-11-02T02:00:30.610Z",
    "size": 135010,
    "path": "../client/og-senior-safe.jpg"
  },
  "/senior-safe-512.webp": {
    "type": "image/webp",
    "etag": '"a726-hZrRYRYy8Yz3+TvFSdh5/6Q58Ck"',
    "mtime": "2026-11-02T02:00:30.610Z",
    "size": 42790,
    "path": "../client/senior-safe-512.webp"
  },
  "/sitemap.xml": {
    "type": "application/xml",
    "etag": '"771-dLNOWWc28lRlHN9WLnwpFyzYuOw"',
    "mtime": "2026-11-02T02:00:30.610Z",
    "size": 1905,
    "path": "../client/sitemap.xml"
  },
  "/sw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"327-MqI0WoLOwGNsHlSNV0PU/z/tf7s"',
    "mtime": "2026-11-02T02:00:30.610Z",
    "size": 807,
    "path": "../client/sw.js"
  },
  "/simulador-senior-safe.html": {
    "type": "text/html; charset=utf-8",
    "etag": '"552f-bapyJrRtVSmdzFXR5yYSsgcRyrw"',
    "mtime": "2026-11-02T02:00:30.610Z",
    "size": 21807,
    "path": "../client/simulador-senior-safe.html"
  },
  "/brochure/emergency-button.jpg": {
    "type": "image/jpeg",
    "etag": '"10d75-lqoQ66VPhFyOWoAKqK++31co4g8"',
    "mtime": "2026-11-02T02:00:30.598Z",
    "size": 68981,
    "path": "../client/brochure/emergency-button.jpg"
  },
  "/brochure/hero-emotional.jpg": {
    "type": "image/jpeg",
    "etag": '"14adf-Vb4HvuX7aGmagScLDuW6pC2SQI4"',
    "mtime": "2026-11-02T02:00:30.598Z",
    "size": 84703,
    "path": "../client/brochure/hero-emotional.jpg"
  },
  "/brochure/family-photo.jpg": {
    "type": "image/jpeg",
    "etag": '"14aaa-/5rD1A4FZ4Byr2CdFmIYhlC9wYQ"',
    "mtime": "2026-11-02T02:00:30.598Z",
    "size": 84650,
    "path": "../client/brochure/family-photo.jpg"
  },
  "/brochure/logo-senior-safe.png": {
    "type": "image/png",
    "etag": '"50d69-hngY+uq11/5P+Wfs4Mc+q1YYoyA"',
    "mtime": "2026-11-02T02:00:30.598Z",
    "size": 331113,
    "path": "../client/brochure/logo-senior-safe.png"
  },
  "/senior-safe-icon-source.png": {
    "type": "image/png",
    "etag": '"dc1a1-Pl9+w7gvnoSS5CpEtOpnFW28WoM"',
    "mtime": "2026-11-02T02:00:30.610Z",
    "size": 901537,
    "path": "../client/senior-safe-icon-source.png"
  },
  "/brochure/screen-alerta-multicanal.png": {
    "type": "image/png",
    "etag": '"15b6f8-uA7jbX0+iHgboDTvv5SP+zOHzAM"',
    "mtime": "2026-11-02T02:00:30.602Z",
    "size": 1423096,
    "path": "../client/brochure/screen-alerta-multicanal.png"
  },
  "/brochure/screen-ubicacion-gps.png": {
    "type": "image/png",
    "etag": '"13c7b5-RLrDTOtmBVSF1Fo8OuGREEvZqRE"',
    "mtime": "2026-11-02T02:00:30.606Z",
    "size": 1296309,
    "path": "../client/brochure/screen-ubicacion-gps.png"
  },
  "/brochure/screen-red-proteccion.png": {
    "type": "image/png",
    "etag": '"15b7ff-gXnDwWr71ZJnLn/6G4OXsxXrzpo"',
    "mtime": "2026-11-02T02:00:30.602Z",
    "size": 1423359,
    "path": "../client/brochure/screen-red-proteccion.png"
  },
  "/brochure/senior-couple.jpg": {
    "type": "image/jpeg",
    "etag": '"18e6c-8EKgzHHNuIl/a3PgzCqZ5NhAktw"',
    "mtime": "2026-11-02T02:00:30.606Z",
    "size": 101996,
    "path": "../client/brochure/senior-couple.jpg"
  },
  "/brochure/senior-phone.jpg": {
    "type": "image/jpeg",
    "etag": '"275c3-yLctz8A6SCcsr5E8Slju+4fbc0w"',
    "mtime": "2026-11-02T02:00:30.606Z",
    "size": 161219,
    "path": "../client/brochure/senior-phone.jpg"
  },
  "/images/blog-alarma-sos-responde.png": {
    "type": "image/png",
    "etag": '"167f3-/wY10Ic3IKrwblmJAFgW0hxARp8"',
    "mtime": "2026-11-02T02:00:30.598Z",
    "size": 92147,
    "path": "../client/images/blog-alarma-sos-responde.png"
  },
  "/images/blog-independencia-senior.jpg": {
    "type": "image/jpeg",
    "etag": '"1db31-7vZ+XKWHydKZM+qopUai+JwXGCk"',
    "mtime": "2026-11-02T02:00:30.610Z",
    "size": 121649,
    "path": "../client/images/blog-independencia-senior.jpg"
  },
  "/images/blog-ia-teleasistencia.jpg": {
    "type": "image/jpeg",
    "etag": '"23eb1-EEIczfBIoDqPzBfZwFsVjlG8JWI"',
    "mtime": "2026-11-02T02:00:30.610Z",
    "size": 147121,
    "path": "../client/images/blog-ia-teleasistencia.jpg"
  },
  "/images/blog-prensa-seguridad.jpg": {
    "type": "image/jpeg",
    "etag": '"2c2ce-/8mapMMzqMn6uqOkSf02tS4xFJk"',
    "mtime": "2026-11-02T02:00:30.610Z",
    "size": 180942,
    "path": "../client/images/blog-prensa-seguridad.jpg"
  },
  "/images/cabecera-familia-senior.jpg": {
    "type": "image/jpeg",
    "etag": '"23eb1-EEIczfBIoDqPzBfZwFsVjlG8JWI"',
    "mtime": "2026-11-02T02:00:30.610Z",
    "size": 147121,
    "path": "../client/images/cabecera-familia-senior.jpg"
  },
  "/brochure/screen-modo-familiar.png": {
    "type": "image/png",
    "etag": '"1a03f5-SkF4IkNen/eUcikmsHCxYe0szzc"',
    "mtime": "2026-11-02T02:00:30.602Z",
    "size": 1704949,
    "path": "../client/brochure/screen-modo-familiar.png"
  },
  "/images/deteccion-caidas-senior.jpg": {
    "type": "image/jpeg",
    "etag": '"23eb1-EEIczfBIoDqPzBfZwFsVjlG8JWI"',
    "mtime": "2026-11-02T02:00:30.610Z",
    "size": 147121,
    "path": "../client/images/deteccion-caidas-senior.jpg"
  },
  "/images/hero-senior-phone.jpg": {
    "type": "image/jpeg",
    "etag": '"3cd34-IMMdca/4+IQxvQR1esS2DJbSV9o"',
    "mtime": "2026-11-02T02:00:30.610Z",
    "size": 249140,
    "path": "../client/images/hero-senior-phone.jpg"
  },
  "/assets/activacion-DtqBFgK5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"29-crG9x4dYeQi7xsfEfaRvCOejUcg"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 41,
    "path": "../client/assets/activacion-DtqBFgK5.js"
  },
  "/assets/activity-Dlpl6qcs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f6-5+/Q8QQRhWGJKRqDXZmw81Ymbzk"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 246,
    "path": "../client/assets/activity-Dlpl6qcs.js"
  },
  "/assets/admin-DlGLRX_k.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"67-FkfDDR6xI0mIiPjtRi4TDhftkyE"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 103,
    "path": "../client/assets/admin-DlGLRX_k.js"
  },
  "/assets/admin-auth-NTzgpTM4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2f-/AtRMhCKSP5LqjyXxq2pCPbRK/Q"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 47,
    "path": "../client/assets/admin-auth-NTzgpTM4.js"
  },
  "/assets/admin-pin-gate-BY-7S-8v.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4b4-IgidVAenEw5eANElspC05kNY/hc"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 1204,
    "path": "../client/assets/admin-pin-gate-BY-7S-8v.js"
  },
  "/assets/activar-whatsapp-F4QkMDvU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b10-NObkv7rogMtlWnAYPji5OX3D2ns"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 2832,
    "path": "../client/assets/activar-whatsapp-F4QkMDvU.js"
  },
  "/assets/admin.accounts-D3jUdipu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"192c-lggijf2b+bZf5d6FtkJeDwfCXlw"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 6444,
    "path": "../client/assets/admin.accounts-D3jUdipu.js"
  },
  "/assets/admin.discounts-8QdOJfRm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1b23-m6XU/QnLZltHtNa2efNu6h61lIE"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 6947,
    "path": "../client/assets/admin.discounts-8QdOJfRm.js"
  },
  "/assets/admin.inbox-C8B2faf1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1c06-bwodaNnJn4iYQVf+TI4Ab+7mczg"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 7174,
    "path": "../client/assets/admin.inbox-C8B2faf1.js"
  },
  "/assets/admin.index-B_YIGNgp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9ed-QNw8wd/3dkkSShQHBfYkaPHReEo"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 2541,
    "path": "../client/assets/admin.index-B_YIGNgp.js"
  },
  "/assets/admin.reset-BJvBnVBS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1892-nL2lXjEl4HaaFlEOuwwjtK1FdKo"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 6290,
    "path": "../client/assets/admin.reset-BJvBnVBS.js"
  },
  "/assets/admin.transbank-validacion-Bz8ZIAJl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"28ed-1m0Qg6vAzBZwLfPcEKpmXMhoXcY"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 10477,
    "path": "../client/assets/admin.transbank-validacion-Bz8ZIAJl.js"
  },
  "/assets/alarma-familiar-CocAvzGf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2afd-0mLgH1jlsja5xtsdzSFXuSnXU8Q"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 11005,
    "path": "../client/assets/alarma-familiar-CocAvzGf.js"
  },
  "/assets/alertas-D_HFLkUG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"cf7-NHLvsGIdNmM+SUIML5yEQcEyzLs"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 3319,
    "path": "../client/assets/alertas-D_HFLkUG.js"
  },
  "/assets/analitica-DkGcvKXf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"34ee-vd2/AK80mbkI3DZJhImUNvbfaic"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 13550,
    "path": "../client/assets/analitica-DkGcvKXf.js"
  },
  "/assets/app-BMopePx6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c207-7pQosG3Qn8MOJ1fbd2ZUynfsqv4"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 49671,
    "path": "../client/assets/app-BMopePx6.js"
  },
  "/assets/arrow-right-Do-tlcgT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b1-0QUw2G8KNXXsfdRWEfOYR4xf4zE"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 177,
    "path": "../client/assets/arrow-right-Do-tlcgT.js"
  },
  "/assets/arrow-up-DpcrLDOs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1b8-+qvLUwF/M74k5gjq5Z7gi36xW5Y"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 440,
    "path": "../client/assets/arrow-up-DpcrLDOs.js"
  },
  "/assets/arrow-left-CTNhHZmK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b1-kBPzvfULv+CQlRd/fY/ZiMygfLs"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 177,
    "path": "../client/assets/arrow-left-CTNhHZmK.js"
  },
  "/assets/battery-CwRIYRRx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"cc-2j5h4SyHiHbrPmXc6q51DTLMnKM"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 204,
    "path": "../client/assets/battery-CwRIYRRx.js"
  },
  "/assets/bell-KMfU-zWm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"12e-Vk77ntB1dhhoZqbkifKRIEwhfIw"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 302,
    "path": "../client/assets/bell-KMfU-zWm.js"
  },
  "/assets/bienvenida-premium-BxZ_IeG5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ba0-lYrBYTEIMzLLsOduYfSFiFIjVag"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 2976,
    "path": "../client/assets/bienvenida-premium-BxZ_IeG5.js"
  },
  "/assets/blog.alarma-sos-para-adultos-mayores-que-si-responde-Bsk_sYa_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"313e-SOutPeM8yOUAqjxr+yAQY0ylNDM"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 12606,
    "path": "../client/assets/blog.alarma-sos-para-adultos-mayores-que-si-responde-Bsk_sYa_.js"
  },
  "/assets/blog.como-hablar-con-padres-seguridad-sin-perder-independencia-DfZeb2dd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2568-qTLgboTi62NV03XVh2AsRVnDPuU"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 9576,
    "path": "../client/assets/blog.como-hablar-con-padres-seguridad-sin-perder-independencia-DfZeb2dd.js"
  },
  "/assets/blog.como-la-ia-salva-vidas-emergencias-domesticas-BqMyvZOf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"25ee-1CGHhSG2bye3dUf7GJL4BaFSNuU"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 9710,
    "path": "../client/assets/blog.como-la-ia-salva-vidas-emergencias-domesticas-BqMyvZOf.js"
  },
  "/assets/blog.index-CYCHeMNF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11cf-/fabrAeGmJoRvwBM26zubLJTgQQ"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 4559,
    "path": "../client/assets/blog.index-CYCHeMNF.js"
  },
  "/assets/blog.revista-seguridad-destaca-lanzamiento-senior-safe-Cnj_APnV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1b56-c45mJjzhRHDNJNKUVfImhcFCHyw"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 6998,
    "path": "../client/assets/blog.revista-seguridad-destaca-lanzamiento-senior-safe-Cnj_APnV.js"
  },
  "/assets/button-C1WG8u03.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c03-e20xa0r6gC0cnXgWb0ksdolKURM"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 3075,
    "path": "../client/assets/button-C1WG8u03.js"
  },
  "/assets/card-Ko-fCB5D.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3de-wc5rxCX+uCOl1flmbN/fWw84/Jg"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 990,
    "path": "../client/assets/card-Ko-fCB5D.js"
  },
  "/assets/chart-CJcfSrT8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5e536-b8Jdg4/CuTXgmzCBN3MPc+mN7LE"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 386358,
    "path": "../client/assets/chart-CJcfSrT8.js"
  },
  "/assets/checkout-CWdQI9hc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f70-xvX+NF6aWoqoNwTVrTtpe9gr8SQ"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 3952,
    "path": "../client/assets/checkout-CWdQI9hc.js"
  },
  "/assets/chevron-right-AWxrlUHw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8e-3uBa97dp03M3V4jPQnF2NFZgkJM"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 142,
    "path": "../client/assets/chevron-right-AWxrlUHw.js"
  },
  "/assets/circle-alert-DCbTgWXw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"106-miIUyK4d5PWPY+62F+ot3R0L5Lc"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 262,
    "path": "../client/assets/circle-alert-DCbTgWXw.js"
  },
  "/assets/circle-check-Dpgh5xqb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b9-o6u9P5JTA5d2qwXriWey56sAuJw"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 185,
    "path": "../client/assets/circle-check-Dpgh5xqb.js"
  },
  "/assets/circle-x-b9m5R6l8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d6-7DySieq6KybXHJrH24uSf9XhWno"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 214,
    "path": "../client/assets/circle-x-b9m5R6l8.js"
  },
  "/assets/client.server-BC6JrgM7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"32acf-rOmoVw3D8A7UCdmHQ7mkTgYEdmY"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 207567,
    "path": "../client/assets/client.server-BC6JrgM7.js"
  },
  "/assets/clock-29Qe7bid.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b0-4EMhr7vyS7VtC6nRrXn0SbO1iQY"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 176,
    "path": "../client/assets/clock-29Qe7bid.js"
  },
  "/assets/como-funciona-Djqq40p7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"24b0-b3ghDGWcSRPpdzqLRMG12BG+Xic"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 9392,
    "path": "../client/assets/como-funciona-Djqq40p7.js"
  },
  "/assets/createLucideIcon-BSyXGNWy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4b2-xiT8Nh0blsJ6aN/0htKXEtHn5FM"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 1202,
    "path": "../client/assets/createLucideIcon-BSyXGNWy.js"
  },
  "/assets/createServerFn-DneVZI4d.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10b8-BMRDiiXjbfVGQJhcMgpuru9A1CY"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 4280,
    "path": "../client/assets/createServerFn-DneVZI4d.js"
  },
  "/assets/credit-card-DEYugwGp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"db-qmoBLwo02gjPNklnAaH1pUoBq0E"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 219,
    "path": "../client/assets/credit-card-DEYugwGp.js"
  },
  "/assets/dashboard-DtqBFgK5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"29-crG9x4dYeQi7xsfEfaRvCOejUcg"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 41,
    "path": "../client/assets/dashboard-DtqBFgK5.js"
  },
  "/assets/demo-B7_roH0_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"13b0-7NZ5QJ268qfj2bAen7KpXAXi6r0"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 5040,
    "path": "../client/assets/demo-B7_roH0_.js"
  },
  "/assets/demo-config-4Tk8uEMi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"16b-ejqlzgruwA0YPcWrrafACd2oZMQ"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 363,
    "path": "../client/assets/demo-config-4Tk8uEMi.js"
  },
  "/assets/demo-context-BfXvqyJw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1527-KZHcUjfsq/jxE6xdB8WIyOJSScg"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 5415,
    "path": "../client/assets/demo-context-BfXvqyJw.js"
  },
  "/assets/demo-data-HZFIrA7m.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"11f1-7y4HC75QZiEzzAhSJA4gedv6EBA"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 4593,
    "path": "../client/assets/demo-data-HZFIrA7m.js"
  },
  "/assets/demo-insights-chat-D0JBg0Gl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"16f7-XKkS35p1IIBA/V2DzV5OXOPOcGk"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 5879,
    "path": "../client/assets/demo-insights-chat-D0JBg0Gl.js"
  },
  "/assets/demo-map-visual-D__tvggn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"80d-LJElngTXp++hl5Bax/hAJQAor9c"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 2061,
    "path": "../client/assets/demo-map-visual-D__tvggn.js"
  },
  "/assets/demo-nav-BGzhfGhl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"aad-izzx6PAV+w91HvG4z1IFsguglpU"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 2733,
    "path": "../client/assets/demo-nav-BGzhfGhl.js"
  },
  "/assets/device-Cg2TIPzq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"581-M1nlQCMMu/hMIO35tB7RDA5JuXo"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 1409,
    "path": "../client/assets/device-Cg2TIPzq.js"
  },
  "/assets/download-DYbS8USG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f4-o+HtJefl0SBGWAtu3iGm7V+JjAk"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 244,
    "path": "../client/assets/download-DYbS8USG.js"
  },
  "/assets/demo-phone-frame-9IDCXpVu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2d3-l639MuhBtiIvxjoVhB8X3MeSDBs"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 723,
    "path": "../client/assets/demo-phone-frame-9IDCXpVu.js"
  },
  "/assets/dialog-DrRNUX1q.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6df9-XViwOPufjNxTQuKsISF3CS1UMrw"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 28153,
    "path": "../client/assets/dialog-DrRNUX1q.js"
  },
  "/assets/ejecutivo-CSZMWjHP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"37a3-/uL8yYIjYIM2OlKKtoxoFANbeG0"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 14243,
    "path": "../client/assets/ejecutivo-CSZMWjHP.js"
  },
  "/assets/emergency-cascade-timing-bioFKPfW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8e-7CZ9eyUxSNNeDzCKZDN6ts9XYYg"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 142,
    "path": "../client/assets/emergency-cascade-timing-bioFKPfW.js"
  },
  "/assets/emergency-category-Db3bk060.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2a5-scKUmbspRIWd3spqtyzR+ZyYtRc"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 677,
    "path": "../client/assets/emergency-category-Db3bk060.js"
  },
  "/assets/emergency-simulator-DkoV8jFo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3ed7-25Wok2O07avPooejYI4DZqs27So"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 16087,
    "path": "../client/assets/emergency-simulator-DkoV8jFo.js"
  },
  "/assets/external-link-BZULowIp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"107-pnIICOcuzFNjnw5OtxEDr1Q8QEc"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 263,
    "path": "../client/assets/external-link-BZULowIp.js"
  },
  "/assets/familia-DwPeCOJC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1095-RCAsXEFyEQs5Lb+r+ijxFMGBlR0"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 4245,
    "path": "../client/assets/familia-DwPeCOJC.js"
  },
  "/assets/familia.ack._token-5tz5D5C1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2f6-MG+Hp+tnysimeukWVXfXrK+ceKo"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 758,
    "path": "../client/assets/familia.ack._token-5tz5D5C1.js"
  },
  "/assets/familia.dashboard-D-AV1inc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2651-15wK5laGP1dumOCr0rCSJb4mf3Y"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 9809,
    "path": "../client/assets/familia.dashboard-D-AV1inc.js"
  },
  "/assets/familia.guardianes-DSYYMby_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"24d4-B2v+GJCEZwe6+fDQjOega6qb5hs"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 9428,
    "path": "../client/assets/familia.guardianes-DSYYMby_.js"
  },
  "/assets/family-photo-3l8UpZWN.jpg": {
    "type": "image/jpeg",
    "etag": '"14aaa-/5rD1A4FZ4Byr2CdFmIYhlC9wYQ"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 84650,
    "path": "../client/assets/family-photo-3l8UpZWN.jpg"
  },
  "/assets/family-portal.functions-BeRDJ4Kf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"27c-afgzaTd3rkLDytG4I4MNRMNN+hE"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 636,
    "path": "../client/assets/family-portal.functions-BeRDJ4Kf.js"
  },
  "/assets/family-session-C_uQf2xu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"30a-iXFkh6hGXQD7gb8rtBv45j2+p1o"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 778,
    "path": "../client/assets/family-session-C_uQf2xu.js"
  },
  "/assets/file-text-BT18L4wC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"18d-6j8nOp/F4RZ8a7z5+sKzvqCY2tM"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 397,
    "path": "../client/assets/file-text-BT18L4wC.js"
  },
  "/assets/flujo-8XYE4LBr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1f90-xejf7aHa7RQgQiIur9FMf2bUMsk"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 8080,
    "path": "../client/assets/flujo-8XYE4LBr.js"
  },
  "/assets/anciana-living-discover-pu9L8ImK.png": {
    "type": "image/png",
    "etag": '"3dbad7-+F3I/gdSeRBcN4iiWcNOHZbXamA"',
    "mtime": "2026-11-02T02:00:27.822Z",
    "size": 4045527,
    "path": "../client/assets/anciana-living-discover-pu9L8ImK.png"
  },
  "/assets/gift-uVyfvmsH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"169-1xHbZPqQbAk8aSCiX6Rw9WuZTU8"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 361,
    "path": "../client/assets/gift-uVyfvmsH.js"
  },
  "/assets/guardian-limits-Bk_LteBL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a-NKKUtloJnMvTtYd5hqWsuDC1pFg"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 26,
    "path": "../client/assets/guardian-limits-Bk_LteBL.js"
  },
  "/assets/flujo-C66ib8tk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3a2-TvCbfkK7M9RZ5JJSq/FTjQk2Udc"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 930,
    "path": "../client/assets/flujo-C66ib8tk.js"
  },
  "/assets/guia-17bdy_6I.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2836-0FbzeIEk5+Sdc4l0sFNrjaOC3Zs"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 10294,
    "path": "../client/assets/guia-17bdy_6I.js"
  },
  "/assets/heart-BoBPgpqo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10e-05AHAEaGUL6PrZdJQRhQhr4wQoE"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 270,
    "path": "../client/assets/heart-BoBPgpqo.js"
  },
  "/assets/index-BuvIuxBa.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"bcd-RYxhTCzhDJIUUrphjYzBiG3r0uI"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 3021,
    "path": "../client/assets/index-BuvIuxBa.js"
  },
  "/assets/house-Ccm802hC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"125-LMmnDxSJeTiSPgUbIIYcTqtnZ/E"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 293,
    "path": "../client/assets/house-Ccm802hC.js"
  },
  "/assets/index-C1ozO-US.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"884-tjAMMBotOOFzwGqM17xkoCIP6lY"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 2180,
    "path": "../client/assets/index-C1ozO-US.js"
  },
  "/assets/index-CobTJpls.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2bb-VB3Axpdvm5iMADqtjAGvZEeu5qk"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 699,
    "path": "../client/assets/index-CobTJpls.js"
  },
  "/assets/index-C0bysWAq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e90f-rrsNAHsRsOmZBpRqXvPZlDj6YgI"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 59663,
    "path": "../client/assets/index-C0bysWAq.js"
  },
  "/assets/index-D2TRuK5k.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8db-tjSU9cJL1/uaBXoyQd7mQ4aA8lg"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 2267,
    "path": "../client/assets/index-D2TRuK5k.js"
  },
  "/assets/index-CHfnl4Xl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"18e-+/sorsI2JFc1tIsZc8cZy0KeBuY"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 398,
    "path": "../client/assets/index-CHfnl4Xl.js"
  },
  "/assets/input-DgUnoQLt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"24e-cAo6L2Rdx8mGlddCgAg+vMONDW0"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 590,
    "path": "../client/assets/input-DgUnoQLt.js"
  },
  "/assets/instalar-app-F3r6ohoQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"561-J+knWaWM3Zo75huP0bYmQCtz92I"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 1377,
    "path": "../client/assets/instalar-app-F3r6ohoQ.js"
  },
  "/assets/index-mI5FqTbz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10aa-9GKmcF4xEysJbaljaQinab9yxBY"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 4266,
    "path": "../client/assets/index-mI5FqTbz.js"
  },
  "/assets/index-dfUZxFFN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"76ee2-NGUL/w4uzQZ71OJVTxt4LwraNes"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 487138,
    "path": "../client/assets/index-dfUZxFFN.js"
  },
  "/assets/install-notify-banner-Byrgrfhm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"58d-RsS2KXf3QCNrXq9oET6+X0pCRGI"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 1421,
    "path": "../client/assets/install-notify-banner-Byrgrfhm.js"
  },
  "/assets/key-round-CnWVy_RY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"16a-pfFdDhk1xukVv/knCFX6h4xEoxo"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 362,
    "path": "../client/assets/key-round-CnWVy_RY.js"
  },
  "/assets/label-BoM9kSES.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3d6-C3IZADned2bJp1KDIU0X3f8ZG2o"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 982,
    "path": "../client/assets/label-BoM9kSES.js"
  },
  "/assets/loader-circle-B4jVwMvX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"97-Rha7Qx/WGqIrFfzVvHqGn5e5JKk"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 151,
    "path": "../client/assets/loader-circle-B4jVwMvX.js"
  },
  "/assets/location-map-Cr6n1TTo.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"9f70-aSEgjLCD6y0ywPJeMR/sb28Iick"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 40816,
    "path": "../client/assets/location-map-Cr6n1TTo.css"
  },
  "/assets/map-pin-nlCZutjF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10a-ovb/UoUoEC45Kah0AN2PYxVhIXk"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 266,
    "path": "../client/assets/map-pin-nlCZutjF.js"
  },
  "/assets/mail-CGZ0SmZO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e1-gtqi8wAihf55vdmB90PICwT76Is"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 225,
    "path": "../client/assets/mail-CGZ0SmZO.js"
  },
  "/assets/lock-Buq-BY0W.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d5-Qbq02fekNtvENOe/FCzPKupUi1o"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 213,
    "path": "../client/assets/lock-Buq-BY0W.js"
  },
  "/assets/message-circle-CwjxGjzh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"fd-Hzy8kgnXDiIq6a+M7tLsgJQ0Mv0"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 253,
    "path": "../client/assets/message-circle-CwjxGjzh.js"
  },
  "/assets/mapa-CpL7Lzcm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"77a-+fPdgKtvTf1zwHJVOpAVIFJQ1NM"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 1914,
    "path": "../client/assets/mapa-CpL7Lzcm.js"
  },
  "/assets/monitoreo-CUiCRYe_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1272-FxLs/EQ9eYa1jWysHXiu/siOQ5E"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 4722,
    "path": "../client/assets/monitoreo-CUiCRYe_.js"
  },
  "/assets/native-CdQxL-u2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"570f-uzpfKwR3nKu4rmXs+L2tRjSyCbo"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 22287,
    "path": "../client/assets/native-CdQxL-u2.js"
  },
  "/assets/oneclick.credit-retorno-DtqBFgK5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"29-crG9x4dYeQi7xsfEfaRvCOejUcg"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 41,
    "path": "../client/assets/oneclick.credit-retorno-DtqBFgK5.js"
  },
  "/assets/oneclick.debit-reject-validacion-DtqBFgK5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"29-crG9x4dYeQi7xsfEfaRvCOejUcg"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 41,
    "path": "../client/assets/oneclick.debit-reject-validacion-DtqBFgK5.js"
  },
  "/assets/oneclick.debit-retorno-DtqBFgK5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"29-crG9x4dYeQi7xsfEfaRvCOejUcg"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 41,
    "path": "../client/assets/oneclick.debit-retorno-DtqBFgK5.js"
  },
  "/assets/oneclick.inscripcion-abandonada-DtqBFgK5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"29-crG9x4dYeQi7xsfEfaRvCOejUcg"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 41,
    "path": "../client/assets/oneclick.inscripcion-abandonada-DtqBFgK5.js"
  },
  "/assets/oneclick.retorno-DmEJJU_b.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e9e-c40m4c109n1feh+FQbAH0CdH0XE"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 7838,
    "path": "../client/assets/oneclick.retorno-DmEJJU_b.js"
  },
  "/assets/perfil-BpjoNSsV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b8b-xIroaKA7FTATJ48L+D9VzgvWH1o"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 2955,
    "path": "../client/assets/perfil-BpjoNSsV.js"
  },
  "/assets/logo-senior-safe-IwV_otLv.png": {
    "type": "image/png",
    "etag": '"50d69-hngY+uq11/5P+Wfs4Mc+q1YYoyA"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 331113,
    "path": "../client/assets/logo-senior-safe-IwV_otLv.png"
  },
  "/assets/navigation-CJzorgNE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a0-sIYQFOMae9sIrPGQz2D+0Iwv5P8"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 160,
    "path": "../client/assets/navigation-CJzorgNE.js"
  },
  "/assets/phone-Dlb2pkpf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"14e-QRlPFFMLPhOvdDQaWjpkTzBaYyk"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 334,
    "path": "../client/assets/phone-Dlb2pkpf.js"
  },
  "/assets/planes-SFR3tNyI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1227-4c0q2VQQgk2P4OucCEheWJ6K5dw"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 4647,
    "path": "../client/assets/planes-SFR3tNyI.js"
  },
  "/assets/play-0KKNnWlN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ca-I6ZRDW4ddQrg+uMhyjeEeZtWhdo"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 202,
    "path": "../client/assets/play-0KKNnWlN.js"
  },
  "/assets/oneclick.functions-lyp6QBrD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"48d-rjAGOKpfDYGuVV9SFiy/TRYWh64"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 1165,
    "path": "../client/assets/oneclick.functions-lyp6QBrD.js"
  },
  "/assets/plus-xty_t_qf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a5-++sn8OgBK9mAIc5JqsWpH7UjPTI"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 165,
    "path": "../client/assets/plus-xty_t_qf.js"
  },
  "/assets/post-payment-CKhFT_Qb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4eb-zdhveOrDuXLxZotb3W9OC6q5le0"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 1259,
    "path": "../client/assets/post-payment-CKhFT_Qb.js"
  },
  "/assets/post-payment-install-screen-3_aMYA0h.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"710b-p2BYZG554lu5I10VWx0lfarpxwY"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 28939,
    "path": "../client/assets/post-payment-install-screen-3_aMYA0h.js"
  },
  "/assets/presentacion-BH5gGpAi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2f24-Jjkuka6Z02kNKrvKguyzN3Nma7c"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 12068,
    "path": "../client/assets/presentacion-BH5gGpAi.js"
  },
  "/assets/location-map-BQnqfHt-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1c1565-8fjlXAyMkhTYERAfZMYgP5fjZBI"',
    "mtime": "2026-11-02T02:00:27.822Z",
    "size": 1840485,
    "path": "../client/assets/location-map-BQnqfHt-.js"
  },
  "/assets/privacidad-jMter9gZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d26-QKX+CkvShkLGElZkF54F/re49QQ"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 3366,
    "path": "../client/assets/privacidad-jMter9gZ.js"
  },
  "/assets/reportes-Dvyu7O0B.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"769-WfqhEburbFEhYmkEppt/HzpO52M"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 1897,
    "path": "../client/assets/reportes-Dvyu7O0B.js"
  },
  "/assets/radio-C3hj9Arv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"182-JvwC74DlbROElItlYSGNJ2rU3ys"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 386,
    "path": "../client/assets/radio-C3hj9Arv.js"
  },
  "/assets/refresh-cw-G1zUE43s.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"14d-1aWWKxznPPjdUyrT6x1i6t9u8Q0"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 333,
    "path": "../client/assets/refresh-cw-G1zUE43s.js"
  },
  "/assets/rotate-ccw-Cq09WGj8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d4-SnvWE8OOgJPZpqTs5nmx7dlF7bk"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 212,
    "path": "../client/assets/rotate-ccw-Cq09WGj8.js"
  },
  "/assets/send-DEiGTKSu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"12e-LogpOMoeCjOTgx39qIJ7y5rH4ds"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 302,
    "path": "../client/assets/send-DEiGTKSu.js"
  },
  "/assets/senior-access-auth-Dw3C4Rdk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7c8-Bpv/AZ69j71aTuSEGY3etNZwQb0"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 1992,
    "path": "../client/assets/senior-access-auth-Dw3C4Rdk.js"
  },
  "/assets/senior-couple-D8rl0vIO.jpg": {
    "type": "image/jpeg",
    "etag": '"18e6c-8EKgzHHNuIl/a3PgzCqZ5NhAktw"',
    "mtime": "2026-11-02T02:00:27.810Z",
    "size": 101996,
    "path": "../client/assets/senior-couple-D8rl0vIO.jpg"
  },
  "/assets/shield-COPWxrgi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"117-K1LIztyaeFO0bHSVNRXYFJgPs+4"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 279,
    "path": "../client/assets/shield-COPWxrgi.js"
  },
  "/assets/shield-check-Bg0Yz8R2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"147-9WksO95OWJ5ipGlRuyMWZcKLh3c"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 327,
    "path": "../client/assets/shield-check-Bg0Yz8R2.js"
  },
  "/assets/simulador-DBmDb51z.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"508-aM1YWwuNkRLWNTp6ci1TelZKOXk"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 1288,
    "path": "../client/assets/simulador-DBmDb51z.js"
  },
  "/assets/senior-phone-BwL382rv.jpg": {
    "type": "image/jpeg",
    "etag": '"275c3-yLctz8A6SCcsr5E8Slju+4fbc0w"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 161219,
    "path": "../client/assets/senior-phone-BwL382rv.jpg"
  },
  "/assets/smartphone-B0spihet.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d1-vTGiFqr8hLehi6Dc9e2rt8j8L5s"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 209,
    "path": "../client/assets/smartphone-B0spihet.js"
  },
  "/assets/sparkles-DqHTK4U2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1fa-2+vmfKK5q8bW1D8NBy14qJt0EeQ"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 506,
    "path": "../client/assets/sparkles-DqHTK4U2.js"
  },
  "/assets/star-D15LXCmN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e4-ER61eS/6MZNabt19Dz2ADMcVnN0"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 484,
    "path": "../client/assets/star-D15LXCmN.js"
  },
  "/assets/site-layout-B-aUMEgH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1b1d-CUXZ898KCosvMyOyfm4LFWHcW+s"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 6941,
    "path": "../client/assets/site-layout-B-aUMEgH.js"
  },
  "/assets/styles--iCr8MCh.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"2172a-XoPrLbs7YkrKSw05E6TyJMLrdVU"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 137002,
    "path": "../client/assets/styles--iCr8MCh.css"
  },
  "/assets/screen-alerta-multicanal-DHCI8prb.png": {
    "type": "image/png",
    "etag": '"15b6f8-uA7jbX0+iHgboDTvv5SP+zOHzAM"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 1423096,
    "path": "../client/assets/screen-alerta-multicanal-DHCI8prb.png"
  },
  "/assets/screen-ubicacion-gps-CUENCcf1.png": {
    "type": "image/png",
    "etag": '"13c7b5-RLrDTOtmBVSF1Fo8OuGREEvZqRE"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 1296309,
    "path": "../client/assets/screen-ubicacion-gps-CUENCcf1.png"
  },
  "/assets/screen-red-proteccion-DyNmjsQE.png": {
    "type": "image/png",
    "etag": '"15b7ff-gXnDwWr71ZJnLn/6G4OXsxXrzpo"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 1423359,
    "path": "../client/assets/screen-red-proteccion-DyNmjsQE.png"
  },
  "/assets/subscription-access-BHzMazQZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b4be-k95vdg7n9LoPcezEHAIQp1I4ZnY"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 46270,
    "path": "../client/assets/subscription-access-BHzMazQZ.js"
  },
  "/assets/switch-CN_NN7jx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c5f-7AjeWSKM5kuGXfDc7bS41CYuIlU"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 3167,
    "path": "../client/assets/switch-CN_NN7jx.js"
  },
  "/assets/subscription-cancellation-policy-rb7NljJ0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1ca-Fg92zATEIVr05dQXJrUOjbmriR8"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 458,
    "path": "../client/assets/subscription-cancellation-policy-rb7NljJ0.js"
  },
  "/assets/screen-modo-familiar-Di55MJBV.png": {
    "type": "image/png",
    "etag": '"1a03f5-SkF4IkNen/eUcikmsHCxYe0szzc"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 1704949,
    "path": "../client/assets/screen-modo-familiar-Di55MJBV.png"
  },
  "/assets/terminos-D4OscFnJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"eda-tXBzOd4SI6UUk9U3SfJfA+dMUsc"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 3802,
    "path": "../client/assets/terminos-D4OscFnJ.js"
  },
  "/assets/trash-2-CXZVlsWq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"154-i8eZN0j6zu2C4WS8BQDj3i0y4Qc"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 340,
    "path": "../client/assets/trash-2-CXZVlsWq.js"
  },
  "/assets/trust-stack-chileno-D0sJ_zBF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"611-78LUSDWppLkV+MDg/qkUp7TfXIk"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 1553,
    "path": "../client/assets/trust-stack-chileno-D0sJ_zBF.js"
  },
  "/assets/triangle-alert-7kEQJtIS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"115-Zp6BrRNAmipgJBPHnvVqkNXGf1o"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 277,
    "path": "../client/assets/triangle-alert-7kEQJtIS.js"
  },
  "/assets/tslib.es6-CmEaCU22.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"43a-E3Kfr2k4mlZ2+rfA/RFmdMbjgcQ"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 1082,
    "path": "../client/assets/tslib.es6-CmEaCU22.js"
  },
  "/assets/tutorial-BTTzSHIX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"251a-wtn0JE7FEzv5lj4Aj9siymE+ooQ"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 9498,
    "path": "../client/assets/tutorial-BTTzSHIX.js"
  },
  "/assets/twilio-D1eLZn0B.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"97-Qi/bdRdNGNhSfhCWZr74apLCm1M"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 151,
    "path": "../client/assets/twilio-D1eLZn0B.js"
  },
  "/assets/ubicacion-BElE007M.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7f9-Lt2R/SJxE2IKdeKvqb7AbWKZtqU"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 2041,
    "path": "../client/assets/ubicacion-BElE007M.js"
  },
  "/assets/useServerFn-6-HC_k4m.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"139-J7U+PgFCmkZOl+ZxrkFBo8FFVyA"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 313,
    "path": "../client/assets/useServerFn-6-HC_k4m.js"
  },
  "/assets/unsubscribe-DObenbtt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b60-1cU3wySTAGWn4tFkfoEs1VqWTo8"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 2912,
    "path": "../client/assets/unsubscribe-DObenbtt.js"
  },
  "/assets/users-H4enN6Pq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"13e-7Wyo5BAZxfKPtnXFEtePvo2oipk"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 318,
    "path": "../client/assets/users-H4enN6Pq.js"
  },
  "/assets/utils-DCADjnpI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6b9b-tSfrzcIHWeVNKawNWV0bEDmYWfc"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 27547,
    "path": "../client/assets/utils-DCADjnpI.js"
  },
  "/assets/web-B_T1894v.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c84-tNo8k7UTRn8YHdEwUSWaLnhftT4"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 3204,
    "path": "../client/assets/web-B_T1894v.js"
  },
  "/assets/web-BrMzIlzJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1104-/HyJ036GL1wOheBDmI9orR1T9gw"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 4356,
    "path": "../client/assets/web-BrMzIlzJ.js"
  },
  "/assets/web-CT8hSfKH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d14-Szfth6KcbU0ruyD19lQ8dXaxOV4"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 3348,
    "path": "../client/assets/web-CT8hSfKH.js"
  },
  "/assets/webpay.retorno-DqqbtrpZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"123c-nu/SVMRQI4ZJy+Cj09aq3awpurA"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 4668,
    "path": "../client/assets/webpay.retorno-DqqbtrpZ.js"
  },
  "/assets/webpay.functions-D8-UN1k5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"264-+o192XH11qLkv4wKxs9MDgxWTLI"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 612,
    "path": "../client/assets/webpay.functions-D8-UN1k5.js"
  },
  "/assets/whatsapp-activar-cta-D8NsU7W-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9c5-QNCYxuR1fk95dmmJcHiokyqcIKk"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 2501,
    "path": "../client/assets/whatsapp-activar-cta-D8NsU7W-.js"
  },
  "/assets/whatsapp-activation-button-DgVOvGBK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"55e-rC4dotTZ9a2u+0QJQU3hv7rPgGs"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 1374,
    "path": "../client/assets/whatsapp-activation-button-DgVOvGBK.js"
  },
  "/assets/whatsapp-activation-local-D2mE4nPe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"133-Rg9PStHn+kvJF4vNRnd9VKAXYSw"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 307,
    "path": "../client/assets/whatsapp-activation-local-D2mE4nPe.js"
  },
  "/assets/whatsapp-commercial-activation-Do0D-D3H.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ad-3ay1VUGmwwiJOeTlo7sSvqmpBwo"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 173,
    "path": "../client/assets/whatsapp-commercial-activation-Do0D-D3H.js"
  },
  "/assets/whatsapp-float-U6Yznl-M.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5ec-nylYchFWukBFroxF+roYohNkPfM"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 1516,
    "path": "../client/assets/whatsapp-float-U6Yznl-M.js"
  },
  "/assets/wifi-DSZI3dCr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"124-3kEtazwEh/VK0jd/B4HaJESebeo"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 292,
    "path": "../client/assets/wifi-DSZI3dCr.js"
  },
  "/assets/x-BGj4afSJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a6-7AF5gywtEJYQxt9qK7yHmNblnM0"',
    "mtime": "2026-11-02T02:00:27.818Z",
    "size": 166,
    "path": "../client/assets/x-BGj4afSJ.js"
  }
};
const publicAssetBases = {};
function isPublicAssetURL(id = "") {
  if (assets[id]) {
    return true;
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) {
      return true;
    }
  }
  return false;
}
const errorHandler$1 = (error, event) => {
  const res = defaultHandler(error, event);
  return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
  const unhandled = error.unhandled ?? !HTTPError.isError(error);
  const { status = 500, statusText = "" } = unhandled ? {} : error;
  if (status === 404) {
    const url = event.url || new URL(event.req.url);
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      return {
        status: 302,
        headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
      };
    }
  }
  const headers2 = new Headers(unhandled ? {} : error.headers);
  headers2.set("content-type", "application/json; charset=utf-8");
  const jsonBody = unhandled ? {
    status,
    unhandled: true
  } : typeof error.toJSON === "function" ? error.toJSON() : {
    status,
    statusText,
    message: error.message
  };
  return {
    status,
    statusText,
    headers: headers2,
    body: {
      error: true,
      ...jsonBody
    }
  };
}
const errorHandlers = [errorHandler$1];
async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      const response = await handler(error, event, { defaultHandler });
      if (response) {
        return response;
      }
    } catch (error2) {
      console.error(error2);
    }
  }
}
function cloudflareWaitUntilPlugin(nitroApp) {
  nitroApp.hooks.hook("request", (event) => {
    const req = event.node?.req;
    if (!req) return;
    if (typeof req.waitUntil === "function") return;
    const ctx = req.runtime?.cloudflare?.context;
    if (ctx && typeof ctx.waitUntil === "function") {
      req.waitUntil = ctx.waitUntil.bind(ctx);
    }
  });
}
const plugins = [
  cloudflareWaitUntilPlugin
];
const headers = ((m) => function headersRouteRule(event) {
  for (const [key, value] of Object.entries(m.options || {})) {
    event.res.headers.set(key, value);
  }
});
const findRouteRules = /* @__PURE__ */ (() => {
  const $0 = [{ name: "headers", route: "/assets/**", handler: headers, options: { "cache-control": "public, max-age=31536000, immutable" } }];
  return (m, p) => {
    let r = [];
    if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
    let s = p.split("/"), l = s.length;
    if (l > 1) {
      if (s[1] === "assets") {
        r.unshift({ data: $0, params: { "_": s.slice(2).join("/") } });
      }
    }
    return r;
  };
})();
const _lazy_e3ibdy = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
const findRoute = /* @__PURE__ */ (() => {
  const data = { route: "/**", handler: _lazy_e3ibdy };
  return ((_m, p) => {
    return { data, params: { "_": p.slice(1) } };
  });
})();
const APP_ID = "default";
function useNitroApp() {
  let instance = useNitroApp._instance;
  if (instance) {
    return instance;
  }
  instance = useNitroApp._instance = createNitroApp();
  globalThis.__nitro__ = globalThis.__nitro__ || {};
  globalThis.__nitro__[APP_ID] = instance;
  {
    initNitroPlugins(instance);
  }
  return instance;
}
function useNitroHooks() {
  const nitroApp = useNitroApp();
  const hooks = nitroApp.hooks;
  if (hooks) {
    return hooks;
  }
  return nitroApp.hooks = new HookableCore();
}
function createNitroApp() {
  const hooks = new HookableCore();
  const captureError = (error, errorCtx) => {
    const promise = hooks.callHook("error", error, errorCtx)?.catch?.((hookError) => {
      console.error("Error while capturing another error", hookError);
    });
    if (errorCtx?.event) {
      const errors = errorCtx.event.req.context?.nitro?.errors;
      if (errors) {
        errors.push({
          error,
          context: errorCtx
        });
      }
      if (promise && typeof errorCtx.event.req.waitUntil === "function") {
        errorCtx.event.req.waitUntil(promise);
      }
    }
  };
  const h3App = createH3App({ onError(error, event) {
    captureError(error, { event });
    return errorHandler(error, event);
  } });
  {
    h3App.config.onRequest = (event) => {
      return hooks.callHook("request", event)?.catch?.((error) => {
        captureError(error, {
          event,
          tags: ["request"]
        });
      });
    };
    h3App.config.onResponse = (res, event) => {
      return hooks.callHook("response", res, event)?.catch?.((error) => {
        captureError(error, {
          event,
          tags: ["response"]
        });
      });
    };
  }
  let appHandler = (req) => {
    req.context ||= {};
    req.context.nitro = req.context.nitro || { errors: [] };
    return h3App.fetch(req);
  };
  const app = {
    fetch: appHandler,
    h3: h3App,
    hooks,
    captureError
  };
  return app;
}
function initNitroPlugins(app) {
  for (const plugin of plugins) {
    try {
      plugin(app);
    } catch (error) {
      app.captureError?.(error, { tags: ["plugin"] });
      throw error;
    }
  }
  return app;
}
function createH3App(config) {
  const h3App = new H3Core(config);
  h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
  {
    h3App["~getMiddleware"] = (event, route) => {
      const pathname = event.url.pathname;
      const method = event.req.method;
      const middleware = [];
      {
        const routeRules = getRouteRules(method, pathname);
        event.context.routeRules = routeRules?.routeRules;
        if (routeRules?.routeRuleMiddleware.length) {
          middleware.push(...routeRules.routeRuleMiddleware);
        }
      }
      if (route?.data?.middleware?.length) {
        middleware.push(...route.data.middleware);
      }
      return middleware;
    };
  }
  return h3App;
}
function getRouteRules(method, pathname) {
  const m = findRouteRules(method, pathname);
  if (!m?.length) {
    return { routeRuleMiddleware: [] };
  }
  const routeRules = {};
  for (const layer of m) {
    for (const rule of layer.data) {
      const currentRule = routeRules[rule.name];
      if (currentRule) {
        if (rule.options === false) {
          delete routeRules[rule.name];
          continue;
        }
        if (typeof currentRule.options === "object" && typeof rule.options === "object") {
          currentRule.options = {
            ...currentRule.options,
            ...rule.options
          };
        } else {
          currentRule.options = rule.options;
        }
        currentRule.route = rule.route;
        currentRule.params = {
          ...currentRule.params,
          ...layer.params
        };
      } else if (rule.options !== false) {
        routeRules[rule.name] = {
          ...rule,
          params: layer.params
        };
      }
    }
  }
  const middleware = [];
  const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
  for (const rule of orderedRules) {
    if (rule.options === false || !rule.handler) {
      continue;
    }
    middleware.push(rule.handler(rule));
  }
  return {
    routeRules,
    routeRuleMiddleware: middleware
  };
}
function createHandler(hooks) {
  const nitroApp = useNitroApp();
  const nitroHooks = useNitroHooks();
  return {
    async fetch(request, env, context) {
      globalThis.__env__ = env;
      augmentReq(request, {
        env,
        context
      });
      const ctxExt = {};
      const url = new URL(request.url);
      if (hooks.fetch) {
        const res = await hooks.fetch(request, env, context, url, ctxExt);
        if (res) {
          return res;
        }
      }
      return await nitroApp.fetch(request);
    },
    scheduled(controller, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
        controller,
        env,
        context
      }) || Promise.resolve());
    },
    email(message, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:email", {
        message,
        event: message,
        env,
        context
      }) || Promise.resolve());
    },
    queue(batch, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
        batch,
        event: batch,
        env,
        context
      }) || Promise.resolve());
    },
    tail(traces, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
        traces,
        env,
        context
      }) || Promise.resolve());
    },
    trace(traces, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
        traces,
        env,
        context
      }) || Promise.resolve());
    }
  };
}
function augmentReq(cfReq, ctx) {
  const req = cfReq;
  req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
  req.runtime ??= { name: "cloudflare" };
  req.runtime.cloudflare = {
    ...req.runtime.cloudflare,
    ...ctx
  };
  req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
const cloudflareModule = createHandler({ fetch(cfRequest, env, context, url) {
  if (env.ASSETS && isPublicAssetURL(url.pathname)) {
    return env.ASSETS.fetch(cfRequest);
  }
} });
export {
  cloudflareModule as default
};
