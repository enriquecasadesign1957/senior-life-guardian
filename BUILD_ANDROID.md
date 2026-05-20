# 📱 Compilar APK Android — Senior Safe (app limpia)

La app Android es un binario **independiente** de la web `alarmaseniorsafe.cl`.
Carga su propio bundle (`dist/`) y abre **directamente la pantalla `/native`**:
solo botón de emergencia, "Estoy bien", estado de protección y guardianes
conectados — sin onboarding, sin Chrome, sin barra de URL.

La web sigue siendo registro, onboarding, pagos y configuración.
La app sólo pide el correo registrado la primera vez para vincular la cuenta.

## Requisitos previos (una sola vez)

1. **Node.js 20+** y **bun** o **npm**.
2. **Android Studio** (incluye Android SDK + Gradle): https://developer.android.com/studio
3. **Java JDK 17**.

---

## Pasos

### 1. Clonar el repo desde GitHub
En Lovable: botón **GitHub → Connect**, luego clona en tu máquina:
```bash
git clone <tu-repo>.git
cd <tu-repo>
bun install
```

### 2. Instalar Capacitor
```bash
bun add @capacitor/core @capacitor/cli @capacitor/android @capacitor/splash-screen @capacitor/local-notifications @capacitor/geolocation
```

### 3. Inicializar plataforma Android
```bash
bunx cap add android
bun run build
bunx cap sync android
```

### 4. Abrir en Android Studio
```bash
bunx cap open android
```

### 5. Generar APK
Dentro de Android Studio:
- Menú **Build → Build Bundle(s) / APK(s) → Build APK(s)**
- Espera a que termine. APK queda en:
  `android/app/build/outputs/apk/debug/app-debug.apk`
- Renómbralo a `SeniorLifeGuardian.apk` y súbelo donde lo descarguen los usuarios (Lovable Cloud Storage, S3, o link directo).

### 6. APK firmado para Play Store
- Menú **Build → Generate Signed Bundle / APK**
- Elige **Android App Bundle (.aab)** para subir a Google Play Console.

---

## Cómo conectar el botón "📲 Instalar Senior Safe"

Una vez tengas el APK público:
1. Sube `SeniorLifeGuardian.apk` a una URL pública.
2. En `src/components/install-app-modal.tsx`, busca la constante `APK_URL` y reemplázala con tu URL.
3. El botón descargará el APK real en lugar de instalar PWA.

---

## Funcionalidades preservadas
- ✅ Onboarding (carga desde la web)
- ✅ Supabase / RLS
- ✅ Webpay / pagos
- ✅ WhatsApp activación
- ✅ Alertas emergencia
- ✅ Dashboard / trial
- ✅ GPS (plugin `@capacitor/geolocation`)
- ✅ Notificaciones (plugin `@capacitor/local-notifications`)
- ✅ Splash screen + icono
- ✅ Modo standalone (sin Chrome visible)

---

## Permisos Android (auto-configurados por Capacitor)
Edita `android/app/src/main/AndroidManifest.xml` y añade:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />
```

---

## Icono y splash
Coloca un PNG 1024×1024 en `resources/icon.png` y otro en `resources/splash.png`, luego:
```bash
bunx @capacitor/assets generate --android
```
