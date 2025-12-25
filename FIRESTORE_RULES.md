# Reglas de Seguridad de Firestore

Este documento contiene diferentes niveles de reglas de seguridad para Firestore, desde las más permisivas hasta las más estrictas.

## 🔓 Nivel 1: Desarrollo (Permisivo)

**⚠️ Solo para desarrollo. NO usar en producción.**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sorteos/{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 🔒 Nivel 2: Autenticación Anónima (Recomendado)

**Permite lectura pública pero requiere autenticación para escritura.**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sorteos/{document=**} {
      // Cualquiera puede leer
      allow read: if true;
      
      // Solo usuarios autenticados pueden escribir
      allow create: if request.auth != null;
      allow update, delete: if false; // No permitir actualizaciones ni eliminaciones
    }
  }
}
```

## 🔐 Nivel 3: Validación de Datos

**Requiere autenticación y valida la estructura de los datos.**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sorteos/{document=**} {
      // Cualquiera puede leer
      allow read: if true;
      
      // Solo usuarios autenticados pueden crear
      allow create: if request.auth != null
        // Validar estructura de datos
        && request.resource.data.keys().hasAll(['winners', 'alternates', 'totalParticipants', 'createdAt'])
        && request.resource.data.winners is list
        && request.resource.data.winners.size() == 4
        && request.resource.data.alternates is list
        && request.resource.data.alternates.size() == 12
        && request.resource.data.totalParticipants is int
        && request.resource.data.totalParticipants > 0
        // Validar estructura de ganadores
        && request.resource.data.winners[0].keys().hasAll(['username', 'code'])
        // Validar estructura de suplentes
        && request.resource.data.alternates[0].keys().hasAll(['username', 'code'])
        // No permitir campos adicionales
        && request.resource.data.keys().hasOnly(['winners', 'alternates', 'totalParticipants', 'createdAt']);
      
      // No permitir actualizaciones ni eliminaciones
      allow update, delete: if false;
    }
  }
}
```

## 🛡️ Nivel 4: Máxima Seguridad

**Incluye límites de tiempo y validaciones estrictas.**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sorteos/{document=**} {
      // Cualquiera puede leer
      allow read: if true;
      
      // Solo usuarios autenticados pueden crear
      allow create: if request.auth != null
        // Validar estructura de datos
        && request.resource.data.keys().hasAll(['winners', 'alternates', 'totalParticipants', 'createdAt'])
        && request.resource.data.winners is list
        && request.resource.data.winners.size() == 4
        && request.resource.data.alternates is list
        && request.resource.data.alternates.size() == 12
        && request.resource.data.totalParticipants is int
        && request.resource.data.totalParticipants > 0
        && request.resource.data.totalParticipants <= 100000 // Límite razonable
        // Validar estructura de ganadores
        && request.resource.data.winners[0].keys().hasAll(['username', 'code'])
        && request.resource.data.winners[0].username is string
        && request.resource.data.winners[0].username.size() > 0
        && request.resource.data.winners[0].username.size() <= 100
        && request.resource.data.winners[0].code is string
        && request.resource.data.winners[0].code.size() > 0
        && request.resource.data.winners[0].code.size() <= 50
        // Validar estructura de suplentes
        && request.resource.data.alternates[0].keys().hasAll(['username', 'code'])
        && request.resource.data.alternates[0].username is string
        && request.resource.data.alternates[0].username.size() > 0
        && request.resource.data.alternates[0].username.size() <= 100
        && request.resource.data.alternates[0].code is string
        && request.resource.data.alternates[0].code.size() > 0
        && request.resource.data.alternates[0].code.size() <= 50
        // No permitir campos adicionales
        && request.resource.data.keys().hasOnly(['winners', 'alternates', 'totalParticipants', 'createdAt'])
        // Verificar que createdAt sea un timestamp del servidor
        && request.resource.data.createdAt == request.time;
      
      // No permitir actualizaciones ni eliminaciones
      allow update, delete: if false;
    }
  }
}
```

## 📝 Cómo Aplicar las Reglas

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `sorteo-palms-ganadores`
3. Ve a **Firestore Database** > **Reglas**
4. Copia y pega las reglas que desees usar
5. Haz clic en **Publicar**

## 🔧 Habilitar Autenticación Anónima

Para usar las reglas de Nivel 2 en adelante, necesitas habilitar la autenticación anónima:

1. Ve a **Authentication** > **Sign-in method**
2. Habilita **Anonymous**
3. Haz clic en **Guardar**

El código ya está configurado para autenticarse automáticamente de forma anónima cuando se intenta guardar un sorteo.

## ⚠️ Notas Importantes

- **Nivel 1**: Solo para desarrollo. Permite que cualquiera escriba datos.
- **Nivel 2**: Requiere autenticación pero permite lectura pública.
- **Nivel 3**: Valida la estructura de datos además de requerir autenticación.
- **Nivel 4**: Máxima seguridad con validaciones estrictas y límites.

Para producción, se recomienda usar al menos el **Nivel 2**.

