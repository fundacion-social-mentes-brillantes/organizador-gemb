# Organizador de Tareas GEMB (Web + Android PWA/Capacitor)

Este es un organizador de tareas minimalista, elegante y rápido diseñado para el equipo de **Gimnasio Emocional Mentes Brillantes**. Reemplaza el uso de Notion con un tablero compartido global donde todo el equipo visualiza y edita las tareas en tiempo real. 

El proyecto está construido con **React (Vite)**, **Cloud Firestore** y **Firebase Authentication**, y está preparado tanto para usarse como **aplicación Web/PWA** como para compilarse en una **App Android nativa** mediante **Capacitor**.

---

## 🚀 Requisitos Previos

Asegúrate de tener instalado en tu computadora:
- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- [Android Studio](https://developer.android.com/studio) (requerido únicamente para compilar la aplicación Android)

---

## 📦 1. Instalación de Dependencias

Para instalar todas las librerías necesarias del proyecto, abre la terminal en la raíz del proyecto y ejecuta:

```bash
npm install
```

---

## ⚙️ 2. Configuración en la Consola de Firebase

### A. Crear/Seleccionar el Proyecto Firebase
El proyecto Firebase ya está registrado:
- **Project ID**: `organizador-de-tareas-a9174`
- **Project Number**: `1096261404550`

### B. Registrar Aplicaciones en Firebase
Debes registrar dos aplicaciones en la consola de tu proyecto Firebase:

1. **App Web**:
   - Ve a *Configuración del Proyecto* > *General* y haz clic en **Añadir aplicación** (ícono `</>`).
   - Nómbrala `Organizador GEMB Web`.
   - Copia las credenciales generadas para agregarlas a tu archivo de variables de entorno `.env` (ver sección siguiente).

2. **App Android**:
   - Haz clic en **Añadir aplicación** (ícono de Android).
   - Registra el nombre de paquete: **`com.gemb.organizador`** (este es el paquete configurado en Capacitor).
   - Nómbrala `Organizador GEMB Android`.
   - Genera y descarga el archivo **`google-services.json`** y colócalo en la carpeta del proyecto en la ruta:
     `android/app/google-services.json`
   - *Nota*: Deja la aplicación Android antigua (`com.aistudio.organizadortareas.axtrc`) sin borrar por si se necesita en el futuro.

### C. Activar Google Authentication
1. En el menú de Firebase, ve a **Build** > **Authentication** > **Sign-in method**.
2. Haz clic en **Añadir nuevo proveedor** y selecciona **Google**.
3. Actívalo, ingresa el correo de soporte y guarda los cambios.
4. **Para Android (Capacitor)**:
   - Ve a la sección de configuración de Google Provider.
   - Copia el **ID de cliente web (Client ID)** (usualmente termina en `.apps.googleusercontent.com`).
   - Reemplaza este Client ID en el archivo `capacitor.config.json` en la sección `GoogleAuth.serverClientId` si decides implementar el plugin de Google Auth nativo.

### D. Configurar Huellas SHA-1 / SHA-256 para Android
Para que el inicio de sesión con Google funcione correctamente dentro de la App Android:
1. Genera las firmas SHA-1 y SHA-256 de tu llave de firmas en Android Studio (o mediante la terminal usando `keytool`).
2. Copia estas firmas.
3. En la consola de Firebase, ve a **Configuración del proyecto** > **Tus aplicaciones** > Selecciona tu aplicación Android (`com.gemb.organizador`) > Haz clic en **Añadir huella digital** y pega los valores SHA-1 y SHA-256.

### E. Dominios Autorizados (para Login Web)
En **Authentication** > **Ajustes** > **Dominios autorizados**, asegúrate de añadir:
- `localhost` (para desarrollo local)
- El dominio de producción en donde despliegues tu aplicación web (ej. `organizador-gemb.vercel.app`).

---

## 🔑 3. Configuración de Variables de Entorno

Crea un archivo llamado `.env` en la raíz del proyecto. Puedes tomar como base el archivo `.env.example` y rellenarlo con las credenciales de tu **App Web de Firebase**:

```env
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=organizador-de-tareas-a9174.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=organizador-de-tareas-a9174
VITE_FIREBASE_STORAGE_BUCKET=organizador-de-tareas-a9174.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1096261404550
VITE_FIREBASE_APP_ID=tu_app_id_aqui
```

---

## 🔒 4. Publicar Reglas de Seguridad en Cloud Firestore

Las reglas del archivo `firestore.rules` del proyecto deben pegarse en la pestaña **Rules** de la sección Firestore en la consola de Firebase:

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

    function isAdmin() {
      return isMember()
        && get(/databases/$(database)/documents/members/$(request.auth.uid)).data.role == "admin";
    }

    match /members/{userId} {
      allow read: if isMember();
      allow create: if signedIn() && request.auth.token.email == "fundacionsocial@gimnasioemocionalmb.com";
      allow update, delete: if isAdmin();
    }

    match /tasks/{taskId} {
      allow read: if isMember();
      allow create: if isMember();
      allow update: if isMember();
      allow delete: if isAdmin();
    }

    match /activity/{activityId} {
      allow read: if isMember();
      allow create: if isMember();
      allow update, delete: if false;
    }
  }
}
```

---

## 💻 5. Ejecución Local (Web)

Para iniciar el servidor de desarrollo local para la versión web, ejecuta:

```bash
npm run dev
```

Esto abrirá la aplicación en `http://localhost:5173`. 
- *Autenticación Automática del Administrador*: Para habilitar el primer ingreso al panel, inicia sesión con el correo **`fundacionsocial@gimnasioemocionalmb.com`**. El sistema lo reconocerá automáticamente y registrará este correo como Administrador (`admin` activo) para que puedas aprobar a otros miembros que intenten entrar.

---

## 📱 6. Instalación como PWA (Progressive Web App)

La aplicación está completamente configurada como una PWA gracias a `vite-plugin-pwa`. Cuando se compila y se despliega en HTTPS:
- En celulares (Chrome/Safari) o PC (Chrome/Edge), aparecerá el botón **"Instalar aplicación"** o **"Añadir a la pantalla de inicio"**.
- La aplicación se abrirá en pantalla completa sin barra de navegación del navegador (modo standalone).
- Guarda en caché los elementos principales permitiendo una carga instantánea y la visualización de la interfaz básica.

---

## 🌐 7. Despliegue Web (Vercel / Firebase Hosting)

### Despliegue en Vercel (Recomendado por su rapidez)
1. Instala el CLI de Vercel (`npm i -g vercel`) o vincula tu cuenta en la web de Vercel.
2. Ejecuta `vercel` en la terminal de la raíz del proyecto.
3. Configura el directorio del build como `dist`.
4. Agrega las mismas variables de entorno del `.env` en la configuración del proyecto en el dashboard de Vercel.
5. Ejecuta `vercel --prod` para publicar la versión definitiva.

---

## 🤖 8. Compilación y Generación de la App Android (Capacitor)

El flujo para actualizar y empaquetar la aplicación en Android consta de los siguientes pasos:

### Paso A: Compilar el código React/Web
Genera la carpeta `dist` con los recursos optimizados:
```bash
npm run build
```

### Paso B: Sincronizar recursos con Android
Sincroniza los cambios compilados de la carpeta `dist` en el proyecto Android nativo:
```bash
npx cap sync android
```

### Paso C: Abrir el proyecto en Android Studio
Para abrir Android Studio directamente con el proyecto nativo listo, ejecuta:
```bash
npx cap open android
```

### Paso D: Generar el APK o AAB en Android Studio
Una vez que Android Studio abra el proyecto:
1. Asegúrate de colocar el archivo `google-services.json` descargado de Firebase en la ruta `android/app/google-services.json` (puedes copiarlo directamente desde la vista del proyecto).
2. Espera a que Gradle termine de indexar el proyecto.
3. En la barra superior, selecciona **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)** para generar un archivo instalable en pruebas.
4. Para publicar en Play Store, selecciona **Build** > **Generate Signed Bundle / APK...**, selecciona **Android App Bundle** y fírmalo con tu llave de producción.
