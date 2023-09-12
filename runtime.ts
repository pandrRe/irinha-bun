import type { FunctionNode, Node } from "./interpreter";

export type Value = number | boolean | FunctionNode | null;

const globalFunctionNamespace = new Map<string, FunctionNode>();

let stackCounter = 0;
export function createFrame(initializedContext?: [string, Value][]) {
  const frameSignature = stackCounter++;

  const context = initializedContext?
    new Map(initializedContext)
    : new Map<string, Value>();

  return {
    assign(key: string, value: Value) {
      context.set(key, value);
      if (typeof value === "object" && value?.kind === "Function") {
        globalFunctionNamespace.set(key, value);
      }
    },
    read(key: string) {
      return context.get(key) ?? globalFunctionNamespace.get(key) ?? null;
    }
  };
}
