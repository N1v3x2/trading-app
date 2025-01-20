import { ObjectId } from "mongodb";
import { z } from "zod";

const objectIdSchema = z
  .string()
  .refine(val => ObjectId.isValid(val), { message: "Invalid MongoDB ObjectId" })
  .transform(val => new ObjectId(val));

export { objectIdSchema }