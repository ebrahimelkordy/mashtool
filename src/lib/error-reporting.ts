export function reportRuntimeError(error: unknown, context: Record<string, unknown> = {}) {
  if (process.env.NODE_ENV !== "production") {
    console.error("[Runtime Error]", error, context);
  }
}
