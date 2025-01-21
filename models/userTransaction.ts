import { z } from "zod";
import { objectIdSchema } from "./objectId";

export const userTransactionSchema = z.object({
  _id: objectIdSchema.optional(),
  user: objectIdSchema,
  date: z.date(),
  type: z.enum(["buy", "sell", "deposit", "withdraw"]),
  amount: z.number(),
  tickerSymbol: z.string().optional(),
  shares: z.number().int().optional()
});

export type UserTransaction = z.infer<typeof userTransactionSchema>;