# MCP Organizador GEMB

MCP local para consultar y operar datos basicos del Organizador GEMB desde Codex, Claude Desktop u otro cliente compatible con MCP.

## Seguridad

Este paquete usa Firebase Admin SDK y requiere credenciales locales. Nunca subas al repositorio:

- `.env` real
- `serviceAccount*.json`
- archivos `*firebase-adminsdk*.json`
- tokens, contrasenas o claves privadas

El repositorio es publico. Mantén las credenciales solo en tu maquina o en el gestor seguro de tu entorno.

## Instalacion

```bash
cd mcp/organizador-gemb
npm install
```

## Configuracion local

1. Copia el ejemplo:

```bash
cp .env.example .env
```

2. Usa una de estas opciones:

### Opcion A: archivo local de service account

Guarda tu archivo local, por ejemplo:

```text
mcp/organizador-gemb/serviceAccount.local.json
```

Configura:

```env
FIREBASE_PROJECT_ID=organizador-de-tareas-a9174
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.local.json
FIREBASE_SERVICE_ACCOUNT_JSON=
MCP_ALLOW_DELETE=false
```

### Opcion B: JSON en variable de entorno

Configura `FIREBASE_SERVICE_ACCOUNT_JSON` con el JSON completo del service account en tu entorno local. No lo pegues en el repositorio ni en chats.

```env
FIREBASE_PROJECT_ID=organizador-de-tareas-a9174
GOOGLE_APPLICATION_CREDENTIALS=
FIREBASE_SERVICE_ACCOUNT_JSON=
MCP_ALLOW_DELETE=false
```

## Ejecutar

```bash
npm run start
```

El servidor usa stdio, así que normalmente lo inicia tu cliente MCP.

## Configuracion de cliente MCP

Ejemplo para un cliente compatible con MCP:

```json
{
  "mcpServers": {
    "organizador-gemb": {
      "command": "node",
      "args": [
        "C:/Programas creados por mi/Organizador-de-Tareas/mcp/organizador-gemb/src/index.js"
      ],
      "env": {
        "FIREBASE_PROJECT_ID": "organizador-de-tareas-a9174",
        "GOOGLE_APPLICATION_CREDENTIALS": "C:/Programas creados por mi/Organizador-de-Tareas/mcp/organizador-gemb/serviceAccount.local.json",
        "MCP_ALLOW_DELETE": "false"
      }
    }
  }
}
```

Tambien puedes usar `FIREBASE_SERVICE_ACCOUNT_JSON` en `env` si tu cliente MCP gestiona secretos de forma segura.

## Herramientas expuestas

- `get_health`: verifica conexion con Firestore y devuelve `projectId`.
- `list_tasks`: lista tareas. Filtros: `status`, `priority`, `assignedToEmail`, `archived`, `limit`.
- `create_task`: crea una tarea global.
- `update_task`: edita una tarea existente.
- `change_task_status`: cambia estado a `pending`, `doing`, `done` o `later`.
- `archive_task`: marca `archived: true`.
- `delete_task`: elimina una tarea solo si `MCP_ALLOW_DELETE=true`.
- `list_members`: lista miembros registrados.

## Notas de datos

Las tareas se crean con un actor local:

```env
MCP_ACTOR_NAME=MCP Organizador GEMB
MCP_ACTOR_EMAIL=
```

Puedes cambiar esos valores localmente si quieres identificar mejor las acciones del MCP en la coleccion `activity`.
