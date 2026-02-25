import { z } from "zod";

export const uuidSchema = z.string().uuid();
export const dateTimeSchema = z.string().datetime();
export const urlSchema = z.string().url();

export const apiSuccessEnvelope = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({ success: z.literal(true), data: dataSchema });
