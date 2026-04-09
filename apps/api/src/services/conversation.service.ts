import { eq, desc } from 'drizzle-orm';
import { conversations, messages, type DatabaseClient } from '@swades/db';

export async function list(db: DatabaseClient, customerId?: string) {
  const rows = await db.query.conversations.findMany({
    where: customerId ? eq(conversations.customerId, customerId) : undefined,
    orderBy: [desc(conversations.updatedAt)],
    with: {
      customer: {
        columns: { id: true, firstName: true, lastName: true, email: true },
      },
      messages: {
        orderBy: [desc(messages.createdAt)],
        limit: 1,
        columns: { content: true, role: true, createdAt: true },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    customerId: row.customerId,
    subject: row.subject,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    customer: row.customer,
    lastMessage: row.messages[0] ?? null,
  }));
}

export async function getById(db: DatabaseClient, id: string) {
  return db.query.conversations.findFirst({
    where: eq(conversations.id, id),
    with: {
      customer: {
        columns: { id: true, firstName: true, lastName: true, email: true },
      },
      messages: {
        orderBy: [messages.createdAt],
      },
    },
  });
}

export async function create(
  db: DatabaseClient,
  data: { customerId: string; subject: string },
) {
  const [row] = await db
    .insert(conversations)
    .values({ customerId: data.customerId, subject: data.subject })
    .returning();

  return row;
}

export async function remove(db: DatabaseClient, id: string) {
  const [deleted] = await db
    .delete(conversations)
    .where(eq(conversations.id, id))
    .returning({ id: conversations.id });

  return deleted ?? null;
}

export async function touch(db: DatabaseClient, id: string) {
  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, id));
}
