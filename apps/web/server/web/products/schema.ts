import { z } from "zod"

const productDataSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
})

const recurringSchema = z.object({
  interval: z.enum(["day", "week", "month", "year"]),
  interval_count: z.number().int().positive().default(1),
})

const lineItemSchema = z.union([
  // Existing price ID
  z.object({
    price: z.string().min(1, "Price ID is required"),
    quantity: z.number().int().positive().default(1),
  }),

  // Price data for custom pricing
  z.object({
    price_data: z.object({
      product_data: productDataSchema,
      unit_amount: z.number().int().positive("Unit amount must be positive"),
      currency: z.string().default("usd"),
      recurring: recurringSchema.optional(),
    }),
    quantity: z.number().int().positive().default(1),
  }),
])

export const checkoutSchema = z.object({
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required"),
  mode: z.enum(["subscription", "payment"]).default("payment"),
  metadata: z.record(z.string(), z.string()).optional(),
  coupon: z.string().optional(),
  successUrl: z.string(),
  cancelUrl: z.string().optional(),
})
