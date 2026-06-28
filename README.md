# Router Island

App de iPhone (Expo / React Native) que muestra tus **créditos restantes de OpenRouter**
de forma simple y bonita, con foco en la **Dynamic Island** vía Live Activities y un
**App Intent para Siri/Atajos** ("Display OpenRouter credits left").

Todo cliente: pegas tu API key la primera vez y se guarda solo en tu dispositivo.

---

## Viabilidad (resumen)

| Aspecto | Estado |
| --- | --- |
| Leer el saldo de OpenRouter (todo cliente) | ✅ Una petición HTTPS con tu API key |
| Mostrarlo en la Dynamic Island | ✅ Live Activity (ActivityKit) en iPhone 14 Pro+ |
| Invocarlo desde Siri / Atajos sin abrir la app | ✅ App Intent `LiveActivityStartingIntent` (iOS 18+) |
| Compilar **sin Mac** | ✅ EAS Build (workers macOS en la nube) |
| Instalar en tu iPhone físico | ⚠️ Requiere **Apple Developer Program (99 $/año)** |

Limitación clave: una Live Activity **no es permanente**. Vive en la Dynamic Island
mientras está activa (hasta ~8 h) y luego el sistema la cierra. El modelo de uso es:
lanzas el Atajo → aparece el saldo → al cabo de unas horas desaparece. Por eso el Atajo
de Siri es la pieza central: lo invocas cuando quieres ver el dato.

## Cómo lee el saldo (OpenRouter)

Dos endpoints, ambos con `Authorization: Bearer <API_KEY>` (ver `src/openrouter.ts`):

- `GET /api/v1/credits` → `total_credits` − `total_usage` = saldo real de la cuenta.
  Puede requerir una **provisioning key**.
- `GET /api/v1/auth/key` → `usage` / `limit`; funciona con una key normal. Da saldo
  restante solo si la key tiene un límite de gasto configurado.

La app intenta `/credits` y, ante un 401/403, cae a `/auth/key`.

## Arquitectura

```
App RN (JS/TS)                     iOS nativo (Swift)
─────────────                      ──────────────────
ApiKeyForm / BalanceScreen         targets/widget/ (extensión de widget)
  └ guarda key en Keychain           ├ RouterIslandAttributes.swift  (contrato de datos)
    (expo-secure-store)              ├ RouterIslandLiveActivity.swift (UI SwiftUI + Dynamic Island)
  └ espeja key + último saldo        ├ RouterIslandWidgetBundle.swift (@main)
    al App Group  ───────────┐       ├ CreditsService.swift           (fetch + control de la Activity)
                             │       └ DisplayCreditsIntent.swift      (App Intent + Atajo de Siri)
modules/shared-defaults/  ◄──┘
  (módulo Expo nativo: lee/escribe App Group UserDefaults)
```

El App Group `group.com.aitorru.routerisland` es el canal compartido: la app RN escribe
la API key ahí, y el App Intent (en Swift, en segundo plano) la lee, hace el fetch a
OpenRouter y arranca la Live Activity — sin abrir la app.

> **Nota de seguridad:** la copia en el App Group no está cifrada como el Keychain.
> Para un único usuario con su propia key es un compromiso aceptable; para endurecerlo,
> migra a un *Keychain Access Group* compartido (requiere un ajuste nativo).

## Requisitos previos

- Node 22, una cuenta de [Expo (EAS)](https://expo.dev) (gratis).
- Para instalar en el iPhone: **Apple Developer Program** y tu **Apple Team ID**.

## Puesta en marcha

```bash
npm install

# 1) Probar la lógica (key + saldo) al instante, sin build nativo:
npm run start            # ábrelo en Expo Go / web (la Live Activity NO aparece aquí)

# 2) Generar el proyecto nativo (valida el widget + entitlements):
npm run prebuild
```

Antes de compilar para iOS, **añade tu Apple Team ID** en `app.json`:

```jsonc
"ios": {
  "appleTeamId": "TU_TEAM_ID",   // <-- lo encuentras en developer.apple.com
  ...
}
```

### Build sin Mac (EAS)

```bash
npm i -g eas-cli
eas login
eas build --platform ios --profile development   # dev client con la Live Activity
# o:  --profile preview     (distribución interna)
```

EAS compila en la nube (no necesitas Mac). Instala el resultado vía el enlace/QR de EAS.

### Activar el Atajo de Siri

1. Abre la app una vez y guarda tu API key (así queda en el App Group).
2. App **Atajos** → busca la acción **"Display OpenRouter credits left"** (o di
   *"Oye Siri, display Router Island credits left"*).
3. Al ejecutarlo, el saldo aparece en la Dynamic Island sin abrir la app.

## Loop de CI (GitHub Actions)

`.github/workflows/ci.yml` corre en cada push:

- `tsc` (typecheck) + `eslint`
- `expo prebuild -p ios` → valida que los config plugins y el target del widget
  generan un proyecto Xcode correcto (sin compilar Swift; corre en Linux).

Hay además un job **`eas-build`** que solo se activa en `main`/manual y **si existe el
secret `EXPO_TOKEN`** (créalo en *Settings → Secrets*). Así el binario iOS se construye
en la nube. La compilación de Swift (App Intent, ActivityKit) se valida en ese build.

## Estado / pendientes

- [x] App RN: onboarding de key, fetch de saldo, UI, refresh (verificado: tsc + eslint).
- [x] Target de Live Activity (SwiftUI + Dynamic Island) y App Intent de Siri.
- [x] App Group + entitlements + `NSSupportsLiveActivities` (verificado en `expo prebuild`).
- [x] CI: typecheck, lint, prebuild; job EAS opcional.
- [ ] **Pendiente de compilar en EAS** para validar el Swift end-to-end.
- [ ] Botón "Mostrar ahora" desde la app (requiere exponer ActivityKit como módulo).
- [ ] Refresco en segundo plano (BGTaskScheduler) — best-effort, sin garantías.
- [ ] Endurecer almacenamiento de la key (Keychain Access Group compartido).
