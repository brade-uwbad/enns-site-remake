import { NextResponse } from "next/server";

/**
 * Builds a JSON success response for Route Handlers using the shared API envelope `{ data: T }`.
 *
 * @param data - Payload nested under the `data` property in the JSON body.
 * @param init - Optional `ResponseInit` (e.g. `status`, `headers`). Defaults to HTTP 200.
 * @returns A `NextResponse` whose body is `{ data }` serialized as JSON.
 */
export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, { status: init?.status ?? 200, headers: init?.headers });
}

/**
 * Builds a JSON error response for Route Handlers using the shared API envelope `{ error: { message, ... } }`.
 *
 * @param message - Human-readable error message for clients.
 * @param status - HTTP status code (e.g. 400, 401, 404).
 * @param code - Optional machine-readable error code (e.g. `VALIDATION_ERROR`).
 * @param details - Optional structured details (e.g. Zod `flatten()` output).
 * @returns A `NextResponse` with JSON body `{ error: { message, code?, details? } }`.
 */
export function jsonError(message: string, status: number, code?: string, details?: unknown) {
  return NextResponse.json(
    {
      error: { message, ...(code ? { code } : {}), ...(details !== undefined ? { details } : {}) },
    },
    { status },
  );
}
