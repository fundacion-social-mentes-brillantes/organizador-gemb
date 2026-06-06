import 'dotenv/config';
import admin from 'firebase-admin';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const VALID_STATUSES = ['pending', 'doing', 'done', 'later'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];
const ACTOR = {
  uid: 'mcp-local',
  name: process.env.MCP_ACTOR_NAME || 'MCP Organizador GEMB',
  email: process.env.MCP_ACTOR_EMAIL || ''
};

function parseBool(value, defaultValue = false) {
  if (value === undefined || value === '') return defaultValue;
  return String(value).toLowerCase() === 'true';
}

function getCredentialConfig() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (rawServiceAccount) {
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(rawServiceAccount);
    } catch (error) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON must be valid JSON.', { cause: error });
    }

    return {
      projectId: projectId || serviceAccount.project_id,
      credential: admin.credential.cert(serviceAccount),
      source: 'FIREBASE_SERVICE_ACCOUNT_JSON'
    };
  }

  if (credentialsPath) {
    return {
      projectId,
      credential: admin.credential.applicationDefault(),
      source: 'GOOGLE_APPLICATION_CREDENTIALS'
    };
  }

  throw new Error('Missing local Firebase credentials. Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_JSON.');
}

function initializeFirebase() {
  if (admin.apps.length) return admin.app();

  const config = getCredentialConfig();
  admin.initializeApp({
    credential: config.credential,
    projectId: config.projectId
  });

  return admin.app();
}

let app;
let db;
let deleteEnabled;

try {
  app = initializeFirebase();
  db = admin.firestore();
  deleteEnabled = parseBool(process.env.MCP_ALLOW_DELETE, false);
} catch (error) {
  console.error(`[organizador-gemb-mcp] ${error.message}`);
  process.exit(1);
}

function jsonContent(payload, isError = false) {
  return {
    isError,
    content: [
      {
        type: 'text',
        text: JSON.stringify(payload, null, 2)
      }
    ]
  };
}

function toPlain(value) {
  if (value === null || value === undefined) return value;
  if (typeof value?.toDate === 'function') return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(toPlain);
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, toPlain(item)])
    );
  }
  return value;
}

async function findMemberByEmail(email) {
  if (!email) return null;
  const snapshot = await db.collection('members').where('email', '==', email).limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

async function resolveAssignee(email) {
  if (!email) return null;
  const member = await findMemberByEmail(email);
  if (!member) {
    throw new Error(`No member found for assignedToEmail: ${email}`);
  }

  return {
    uid: member.uid,
    name: member.displayName || 'Miembro',
    email: member.email || '',
    photoURL: member.photoURL || ''
  };
}

async function logActivity(type, taskId, taskTitle) {
  await db.collection('activity').add({
    type,
    taskId,
    taskTitle,
    user: ACTOR,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

async function getTaskOrThrow(taskId) {
  const ref = db.collection('tasks').doc(taskId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error(`Task not found: ${taskId}`);
  return { ref, data: snap.data() };
}

const server = new McpServer({
  name: 'organizador-gemb',
  version: '0.1.0'
});

server.tool(
  'get_health',
  'Verifica conexion con Firebase/Firestore y devuelve informacion no sensible del proyecto.',
  {},
  async () => {
    const credentialSource = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
      ? 'FIREBASE_SERVICE_ACCOUNT_JSON'
      : 'GOOGLE_APPLICATION_CREDENTIALS';

    await db.collection('members').limit(1).get();

    return jsonContent({
      ok: true,
      projectId: app.options.projectId || process.env.FIREBASE_PROJECT_ID || null,
      credentialSource,
      deleteEnabled
    });
  }
);

server.tool(
  'list_tasks',
  'Lista tareas con filtros opcionales. Por defecto devuelve tareas no archivadas.',
  {
    status: z.enum(VALID_STATUSES).optional(),
    priority: z.enum(VALID_PRIORITIES).optional(),
    assignedToEmail: z.string().email().optional(),
    archived: z.boolean().optional(),
    limit: z.number().int().min(1).max(200).optional()
  },
  async ({ status, priority, assignedToEmail, archived = false, limit = 50 }) => {
    const snapshot = await db.collection('tasks').orderBy('createdAt', 'desc').limit(200).get();
    let tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...toPlain(doc.data()) }));

    tasks = tasks.filter((task) => {
      if (archived !== undefined && Boolean(task.archived) !== archived) return false;
      if (status && task.status !== status) return false;
      if (priority && task.priority !== priority) return false;
      if (assignedToEmail && task.assignedTo?.email !== assignedToEmail) return false;
      return true;
    }).slice(0, limit);

    return jsonContent({ count: tasks.length, tasks });
  }
);

server.tool(
  'create_task',
  'Crea una tarea global en Firestore.',
  {
    title: z.string().min(1),
    description: z.string().optional(),
    status: z.enum(VALID_STATUSES).optional(),
    priority: z.enum(VALID_PRIORITIES).optional(),
    dueDate: z.string().nullable().optional(),
    tags: z.array(z.string()).optional(),
    assignedToEmail: z.string().email().optional()
  },
  async ({ title, description = '', status = 'pending', priority = 'medium', dueDate = null, tags = [], assignedToEmail }) => {
    const assignedTo = await resolveAssignee(assignedToEmail);
    const now = admin.firestore.Timestamp.now();
    const payload = {
      title,
      description,
      status,
      priority,
      assignedTo,
      dueDate: dueDate || null,
      tags,
      createdBy: ACTOR,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      completedAt: status === 'done' ? now : null,
      archived: false
    };

    const ref = await db.collection('tasks').add(payload);
    await logActivity(status === 'done' ? 'task_completed' : 'task_created', ref.id, title);

    return jsonContent({ id: ref.id, ...toPlain(payload), createdAt: 'serverTimestamp', updatedAt: 'serverTimestamp' });
  }
);

server.tool(
  'update_task',
  'Edita campos basicos de una tarea existente.',
  {
    taskId: z.string().min(1),
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    status: z.enum(VALID_STATUSES).optional(),
    priority: z.enum(VALID_PRIORITIES).optional(),
    dueDate: z.string().nullable().optional(),
    tags: z.array(z.string()).optional(),
    assignedToEmail: z.string().email().nullable().optional(),
    archived: z.boolean().optional()
  },
  async ({ taskId, assignedToEmail, ...fields }) => {
    const { ref, data: existing } = await getTaskOrThrow(taskId);
    const updates = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    for (const key of ['title', 'description', 'status', 'priority', 'dueDate', 'tags', 'archived']) {
      if (fields[key] !== undefined) updates[key] = fields[key];
    }

    if (assignedToEmail !== undefined) {
      updates.assignedTo = assignedToEmail === null ? null : await resolveAssignee(assignedToEmail);
    }

    if (updates.status === 'done') {
      updates.completedAt = admin.firestore.Timestamp.now();
    } else if (updates.status && updates.status !== 'done') {
      updates.completedAt = null;
    }

    await ref.update(updates);
    await logActivity(updates.status === 'done' && existing.status !== 'done' ? 'task_completed' : 'task_updated', taskId, updates.title || existing.title || 'tarea');

    return jsonContent({ id: taskId, updated: toPlain(updates) });
  }
);

server.tool(
  'change_task_status',
  'Cambia el estado de una tarea.',
  {
    taskId: z.string().min(1),
    status: z.enum(VALID_STATUSES)
  },
  async ({ taskId, status }) => {
    const { ref, data } = await getTaskOrThrow(taskId);
    const updates = {
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      completedAt: status === 'done' ? admin.firestore.Timestamp.now() : null
    };

    await ref.update(updates);
    await logActivity(status === 'done' ? 'task_completed' : 'task_updated', taskId, data.title || 'tarea');

    return jsonContent({ id: taskId, status });
  }
);

server.tool(
  'archive_task',
  'Marca una tarea como archivada.',
  {
    taskId: z.string().min(1)
  },
  async ({ taskId }) => {
    const { ref, data } = await getTaskOrThrow(taskId);
    await ref.update({
      archived: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    await logActivity('task_updated', taskId, data.title || 'tarea');

    return jsonContent({ id: taskId, archived: true });
  }
);

server.tool(
  'delete_task',
  'Elimina una tarea si MCP_ALLOW_DELETE=true. Deshabilitado por defecto.',
  {
    taskId: z.string().min(1)
  },
  async ({ taskId }) => {
    if (!deleteEnabled) {
      return jsonContent({
        deleted: false,
        reason: 'delete_task is disabled. Set MCP_ALLOW_DELETE=true locally to enable destructive deletes.'
      }, true);
    }

    const { ref, data } = await getTaskOrThrow(taskId);
    await ref.delete();
    await logActivity('task_deleted', taskId, data.title || 'tarea');

    return jsonContent({ id: taskId, deleted: true });
  }
);

server.tool(
  'list_members',
  'Lista miembros registrados.',
  {
    active: z.boolean().optional(),
    limit: z.number().int().min(1).max(200).optional()
  },
  async ({ active, limit = 100 }) => {
    const snapshot = await db.collection('members').orderBy('createdAt', 'desc').limit(200).get();
    let members = snapshot.docs.map((doc) => ({ id: doc.id, ...toPlain(doc.data()) }));
    if (active !== undefined) {
      members = members.filter((member) => Boolean(member.active) === active);
    }
    members = members.slice(0, limit);

    return jsonContent({ count: members.length, members });
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
