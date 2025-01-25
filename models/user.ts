import { z } from "zod";
import { objectIdSchema } from "./objectId";

export const userSchema = z.object({
  _id: objectIdSchema.optional(),
  name: z.string(),
  age: z.number().int(),
  email: z.string(),
  balance: z.number(),
});

export type User = z.infer<typeof userSchema>;