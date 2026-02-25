import { NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";
import { fail } from "@/lib/api/response";

export async function parseJson<T>(request: Request, schema: ZodSchema<T>): Promise<T> {
  const body = await request.json();
  return schema.parse(body);
}

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function jsonError(code: string, message: string, status = 400, details?: unknown) {
  return NextResponse.json(fail(code, message, details), { status });
}

export function withApiErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T) => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error("[API_ERROR]", error);
      if (error instanceof ZodError) {
        return NextResponse.json(fail("VALIDATION_ERROR", "Invalid request", error.flatten()), { status: 400 });
      }
      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json(fail("INTERNAL_ERROR", message), { status: 500 });
    }
  };
}
