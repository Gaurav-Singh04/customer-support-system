import {
  conversations,
  customers,
  invoices,
  messages,
  orderEvents,
  orders,
  refunds,
  type NewConversation,
  type NewCustomer,
  type NewInvoice,
  type NewMessage,
  type NewOrder,
  type NewOrderEvent,
  type NewRefund,
} from './schema';
import { createDatabaseClient } from './client';

const customerSeed: NewCustomer[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'maya.patel@example.com',
    firstName: 'Maya',
    lastName: 'Patel',
    phone: '+1-555-0101',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'lucas.chen@example.com',
    firstName: 'Lucas',
    lastName: 'Chen',
    phone: '+1-555-0102',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'olivia.brooks@example.com',
    firstName: 'Olivia',
    lastName: 'Brooks',
    phone: '+1-555-0103',
  },
];

const conversationSeed: NewConversation[] = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    customerId: '11111111-1111-1111-1111-111111111111',
    subject: 'Checking on delayed sofa delivery',
    status: 'open',
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    customerId: '22222222-2222-2222-2222-222222222222',
    subject: 'Refund status for damaged lamp',
    status: 'resolved',
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
    customerId: '33333333-3333-3333-3333-333333333333',
    subject: 'Question about overdue invoice',
    status: 'open',
  },
];

const messageSeed: NewMessage[] = [
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    conversationId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    role: 'user',
    content: 'My sofa order was supposed to arrive yesterday. Can you check the delivery status?',
    createdAt: new Date('2026-04-08T09:00:00.000Z'),
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
    conversationId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    role: 'assistant',
    agentType: 'order',
    content: 'I am checking the courier updates for order SW-1001 now.',
    createdAt: new Date('2026-04-08T09:00:20.000Z'),
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3',
    conversationId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    role: 'assistant',
    agentType: 'order',
    content:
      'The carrier reported a one-day delay after a hub scan in Newark. The new delivery target is April 9.',
    createdAt: new Date('2026-04-08T09:00:45.000Z'),
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4',
    conversationId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    role: 'user',
    content: 'I received the damaged lamp refund email. Has the refund already been processed?',
    createdAt: new Date('2026-04-05T15:12:00.000Z'),
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5',
    conversationId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    role: 'assistant',
    agentType: 'billing',
    content: 'Yes. Refund RFD-2001 was completed back to the original card on April 4.',
    createdAt: new Date('2026-04-05T15:12:28.000Z'),
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb6',
    conversationId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    role: 'assistant',
    agentType: 'support',
    content: 'You should see the funds in three to five business days depending on your bank.',
    createdAt: new Date('2026-04-05T15:12:49.000Z'),
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb7',
    conversationId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
    role: 'user',
    content: 'I noticed invoice INV-3001 is marked overdue, but I thought autopay would cover it.',
    createdAt: new Date('2026-04-09T08:30:00.000Z'),
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb8',
    conversationId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
    role: 'assistant',
    agentType: 'billing',
    content:
      'Autopay failed because the card on file expired in March, so the balance is still due.',
    createdAt: new Date('2026-04-09T08:30:31.000Z'),
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb9',
    conversationId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
    role: 'assistant',
    agentType: 'billing',
    content:
      'I can help review the balance and the retry timing if you want to update the payment method.',
    createdAt: new Date('2026-04-09T08:30:54.000Z'),
  },
];

const orderSeed: NewOrder[] = [
  {
    id: 'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    customerId: '11111111-1111-1111-1111-111111111111',
    orderNumber: 'SW-1001',
    status: 'delayed',
    currency: 'USD',
    totalAmountCents: 124900,
    shippingAddress: '15 River St, Jersey City, NJ 07310',
    placedAt: new Date('2026-04-02T10:00:00.000Z'),
    estimatedDeliveryAt: new Date('2026-04-09T20:00:00.000Z'),
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-ccccccccccc2',
    customerId: '22222222-2222-2222-2222-222222222222',
    orderNumber: 'SW-2001',
    status: 'delivered',
    currency: 'USD',
    totalAmountCents: 18900,
    shippingAddress: '492 Sunset Ave, Pasadena, CA 91103',
    placedAt: new Date('2026-03-28T18:15:00.000Z'),
    estimatedDeliveryAt: new Date('2026-04-02T20:00:00.000Z'),
    deliveredAt: new Date('2026-04-02T17:42:00.000Z'),
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-ccccccccccc3',
    customerId: '33333333-3333-3333-3333-333333333333',
    orderNumber: 'SW-3001',
    status: 'processing',
    currency: 'USD',
    totalAmountCents: 45900,
    shippingAddress: '88 Oak Ridge Dr, Austin, TX 78702',
    placedAt: new Date('2026-04-07T13:20:00.000Z'),
    estimatedDeliveryAt: new Date('2026-04-12T20:00:00.000Z'),
  },
];

const orderEventSeed: NewOrderEvent[] = [
  {
    id: 'dddddddd-dddd-dddd-dddd-ddddddddddd1',
    orderId: 'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    eventType: 'placed',
    description: 'Order confirmed by storefront.',
    location: 'New York, NY',
    eventAt: new Date('2026-04-02T10:00:00.000Z'),
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-ddddddddddd2',
    orderId: 'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    eventType: 'shipped',
    description: 'Shipment handed to carrier.',
    location: 'Edison, NJ',
    eventAt: new Date('2026-04-04T06:15:00.000Z'),
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-ddddddddddd3',
    orderId: 'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    eventType: 'delay_reported',
    description: 'Carrier reported weather-related routing delay.',
    location: 'Newark, NJ',
    eventAt: new Date('2026-04-08T05:40:00.000Z'),
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-ddddddddddd4',
    orderId: 'cccccccc-cccc-cccc-cccc-ccccccccccc2',
    eventType: 'placed',
    description: 'Order confirmed by storefront.',
    location: 'Los Angeles, CA',
    eventAt: new Date('2026-03-28T18:15:00.000Z'),
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-ddddddddddd5',
    orderId: 'cccccccc-cccc-cccc-cccc-ccccccccccc2',
    eventType: 'out_for_delivery',
    description: 'Courier is delivering the package today.',
    location: 'Pasadena, CA',
    eventAt: new Date('2026-04-02T11:05:00.000Z'),
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-ddddddddddd6',
    orderId: 'cccccccc-cccc-cccc-cccc-ccccccccccc2',
    eventType: 'delivered',
    description: 'Package delivered at front door.',
    location: 'Pasadena, CA',
    eventAt: new Date('2026-04-02T17:42:00.000Z'),
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-ddddddddddd7',
    orderId: 'cccccccc-cccc-cccc-cccc-ccccccccccc3',
    eventType: 'placed',
    description: 'Order confirmed by storefront.',
    location: 'Austin, TX',
    eventAt: new Date('2026-04-07T13:20:00.000Z'),
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-ddddddddddd8',
    orderId: 'cccccccc-cccc-cccc-cccc-ccccccccccc3',
    eventType: 'processing',
    description: 'Warehouse is preparing the order for shipment.',
    location: 'Austin, TX',
    eventAt: new Date('2026-04-08T09:30:00.000Z'),
  },
];

const invoiceSeed: NewInvoice[] = [
  {
    id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1',
    customerId: '11111111-1111-1111-1111-111111111111',
    orderId: 'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    invoiceNumber: 'INV-1001',
    status: 'paid',
    currency: 'USD',
    subtotalAmountCents: 115000,
    taxAmountCents: 9900,
    totalAmountCents: 124900,
    amountDueCents: 0,
    issuedAt: new Date('2026-04-02T10:05:00.000Z'),
    dueAt: new Date('2026-04-02T10:05:00.000Z'),
    paidAt: new Date('2026-04-02T10:07:00.000Z'),
  },
  {
    id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2',
    customerId: '22222222-2222-2222-2222-222222222222',
    orderId: 'cccccccc-cccc-cccc-cccc-ccccccccccc2',
    invoiceNumber: 'INV-2001',
    status: 'refunded',
    currency: 'USD',
    subtotalAmountCents: 17500,
    taxAmountCents: 1400,
    totalAmountCents: 18900,
    amountDueCents: 0,
    issuedAt: new Date('2026-03-28T18:20:00.000Z'),
    dueAt: new Date('2026-03-28T18:20:00.000Z'),
    paidAt: new Date('2026-03-28T18:22:00.000Z'),
  },
  {
    id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee3',
    customerId: '33333333-3333-3333-3333-333333333333',
    orderId: 'cccccccc-cccc-cccc-cccc-ccccccccccc3',
    invoiceNumber: 'INV-3001',
    status: 'overdue',
    currency: 'USD',
    subtotalAmountCents: 42000,
    taxAmountCents: 3900,
    totalAmountCents: 45900,
    amountDueCents: 45900,
    issuedAt: new Date('2026-04-07T13:25:00.000Z'),
    dueAt: new Date('2026-04-08T13:25:00.000Z'),
  },
];

const refundSeed: NewRefund[] = [
  {
    id: 'ffffffff-ffff-ffff-ffff-fffffffffff1',
    customerId: '22222222-2222-2222-2222-222222222222',
    invoiceId: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2',
    orderId: 'cccccccc-cccc-cccc-cccc-ccccccccccc2',
    refundNumber: 'RFD-2001',
    status: 'completed',
    reason: 'Partial refund issued for damaged lamp shade.',
    currency: 'USD',
    amountCents: 4500,
    requestedAt: new Date('2026-04-03T10:10:00.000Z'),
    processedAt: new Date('2026-04-04T12:30:00.000Z'),
  },
  {
    id: 'ffffffff-ffff-ffff-ffff-fffffffffff2',
    customerId: '33333333-3333-3333-3333-333333333333',
    invoiceId: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee3',
    orderId: 'cccccccc-cccc-cccc-cccc-ccccccccccc3',
    refundNumber: 'RFD-3001',
    status: 'pending',
    reason: 'Customer requested a billing adjustment review before payment retry.',
    currency: 'USD',
    amountCents: 1500,
    requestedAt: new Date('2026-04-09T08:45:00.000Z'),
  },
];

async function seedDatabase() {
  const { db, pool } = createDatabaseClient();

  try {
    await db.transaction(async (tx) => {
      await tx.delete(messages);
      await tx.delete(refunds);
      await tx.delete(orderEvents);
      await tx.delete(invoices);
      await tx.delete(conversations);
      await tx.delete(orders);
      await tx.delete(customers);

      await tx.insert(customers).values(customerSeed);
      await tx.insert(conversations).values(conversationSeed);
      await tx.insert(messages).values(messageSeed);
      await tx.insert(orders).values(orderSeed);
      await tx.insert(orderEvents).values(orderEventSeed);
      await tx.insert(invoices).values(invoiceSeed);
      await tx.insert(refunds).values(refundSeed);
    });

    console.log('Seeded database with customers, conversations, orders, invoices, and refunds.');
  } finally {
    await pool.end();
  }
}

seedDatabase().catch((error) => {
  console.error('Failed to seed database.', error);
  process.exitCode = 1;
});
