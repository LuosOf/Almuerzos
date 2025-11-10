# Generar APK instalable (sideload) usando Capacitor

Este documento explica cómo convertir la web en un APK que puedas instalar directamente en Android (sin pasar por Google Play) usando Capacitor.

Resumen:
- Capacitor empaqueta tu app web dentro de un proyecto Android nativo.
- Necesitas Android Studio y Java JDK en tu máquina para compilar el APK.
- Aquí te doy comandos para PowerShell en Windows.

Requisitos previos
1. Tener Node.js y npm instalados.
2. Tener Java JDK 11+ y Android Studio (con Android SDK) instalados.
3. Tener `adb` en PATH si quieres instalar el APK con cable.

Paso 1 — Preparar el repo
Abre PowerShell en la carpeta del proyecto (`c:\Users\Luis\Desktop\a\Alm`) y ejecuta:

```powershell
# instalar Capacitor CLI (esto descargará paquetes; requiere internet)
npm install

# (opcional) si no quieres instalar dependencias en el repo, puedes usar npx en cada comando
```

Paso 2 — Inicializar Android (solo la primera vez)

```powershell
npx cap add android
```

Paso 3 — Copiar los archivos web al proyecto Android

```powershell
# copia los archivos estáticos al proyecto Android
npx cap copy android
```

Paso 4 — Abrir Android Studio

```powershell
npx cap open android
```

Android Studio se abrirá con el proyecto. Desde ahí puedes:
- Seleccionar un emulador o dispositivo físico conectado.
- Build -> Build Bundle(s) / APK(s) -> Build APK(s).

Paso 5 — Generar APK de debug y probar (sin firmar)

En Android Studio, el build de debug genera un APK listo para instalar en tu dispositivo (debug). Alternativamente, puedes ejecutar desde la línea:

```powershell
# Dentro de la carpeta android/ (generada por Capacitor)
cd android
.\gradlew assembleDebug
# APK resultante en: android/app/build/outputs/apk/debug/app-debug.apk
```

Instalar en dispositivo conectado (con USB debugging activo):

```powershell
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
```

Paso 6 — Generar APK de release y firmar (para distribuir fuera de Play)

Sigue la guía de Android Studio para generar una release signed APK o usa gradle:

```powershell
cd android
.\gradlew bundleRelease    # genera AAB
.\gradlew assembleRelease  # genera APK
# Los artefactos estarán en android/app/build/outputs/
```

Firma con jarsigner / apksigner (Android SDK build-tools incluye apksigner). Reemplaza las rutas y alias por las tuyas:

```powershell
# ejemplo usando apksigner (recomendado)
$KEYSTORE = 'C:\ruta\mi-keystore.jks'
$KEY_ALIAS = 'mi_alias'
$APK_PATH = 'android\app\build\outputs\apk\release\app-release-unsigned.apk'
# firma (asegúrate de tener apksigner en PATH)
apksigner sign --ks $KEYSTORE --ks-key-alias $KEY_ALIAS $APK_PATH
```

Paso 7 — Instalar el APK firmado en el móvil

```powershell
adb install -r path\to\app-release.apk
```

Iconos / recursos
- Para que el APK muestre icono correcto, reemplaza los iconos nativos en `android/app/src/main/res/mipmap-*/` con PNGs (192x192, 512x512, etc).
- Puedes generar PNG desde los SVG con ImageMagick:

```powershell
magick convert icons/icon-512.svg -resize 512x512 icons/icon-512.png
magick convert icons/icon-192.svg -resize 192x192 icons/icon-192.png
```

Notas finales
- El APK generado se puede distribuir directamente (por ejemplo, subir a tu servidor e instalar por link o enviar por USB) y no requiere Play Store.
- Si quieres agregar funcionalidades nativas (notificaciones, cámara), usa plugins Capacitor.

Si quieres, genero:
- Los PNGs de iconos aquí y actualizo el repo, o
- Un archivo `README_TWA.md` con el flujo de Bubblewrap (TWA) en caso de que prefieras esa opción.

Dime si quieres que proceda a generar los PNGs y actualizar el `manifest.json` para usar PNG (recomendado antes de crear el APK).