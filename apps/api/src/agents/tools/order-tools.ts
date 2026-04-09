import { tool, zodSchema } from 'ai';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { orders, orderEvents, type DatabaseClient } from '@swades/db';

export function createOrderTools(db: DatabaseClient, customerId: string) {
  return {
    getCustomerOrders: tool({
      description: 'List all orders for the current customer including status and totals.',
      inputSchema: zodSchema(z.object({})),
      execute: async () => {
        const rows = await db.query.orders.findMany({
          where: eq(orders.customerId, customerId),
          orderBy: [desc(orders.placedAt)],
        });
        return rows.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          status: o.status,
          totalAmount: `${o.currency} ${(o.totalAmountCents / 100).toFixed(2)}`,
          shippingAddress: o.shippingAddress,
          placedAt: o.placedAt.toISOString(),
          estimatedDeliveryAt: o.estimatedDeliveryAt?.toISOString() ?? null,
          deliveredAt: o.deliveredAt?.toISOString() ?? null,
        }));
      },
    }),

    getOrderDetails: tool({
      description:
        'Fetch full details for a specific order by its order number (e.g. SW-1001), including tracking events.',
      inputSchema: zodSchema(
        z.object({
          orderNumber: z.string().describe('The order number, e.g. SW-1001'),
        }),
      ),
      execute: async ({ orderNumber }) => {
        const order = await db.query.orders.findFirst({
          where: and(eq(orders.orderNumber, orderNumber), eq(orders.customerId, customerId)),
          with: { orderEvents: { orderBy: [orderEvents.eventAt] } },
        });
        if (!order) return { error: `Order ${orderNumber} not found` };
        return {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          totalAmount: `${order.currency} ${(order.totalAmountCents / 100).toFixed(2)}`,
          shippingAddress: order.shippingAddress,
          placedAt: order.placedAt.toISOString(),
          estimatedDeliveryAt: order.estimatedDeliveryAt?.toISOString() ?? null,
          deliveredAt: order.deliveredAt?.toISOString() ?? null,
          events: order.orderEvents.map((e) => ({
            type: e.eventType,
            description: e.description,
            location: e.location,
            at: e.eventAt.toISOString(),
          })),
        };
      },
    }),

    getOrderEvents: tool({
      description: 'Get tracking and shipment events for a specific order.',
      inputSchema: zodSchema(
        z.object({
          orderId: z.string().uuid().describe('The order ID (UUID)'),
        }),
      ),
      execute: async ({ orderId }) => {
        const order = await db.query.orders.findFirst({
          where: and(eq(orders.id, orderId), eq(orders.customerId, customerId)),
        });
        if (!order) return { error: 'Order not found' };

        const events = await db.query.orderEvents.findMany({
          where: eq(orderEvents.orderId, orderId),
          orderBy: [orderEvents.eventAt],
        });
        return events.map((e) => ({
          type: e.eventType,
          description: e.description,
          location: e.location,
          at: e.eventAt.toISOString(),
        }));
      },
    }),
  };
}
