import { z } from "zod";
import { objectIdSchema } from "./objectId";

const holdingSchema = z.object({
  _id: objectIdSchema.optional(),
  user: objectIdSchema,
  tickerSymbol: z.string(),
  shares: z.number(),
  costBasis: z.number()
});

type Holding = z.infer<typeof holdingSchema>;

export { holdingSchema, Holding }