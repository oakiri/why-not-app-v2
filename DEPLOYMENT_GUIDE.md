# Guía de Despliegue - WHY NOT Hamburguesería v2.0

Esta guía detalla los pasos necesarios para configurar y desplegar la aplicación en Android, iOS y Web.

## 1. Configuración de Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
2. Habilita los siguientes servicios:
   - **Authentication:** Email/Password y Google.
   - **Firestore Database:** Crea la base de datos en modo producción y aplica las reglas de `firestore.rules`.
   - **Storage:** Habilita el almacenamiento y aplica las reglas de `storage.rules`.
   - **Cloud Functions:** Necesario para la integración con TPV y notificaciones push.

## 2. Variables de Entorno

Copia el archivo `.env.example` a `.env` y rellena los valores con tus credenciales de Firebase y APIs externas:

```bash
cp .env.example .env
```

## 3. Integración TPV

Para conectar con tu software de gestión (Revo, Lightspeed, etc.):

1. Ve a la sección de configuración en el panel de administración de la app.
2. Selecciona tu proveedor de TPV.
3. Introduce las credenciales (API Key, Client Secret).
4. Configura el Webhook en el panel del TPV apuntando a tu Cloud Function de Firebase.

## 4. Despliegue

### Web
```bash
npm run build
firebase deploy --only hosting
```

### Android
```bash
npx expo run:android --variant release
```

### iOS
```bash
npx expo run:ios --configuration Release
```

## 5. Estructura de Datos Inicial

Es recomendable ejecutar el script de semillas para cargar las categorías y productos iniciales:

```bash
npm run seed
```

---
Desarrollado por Manus para WHY NOT Hamburguesería.
