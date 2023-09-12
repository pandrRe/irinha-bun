import { interpret } from "./interpreter";

console.info("Testing rinhac-bun...");

const fibRinhaAstPath = "./rinha-de-compiler/files/fib.json";
const sumRinhaAstPath = "./rinha-de-compiler/files/sum.json";

console.info("Interpreting fib.rinha ast...");
interpret(await Bun.file(fibRinhaAstPath).json());

console.info("Finished.");
