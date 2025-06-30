import { z } from 'zod';

const orderStatusSchema = z.enum(['pending', 'completed', 'cancelled']);

export const orderSchema = z.object({
  status: orderStatusSchema,
  reason: z.string().optional()
}).refine(
  (data) => data.status !== 'cancelled' || (data.reason && data.reason.trim() !== ''),
  {
    message: "Cancellation reason is required when status is 'cancelled'",
    path: ['reason'],
  }
);

export const orderUpdateSchema = orderSchema;

export const validateOrderUpdate = (data) => {
  return orderUpdateSchema.safeParse(data);
}; 