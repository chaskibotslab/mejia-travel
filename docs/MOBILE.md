# 📱 Mejía Travel — Apps Nativas (Android + iOS)

Esta guía explica cómo generar los APK / IPA usando **Capacitor 6**.

## 🎯 Estrategia

La app es **Next.js full-stack** (SSR + APIs + Supabase). Empaquetar todo
estáticamente perdería las rutas `/api`, autenticación con cookies, etc.

➡ **Solución:** las apps móviles son un *contenedor nativo* (WebView) que carga
la URL pública de Railway. Cuando publicas un nuevo build a Railway, **las apps
ya instaladas reciben el cambio al instante** (no hay que volver a publicarlas).

Aún así puedes usar **plugins nativos** de Capacitor (cámara, GPS, push, etc.).

---

## 🔧 Requisitos por plataforma

| Plataforma | Necesitas |
|---|---|
| **Android** | Android Studio (incluye SDK + Java 17) |
| **iOS**     | macOS + Xcode 15 + CocoaPods (`sudo gem install cocoapods`) |

> 💡 Sin Mac → no puedes compilar iOS localmente. Alternativa: usar **Ionic Appflow**, **Codemagic** o **GitHub Actions con runner macOS**.

---

## 🚀 Pasos (primera vez)

```powershell
# 1. Instala dependencias (incluye Capacitor)
npm install

# 2. Genera los iconos PNG y splash
npm run icons

# 3. Inicializa Capacitor (sólo la primera vez)
#    Ya hay un capacitor.config.ts pre-configurado
npx cap init "Mejía Travel" com.chaskibots.mejiatravel --web-dir=public

# 4. Añade las plataformas nativas
npm run cap:add:android
npm run cap:add:ios          # solo en macOS

# 5. Sincroniza assets + plugins
npm run cap:sync
```

---

## 🎨 Iconos y splash screens nativos

```powershell
# Coloca tu icono base en assets/icon.png (1024×1024)
# y un splash en assets/splash.png (2732×2732)
mkdir assets
# … copia los PNG …

npm run cap:assets
npm run cap:sync
```

---

## ▶️ Compilar y abrir

```powershell
npm run cap:open:android   # abre Android Studio → Run ▶
npm run cap:open:ios       # abre Xcode (solo macOS)
```

Para generar APK firmado de release:

1. En Android Studio: **Build → Generate Signed Bundle / APK**.
2. Crea un keystore (guárdalo seguro — sin él no podrás actualizar la app).
3. Sube el `.aab` a **Google Play Console**.

Para iOS: Xcode → **Product → Archive → Distribute App → App Store Connect**.

---

## 🔄 Ciclo de actualización

| Cambio | ¿Hay que recompilar la app? |
|---|---|
| Texto, datos, estilos, imágenes, lógica web | ❌ No — sólo deploy a Railway |
| Plugin nativo nuevo o cambio en `capacitor.config.ts` | ✅ Sí — `cap sync` y rebuild |
| Cambio de icono / splash | ✅ Sí — rebuild |

---

## 🌐 Cambiar la URL del servidor

Edita `capacitor.config.ts`:

```ts
server: {
  url: 'https://mejia.chaskibots.com', // tu dominio personalizado
  androidScheme: 'https',
}
```

Después: `npm run cap:sync` y recompila.

---

## 🐛 Troubleshooting

- **Pantalla blanca al abrir**: verifica que la URL en `capacitor.config.ts`
  responde 200 desde el celular (mismo wifi no es suficiente, debe ser pública).
- **iOS no acepta la URL**: añade el dominio a `NSAppTransportSecurity` en
  `ios/App/App/Info.plist` o asegúrate de usar HTTPS.
- **Android cierra al abrir**: revisa `adb logcat` para ver el error real.
