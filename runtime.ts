import type { FunctionNode, TupleNode } from "./interpreter";

export type Value = number | string | boolean | FunctionNode | TupleNode | null;

const globalFunctionNamespace = new Map<string, FunctionNode>();

export function createFrame(initializedContext?: [string, Value][]) {
  const context = initializedContext?
    new Map(initializedContext)
    : new Map<string, Value>();

  function assign(key: string, value: Value) {
    context.set(key, value);
  }

  function declareFunction(key: string, value: FunctionNode) {
    assign(key, value);
    globalFunctionNamespace.set(key, value);
  }

  function read(key: string) {
    return context.get(key) ?? globalFunctionNamespace.get(key) ?? null;
  }

  return {
    assign, declareFunction, read,
  };
}
