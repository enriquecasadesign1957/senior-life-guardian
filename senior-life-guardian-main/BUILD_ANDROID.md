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

## APK firmado para Play Store (opcional)

El workflow actual genera un APK **debug** (firmado con la clave debug de Android),
suficiente para instalación directa. Para subir a Google Play necesitas un AAB
firmado con tu propia clave: avísame y agrego el job correspondiente con
`assembleRelease` + secrets del keystore.
