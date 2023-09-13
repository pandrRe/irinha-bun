import assert from "node:assert";
import { type Value, createFrame } from "./runtime";

type Location = { start: number; end: number; filename: string };

type LetNode = {
  kind: "Let",
  name: {
    text: string;
    location: string;
  },
  value: Node;
  next: Node;
  location: Location;
};

type IfNode = {
  kind: "If";
  condition: Node;
  then: Node;
  otherwise?: Node;
  location: Location;
};

type BinaryNode = {
  kind: "Binary";
  lhs: Node;
  op:
    | "Add"
    | "Sub"
    | "Mul"
    | "Div"
    | "Rem"
    | "Lt"
    | "Gt"
    | "Lte"
    | "Gte"
    | "Eq"
    | "Neq"
    | "Or"
    | "And";
  rhs: Node;
  location: Location;
};

type VarNode = {
  kind: "Var";
  text: string;
  location: Location;
};

type IntNode = {
  kind: "Int";
  value: number;
  location: Location;
};

type StringNode = {
  kind: "Str";
  value: string;
  location: Location;
};

type BooleanNode = {
  kind: "Bool";
  value: boolean;
  location: Location;
};

export type TupleNode = {
  kind: "Tuple";
  first: Node;
  second: Node;
  location: Location;
};

type FirstNode = {
  kind: "First";
  value: Node;
  location: Location;
};

type SecondNode = {
  kind: "Second";
  value: Node;
  location: Location;
};

type PrintNode = {
  kind: "Print";
  value: Node;
  location: Location;
};

type CallNode = {
  kind: "Call";
  callee: VarNode;
  arguments: Node[];
  location: Location;
};

export type FunctionNode = {
  kind: "Function";
  parameters: Array<{
    text: string;
    location: Location;
  }>;
  value: Node;
};

export type Node =
  | LetNode
  | IfNode
  | BinaryNode
  | VarNode
  | IntNode
  | StringNode
  | BooleanNode
  | TupleNode
  | FirstNode
  | SecondNode
  | PrintNode
  | CallNode
  | FunctionNode;

type Root = {
  name: string;
  expression: Node;
  location: Location;
};

function evaluateBinaryOp(binaryNode: BinaryNode, frame: ReturnType<typeof createFrame>): Value {
  const left = evaluate(binaryNode.lhs, frame);
  const right = evaluate(binaryNode.rhs, frame);
  
  switch (binaryNode.op) {
    case "Add":
      assert(
        (typeof left === "string" || typeof left === "number")
        && (typeof right === "string" || typeof right === "number"),
        "Invalid + operation."
      );
      //@ts-ignore
      return left + right;
    case "Sub":
      assert(
        typeof left === "number" && typeof right === "number",
        Error("Both LHS value and RHS value should be numbers.")
      );
      return left - right;
    case "Mul":
      assert(
        typeof left === "number" && typeof right === "number",
        Error("Both LHS value and RHS value should be numbers.")
      );
      return left * right;
    case "Div":
      assert(
        typeof left === "number" && typeof right === "number",
        Error("Both LHS value and RHS value should be numbers.")
      );
      return left / right;
    case "Rem":
      assert(
        typeof left === "number" && typeof right === "number",
        Error("Both LHS value and RHS value should be numbers.")
      );
      return left % right;
    case "Eq":
      return left === right;
    case "Neq":
      return left !== right;
    case "Lt":
      assert(
        typeof left === "number" && typeof right === "number",
        Error("Both LHS value and RHS value should be numbers.")
      );
      return left < right;
    case "Gt":
      assert(
        typeof left === "number" && typeof right === "number",
        Error("Both LHS value and RHS value should be numbers.")
      );
      return left > right;
    case "Lte":
      assert(
        typeof left === "number" && typeof right === "number",
        Error("Both LHS value and RHS value should be numbers.")
      );
      return left <= right;
    case "Gte":
      assert(
        typeof left === "number" && typeof right === "number",
        Error("Both LHS value and RHS value should be numbers.")
      );
      return left >= right;
    case "Or":
      assert(
        typeof left === "boolean" && typeof right === "boolean",
        Error("Both LHS value and RHS value should be booleans.")
      );
      return left || right;
    case "And":
      assert(
        typeof left === "boolean" && typeof right === "boolean",
        Error("Both LHS value and RHS value should be booleans.")
      );
      return left && right;
  };
}

function callFunction(node: CallNode, frame: ReturnType<typeof createFrame>): Value {
  const func = frame.read(node.callee.text);
  assert(
    typeof func === "object" && func?.kind === "Function",
    "Must call a function."
  );
  assert(
    func.parameters.length === node.arguments.length,
    "Number of arguments do not match function definition."
  );
  const args = func.parameters.map(
    (parameter, index) => [parameter.text, evaluate(node.arguments[index], frame)] as [string, Value]
  )
  return evaluate(func.value, createFrame(args));
}

function evaluate(node: Node, frame: ReturnType<typeof createFrame>): Value {
  switch (node.kind) {
    case "Int":
    case "Str":
    case "Bool":
      return node.value;
    case "Tuple":
    case "Function":
      return node;
    case "Let":
      if (node.value.kind === "Tuple") {
        frame.assign(node.name.text, node.value);
      }
      else if (node.value.kind === "Function") {
        frame.declareFunction(node.name.text, node.value);
      }
      else {
        const value = evaluate(node.value, frame);
        frame.assign(node.name.text, value);
      }
      return evaluate(node.next, frame);
    case "Binary":
      return evaluateBinaryOp(node, frame);
    case "If":
      const condition = evaluate(node.condition, frame);
      if (condition) {
        return evaluate(node.then, frame);
      }
      else if (node.otherwise) {
        return evaluate(node.otherwise, frame);
      }
      return null;
    case "Var":
      return frame.read(node.text);
    case "Call":
      return callFunction(node, frame);
    case "First":
      assert(node.value.kind === "Tuple", "Expected tuple.");
      return evaluate(node.value.first, frame);
    case "Second":
      assert(node.value.kind === "Tuple", "Expected tuple.");
      return evaluate(node.value.second, frame);
    case "Print":
      console.log("PRINT:", evaluate(node.value, frame));
      return null;
  }
}

export function interpret(ast: Root) {
  console.log(`=== Interpreting ${ast.location.filename} ===`);
  const runtime = createFrame();
  evaluate(ast.expression, runtime);
}
