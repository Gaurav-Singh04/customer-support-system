import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const conversationStatusEnum = pgEnum('conversation_status', ['open', 'resolved', 'closed']);
export const messageRoleEnum = pgEnum('message_role', ['user', 'assistant', 'system']);
export const agentTypeEnum = pgEnum('agent_type', ['support', 'order', 'billing', 'fallback']);
export const orderStatusEnum = pgEnum('order_status', [
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
  'delayed',
  'cancelled',
]);
export const orderEventTypeEnum = pgEnum('order_event_type', [
  'placed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
  'delay_reported',
]);
export const invoiceStatusEnum = pgEnum('invoice_status', [
  'draft',
  'issued',
  'paid',
  'overdue',
  'refunded',
]);
export const refundStatusEnum = pgEnum('refund_status', ['pending', 'completed', 'failed']);

export const customers = pgTable(
  'customers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    phone: text('phone'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex('customers_email_idx').on(table.email),
  }),
);

export const conversations = pgTable(
  'conversations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    customerId: uuid('customer_id')
      .references(() => customers.id, { onDelete: 'cascade' })
      .notNull(),
    subject: text('subject').notNull(),
    status: conversationStatusEnum('status').default('open').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    customerIdx: index('conversations_customer_idx').on(table.customerId),
  }),
);

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    conversationId: uuid('conversation_id')
      .references(() => conversations.id, { onDelete: 'cascade' })
      .notNull(),
    role: messageRoleEnum('role').notNull(),
    agentType: agentTypeEnum('agent_type'),
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    conversationCreatedAtIdx: index('messages_conversation_created_at_idx').on(
      table.conversationId,
      table.createdAt,
    ),
  }),
);

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    customerId: uuid('customer_id')
      .references(() => customers.id, { onDelete: 'cascade' })
      .notNull(),
    orderNumber: text('order_number').notNull(),
    status: orderStatusEnum('status').default('processing').notNull(),
    currency: text('currency').default('USD').notNull(),
    totalAmountCents: integer('total_amount_cents').notNull(),
    shippingAddress: text('shipping_address').notNull(),
    placedAt: timestamp('placed_at', { withTimezone: true }).notNull(),
    estimatedDeliveryAt: timestamp('estimated_delivery_at', { withTimezone: true }),
    deliveredAt: timestamp('delivered_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    customerIdx: index('orders_customer_idx').on(table.customerId),
    orderNumberIdx: uniqueIndex('orders_order_number_idx').on(table.orderNumber),
  }),
);

export const orderEvents = pgTable(
  'order_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id')
      .references(() => orders.id, { onDelete: 'cascade' })
      .notNull(),
    eventType: orderEventTypeEnum('event_type').notNull(),
    description: text('description').notNull(),
    location: text('location'),
    eventAt: timestamp('event_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orderEventAtIdx: index('order_events_order_event_at_idx').on(table.orderId, table.eventAt),
  }),
);

export const invoices = pgTable(
  'invoices',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    customerId: uuid('customer_id')
      .references(() => customers.id, { onDelete: 'cascade' })
      .notNull(),
    orderId: uuid('order_id').references(() => orders.id, { onDelete: 'set null' }),
    invoiceNumber: text('invoice_number').notNull(),
    status: invoiceStatusEnum('status').default('draft').notNull(),
    currency: text('currency').default('USD').notNull(),
    subtotalAmountCents: integer('subtotal_amount_cents').notNull(),
    taxAmountCents: integer('tax_amount_cents').notNull(),
    totalAmountCents: integer('total_amount_cents').notNull(),
    amountDueCents: integer('amount_due_cents').notNull(),
    issuedAt: timestamp('issued_at', { withTimezone: true }).notNull(),
    dueAt: timestamp('due_at', { withTimezone: true }).notNull(),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    customerIdx: index('invoices_customer_idx').on(table.customerId),
    invoiceNumberIdx: uniqueIndex('invoices_invoice_number_idx').on(table.invoiceNumber),
  }),
);

export const refunds = pgTable(
  'refunds',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    customerId: uuid('customer_id')
      .references(() => customers.id, { onDelete: 'cascade' })
      .notNull(),
    invoiceId: uuid('invoice_id').references(() => invoices.id, { onDelete: 'set null' }),
    orderId: uuid('order_id').references(() => orders.id, { onDelete: 'set null' }),
    refundNumber: text('refund_number').notNull(),
    status: refundStatusEnum('status').default('pending').notNull(),
    reason: text('reason').notNull(),
    currency: text('currency').default('USD').notNull(),
    amountCents: integer('amount_cents').notNull(),
    requestedAt: timestamp('requested_at', { withTimezone: true }).notNull(),
    processedAt: timestamp('processed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    customerIdx: index('refunds_customer_idx').on(table.customerId),
    refundNumberIdx: uniqueIndex('refunds_refund_number_idx').on(table.refundNumber),
  }),
);

export const customersRelations = relations(customers, ({ many }) => ({
  conversations: many(conversations),
  orders: many(orders),
  invoices: many(invoices),
  refunds: many(refunds),
}));

export const conversationsRelations = relations(conversations, ({ many, one }) => ({
  customer: one(customers, {
    fields: [conversations.customerId],
    references: [customers.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

export const ordersRelations = relations(orders, ({ many, one }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  orderEvents: many(orderEvents),
  invoices: many(invoices),
  refunds: many(refunds),
}));

export const orderEventsRelations = relations(orderEvents, ({ one }) => ({
  order: one(orders, {
    fields: [orderEvents.orderId],
    references: [orders.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ many, one }) => ({
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
  order: one(orders, {
    fields: [invoices.orderId],
    references: [orders.id],
  }),
  refunds: many(refunds),
}));

export const refundsRelations = relations(refunds, ({ one }) => ({
  customer: one(customers, {
    fields: [refunds.customerId],
    references: [customers.id],
  }),
  invoice: one(invoices, {
    fields: [refunds.invoiceId],
    references: [invoices.id],
  }),
  order: one(orders, {
    fields: [refunds.orderId],
    references: [orders.id],
  }),
}));

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderEvent = typeof orderEvents.$inferSelect;
export type NewOrderEvent = typeof orderEvents.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type Refund = typeof refunds.$inferSelect;
export type NewRefund = typeof refunds.$inferInsert;

export const schema = {
  customers,
  conversations,
  messages,
  orders,
  orderEvents,
  invoices,
  refunds,
};
