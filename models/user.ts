import { z } from "zod";
import { objectIdSchema } from "./objectId";

export const UserSchema = z.object({
  // ObjectID must be hexidecimal and 24 chars long
  _id: objectIdSchema.optional(),
  name: z.string(),
  age: z.number().int(),
  email: z.string(),
  balance: z.number(),
});

export type User = z.infer<typeof UserSchema>;