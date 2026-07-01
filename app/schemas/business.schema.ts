import { z } from "zod"

export const businessCategoryEnum = z.enum([
  "rida",
  "halal",
  "photography",
  "wedding",
  "interior",
  "travel",
])

export const createBusinessSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  description: z.string().min(10).max(500),
  category: businessCategoryEnum,
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  whatsapp: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
    .optional(),
  location: z.string().min(5),
})

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>
