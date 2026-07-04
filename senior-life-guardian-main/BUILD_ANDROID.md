# 📱 Build automático del APK de Senior Safe

**Ya no necesitas Android Studio.** El APK se compila automáticamente en
GitHub Actions cada vez que haces cambios.

---

## Configuración inicial (una sola vez)

### 1. Conecta tu proyecto a GitHub
En Lovable: botón **(+) → GitHub → Connect project**.
Esto crea un repositorio con todo tu código (incluyendo `.github/workflows/android-apk.yml`).

### 2. Agrega los secrets en GitHub
Ve a tu repo en GitHub → **Settings → Secrets and variables → Actions → New repository secret**
y agrega estos 3 secrets (los valores están en tu archivo `.env`):

| Nombre | Valor |
|---|---|
| `VITE_SUPABASE_URL` | `https://mjdjfjxehnfroqyfzkyk.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | (copiar del `.env`) |
| `VITE_SUPABASE_PROJECT_ID` | `mjdjfjxehnfroqyfzkyk` |

> Twilio y Webpay viven en el backend (Lovable Cloud), **no** se incluyen en el APK.

---

## Cómo generar un APK nuevo

### Opción A — Automático
Cada vez que hagas cambios en Lovable → se sincronizan a GitHub → se dispara el
workflow → en ~8 minutos tienes el APK listo.

### Opción B — Manual
1. Ve a tu repo → pestaña **Actions** → workflow **Build Android APK**
2. Click **Run workflow** → selecciona la rama `main` → **Run workflow**
3. Espera ~8 minutos

---

## Descargar el APK

1. En la pestaña **Actions** abre la última ejecución del workflow
2. Baja hasta **Artifacts**
3. Descarga **SeniorSafe-APK** (un ZIP con el `.apk` dentro)
4. Instálalo en cualquier Android: ajustes → permitir instalación de orígenes desconocidos → abrir el APK

El artifact queda disponible por **90 días**.

---

## Publicar una versión oficial (Release)

Crea un tag con formato `vX.Y.Z` desde GitHub:

```bash
git tag v1.0.0
git push origin v1.0.0
```

El workflow generará un **Release** público en GitHub con el APK adjunto —
ideal para compartir el link de descarga con usuarios.

O bien: pestaña **Actions → Run workflow** y rellena el campo
*"Tag opcional para crear un Release"*.

---

## ¿Qué hace el workflow?

1. Instala Node, Bun, Java 17 y Android SDK en un servidor de GitHub
2. Instala dependencias del proyecto + Capacitor
3. Construye el bundle web (`bun run build`)
4. Genera la carpeta `android/` con `cap add android` (la primera vez)
5. Compila el APK con Gradle (`assembleDebug`)
6. Sube el APK como artifact y, si es un tag `v*`, crea un Release

Todo sin que tú toques Android Studio.

---

## Funcionalidades preservadas

✅ Web `alarmaseniorsafe.cl` intacta
✅ Supabase / Lovable Cloud
✅ Twilio (WhatsApp + SMS + llamadas)
✅ Webpay / pagos
✅ Onboarding, GPS, alertas reales
✅ Pantalla `/native` como app standalone

---

## APK firmado para Play Store

Para **Google Play** usa el workflow **Build Android AAB (Google Play)** — genera un `.aab` firmado listo para Prueba interna.

El workflow **Build Android APK** sigue generando APK debug para pruebas locales; **no** lo uses para Play si activaste protección de instalador.

---

## Google Play — AAB release (v1.0.0)

### Paso 1 — Crear keystore (una sola vez, en tu PC)

```powershell
cd senior-life-guardian-main
.\scripts\generate-play-keystore.ps1
```

Se crea `senior-safe-release.jks`. **Guárdalo en lugar seguro** (copia en USB cifrado). Si lo pierdes, no podrás actualizar la app en Play.

### Paso 2 — Secrets en GitHub

Repo → **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Valor |
|--------|--------|
| `VITE_SUPABASE_URL` | (igual que APK) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | (igual que APK) |
| `VITE_SUPABASE_PROJECT_ID` | (igual que APK) |
| `ANDROID_KEYSTORE_BASE64` | Base64 del `.jks` (ver abajo) |
| `ANDROID_KEYSTORE_PASSWORD` | Contraseña del keystore |
| `ANDROID_KEY_ALIAS` | `senior-safe` |
| `ANDROID_KEY_PASSWORD` | (opcional si es la misma que keystore) |

Base64 del keystore en PowerShell:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes(".\senior-safe-release.jks"))
```

Pega el resultado completo en `ANDROID_KEYSTORE_BASE64`.

### Paso 3 — Generar el AAB en GitHub

1. Repo → **Actions** → **Build Android AAB (Google Play)**
2. **Run workflow** → rama `main`
3. `version_name`: `1.0.0`
4. `version_code`: `1` (sube a `2`, `3`… en cada nueva subida a Play)
5. Espera ~10–15 minutos

### Paso 4 — Descargar y subir a Play Console

1. Abre la ejecución → **Artifacts** → descarga `SeniorSafe-AAB-v1.0.0`
2. Play Console → **Pruebas → Prueba interna → Crear versión**
3. Sube `SeniorSafe-release.aab`
4. Notas: texto v1.0.0 de lanzamiento
5. **Iniciar implementación**

### Paso 5 — Instalarte la app desde Play

Prueba interna → **Testers** → agrega tu Gmail → abre el enlace opt-in en el celular.

---

## Alternativa: tag de release

```bash
git tag v1.0.0+1
git push origin v1.0.0+1
```

El sufijo `+1` es el `versionCode` de Play. En la siguiente versión: `v1.0.1+2`, etc.

---

## Package name (Play Console)

```
cl.alarmaseniorsafe.app
```

Debe coincidir con `capacitor.config.ts` — **no se puede cambiar** después de crear la app en Play.
