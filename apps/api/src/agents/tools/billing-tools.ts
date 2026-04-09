import { tool, zodSchema } from 'ai';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { invoices, refunds, orders, type DatabaseClient } from '@swades/db';

export function createBillingTools(db: DatabaseClient, customerId: string) {
  return {
    getCustomerInvoices: tool({
      description: 'List all invoices for the current customer including status and amounts.',
      parameters: zodSchema(z.object({})),
      execute: async () => {
        const rows = await db.query.invoices.findMany({
          where: eq(invoices.customerId, customerId),
          orderBy: [desc(invoices.issuedAt)],
        });
        return rows.map((inv) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          status: inv.status,
          totalAmount: `${inv.currency} ${(inv.totalAmountCents / 100).toFixed(2)}`,
          amountDue: `${inv.currency} ${(inv.amountDueCents / 100).toFixed(2)}`,
          issuedAt: inv.issuedAt.toISOString(),
          dueAt: inv.dueAt.toISOString(),
          paidAt: inv.paidAt?.toISOString() ?? null,
        }));
      },
    }),

    getInvoiceDetails: tool({
      description:
        'Fetch full details for a specific invoice by its number (e.g. INV-1001), including related order and refunds.',
      parameters: zodSchema(
        z.object({
          invoiceNumber: z.string().describe('The invoice number, e.g. INV-1001'),
        }),
      ),
      execute: async ({ invoiceNumber }) => {
        const inv = await db.query.invoices.findFirst({
          where: and(
            eq(invoices.invoiceNumber, invoiceNumber),
            eq(invoices.customerId, customerId),
          ),
          with: { refunds: true },
        });
        if (!inv) return { error: `Invoice ${invoiceNumber} not found` };

        const relatedOrder = inv.orderId
          ? await db.query.orders.findFirst({ where: eq(orders.id, inv.orderId) })
          : null;

        return {
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          status: inv.status,
          subtotal: `${inv.currency} ${(inv.subtotalAmountCents / 100).toFixed(2)}`,
          tax: `${inv.currency} ${(inv.taxAmountCents / 100).toFixed(2)}`,
          total: `${inv.currency} ${(inv.totalAmountCents / 100).toFixed(2)}`,
          amountDue: `${inv.currency} ${(inv.amountDueCents / 100).toFixed(2)}`,
          issuedAt: inv.issuedAt.toISOString(),
          dueAt: inv.dueAt.toISOString(),
          paidAt: inv.paidAt?.toISOString() ?? null,
          relatedOrder: relatedOrder
            ? { orderNumber: relatedOrder.orderNumber, status: relatedOrder.status }
            : null,
          refunds: inv.refunds.map((r) => ({
            refundNumber: r.refundNumber,
            status: r.status,
            amount: `${r.currency} ${(r.amountCents / 100).toFixed(2)}`,
          })),
        };
      },
    }),

    getCustomerRefunds: tool({
      description: 'List all refunds for the current customer.',
      parameters: zodSchema(z.object({})),
      execute: async () => {
        const rows = await db.query.refunds.findMany({
          where: eq(refunds.customerId, customerId),
          orderBy: [desc(refunds.requestedAt)],
        });
        return rows.map((r) => ({
          id: r.id,
          refundNumber: r.refundNumber,
          status: r.status,
          reason: r.reason,
          amount: `${r.currency} ${(r.amountCents / 100).toFixed(2)}`,
          requestedAt: r.requestedAt.toISOString(),
          processedAt: r.processedAt?.toISOString() ?? null,
        }));
      },
    }),

    getRefundDetails: tool({
      description:
        'Fetch full details for a specific refund by its number (e.g. RFD-2001), including related invoice and order.',
      parameters: zodSchema(
        z.object({
          refundNumber: z.string().describe('The refund number, e.g. RFD-2001'),
        }),
      ),
      execute: async ({ refundNumber }) => {
        const r = await db.query.refunds.findFirst({
          where: and(eq(refunds.refundNumber, refundNumber), eq(refunds.customerId, customerId)),
        });
        if (!r) return { error: `Refund ${refundNumber} not found` };

        const [relatedInvoice, relatedOrder] = await Promise.all([
          r.invoiceId ? db.query.invoices.findFirst({ where: eq(invoices.id, r.invoiceId) }) : null,
          r.orderId ? db.query.orders.findFirst({ where: eq(orders.id, r.orderId) }) : null,
        ]);

        return {
          id: r.id,
          refundNumber: r.refundNumber,
          status: r.status,
          reason: r.reason,
          amount: `${r.currency} ${(r.amountCents / 100).toFixed(2)}`,
          requestedAt: r.requestedAt.toISOString(),
          processedAt: r.processedAt?.toISOString() ?? null,
          relatedInvoice: relatedInvoice
            ? { invoiceNumber: relatedInvoice.invoiceNumber, status: relatedInvoice.status }
            : null,
          relatedOrder: relatedOrder
            ? { orderNumber: relatedOrder.orderNumber, status: relatedOrder.status }
            : null,
        };
      },
    }),
  };
}
