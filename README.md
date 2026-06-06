# Organizador GEMB

Organizador de tareas minimalista para el equipo de Gimnasio Emocional Mentes Brillantes. Funciona como web/PWA y esta preparado para Android con Capacitor.

## Stack

- React + Vite
- Firebase Authentication con Google
- Cloud Firestore
- PWA con `vite-plugin-pwa`
- Capacitor Android

## Modelo de acceso

- Todos los usuarios que entran con Google se crean como miembros activos.
- Todos los miembros tienen los mismos permisos.
- No existe usuario administrador en la aplicacion.
- El campo `role` puede existir por compatibilidad con datos antiguos, pero no se usa para permisos.
- Un perfil antiguo con `role: "admin"` se trata igual que cualquier miembro.
- La vista `Equipo` solo muestra miembros registrados y actividad reciente, sin controles de rol o suspension.

## Variables de entorno

No subas `.env` ni valores reales de Firebase al repositorio. Configura estas variables en local y en Vercel:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Identidad visual por tema

Los assets de marca viven en `public/brand/`:

- `logo-light.png`
- `logo-dark.png`
- `logo-pink.png`
- `app-icon-light.png`
- `app-icon-dark.png`
- `app-icon-pink.png`

La app usa `BrandLogo` para seleccionar automaticamente el logo segun `document.documentElement.dataset.theme` y `localStorage`.

## Reglas Firestore

Pega el contenido de `firestore.rules` en Firebase Console > Firestore Database > Rules.

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function signedIn() {
      return request.auth != null;
    }

    function isMember() {
      return signedIn()
        && exists(/databases/$(database)/documents/members/$(request.auth.uid))
        && get(/databases/$(database)/documents/members/$(request.auth.uid)).data.active == true;
    }

    function memberIdentityIsValid(userId) {
      return request.auth.uid == userId
        && request.resource.data.uid == request.auth.uid
        && request.resource.data.email == request.auth.token.email
        && request.resource.data.active == true;
    }

    function memberCreateShapeIsSafe() {
      return request.resource.data.keys().hasOnly([
        'uid',
        'email',
        'displayName',
        'photoURL',
        'role',
        'active',
        'createdAt'
      ])
      && request.resource.data.keys().hasAll(['uid', 'email', 'active', 'createdAt'])
      && request.resource.data.get('role', 'member') == 'member'
      && request.resource.data.get('displayName', '') is string
      && request.resource.data.get('photoURL', '') is string
      && request.resource.data.createdAt == request.time;
    }

    function immutableMemberFieldsStayPut() {
      return request.resource.data.uid == resource.data.uid
        && request.resource.data.email == resource.data.email
        && request.resource.data.get('role', null) == resource.data.get('role', null)
        && request.resource.data.get('createdAt', null) == resource.data.get('createdAt', null);
    }

    function safeProfileFields() {
      return request.resource.data.get('displayName', '') is string
        && request.resource.data.get('photoURL', '') is string;
    }

    function safeProfileUpdate() {
      return isMember()
        && request.resource.data.active == resource.data.active
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly([
          'displayName',
          'photoURL',
          'updatedAt'
        ])
        && (!('updatedAt' in request.resource.data) || request.resource.data.updatedAt == request.time)
        && safeProfileFields();
    }

    function legacySelfActivation() {
      return signedIn()
        && resource.data.active != true
        && request.resource.data.active == true
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly([
          'active',
          'displayName',
          'photoURL',
          'updatedAt'
        ])
        && (!('updatedAt' in request.resource.data) || request.resource.data.updatedAt == request.time)
        && safeProfileFields();
    }

    match /members/{userId} {
      allow get: if signedIn() && request.auth.uid == userId;
      allow list: if isMember();

      allow create: if signedIn()
        && memberIdentityIsValid(userId)
        && memberCreateShapeIsSafe();

      allow update: if signedIn()
        && request.auth.uid == userId
        && immutableMemberFieldsStayPut()
        && (safeProfileUpdate() || legacySelfActivation());

      allow delete: if false;
    }

    match /tasks/{taskId} {
      allow read: if isMember();
      allow create: if isMember();
      allow update: if isMember();
      allow delete: if isMember();
    }

    match /activity/{activityId} {
      allow read: if isMember();
      allow create: if isMember();
      allow update, delete: if false;
    }
  }
}
```

La regla `legacySelfActivation()` solo permite que un usuario autenticado reactive su propio documento antiguo si estaba en `active: false`. No permite cambiar `uid`, `email`, `role` ni `createdAt`.

## Desarrollo local

```bash
npm install
npm run dev
```

## Build web

```bash
npm run build
```

## Android / Capacitor

La configuracion esperada en `capacitor.config.json` es:

```json
{
  "appId": "com.gemb.organizador",
  "appName": "Organizador GEMB",
  "webDir": "dist"
}
```

Despues de cada build web:

```bash
npx cap sync android
```

No subas `android/app/google-services.json` al repositorio. Si se necesita para compilar Android localmente, colocalo solo en esa ruta local.

## Despliegue

Vercel debe tener configuradas las variables de entorno anteriores en el dashboard del proyecto. Al hacer push a `main`, Vercel dispara el despliegue de produccion conectado al repositorio.

## MCP local

El MCP para operar datos basicos de Firestore esta en `mcp/organizador-gemb/`.

Instalacion:

```bash
cd mcp/organizador-gemb
npm install
```

Configuracion:

- Usa `GOOGLE_APPLICATION_CREDENTIALS` o `FIREBASE_SERVICE_ACCOUNT_JSON`.
- No subas `.env`, `serviceAccount*.json` ni `*firebase-adminsdk*.json`.
- `delete_task` queda deshabilitado por defecto con `MCP_ALLOW_DELETE=false`.

Consulta `mcp/organizador-gemb/README.md` para el ejemplo completo de cliente MCP.
