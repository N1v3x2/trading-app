import { z } from "zod";
import { objectIdSchema } from "./objectId";

export const holdingSchema = z.object({
  _id: objectIdSchema.optional(),
  user: objectIdSchema,
  tickerSymbol: z.string(),
  shares: z.number(),
  costBasis: z.number()
});

export type Holding = z.infer<typeof holdingSchema>;