import { z } from "zod";

const addressSchema = z.object({
  address1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
});

export const tickerDetailsSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  locale: z.string().optional(),
  address: addressSchema.optional(),
  description: z.string().optional(),
  logo_url: z.string().optional(),
  icon_url: z.string().optional(),
  homepage_url: z.string().optional(),
  market_cap: z.number().optional(),
});

export type TickerDetails = z.infer<typeof tickerDetailsSchema>;

export const marketStatusSchema = z.object({
  afterHours: z.boolean().optional(),
  earlyHours: z.boolean().optional(),
  nasdaq: z.string().optional(),
  nyse: z.string().optional(),
});

export type MarketStatus = z.infer<typeof marketStatusSchema>;

export const tickerSnapshotSchema = z.object({
  symbol: z.string().optional(),
  dayChangePercent: z.number().optional(),
  dayChange: z.number().optional(),
  dayOpen: z.number().optional(),
  dayHigh: z.number().optional(),
  dayLow: z.number().optional(),
  dayVolume: z.number().optional(),
  lastClose: z.number().optional(),
  lastVolume: z.number().optional(),
  lastTimestamp: z.number().optional(),
});

export type TickerSnapshot = z.infer<typeof tickerSnapshotSchema>;