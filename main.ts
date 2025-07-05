import Parser from "./frontend/parser.ts";
import Environment, { createGlobalEnv } from "./runtime/environment.ts";
import { evaluate } from "./runtime/interpreter.ts";

findMode();

async function run(filename: string, env: Environment) {
	const parser = new Parser();

	const input = await Deno.readTextFile(filename);
	const program = parser.produceAST(input, env);

	const _result = evaluate(program, env);
	//console.log(result);

	Deno.exit(0);
}

async function findMode() {
	const env = createGlobalEnv();

	while (true) {
		console.log("repl | exit | file")
		const input = prompt("Mode > ");

		if (input == "exit") {
			Deno.exit(0);
		} else if (input == "file") {
			const input2 = prompt("fileDir > ");
			if (input2 != undefined) {
				await run(input2, env);
				Deno.exit(0);
			}
		} else if (input == "repl") {
			await repl(env);
			Deno.exit(0);
		}
	}
}

function repl(env: Environment) {
  	const parser = new Parser();
  	console.log("\nRepl v0.1");

  	while (true) {
    	const input = prompt("> ");
    	if (!input || input.includes("exit")) {
      		break;
    	}

    	const program = parser.produceAST(input, env);
    	
		const _result = evaluate(program, env)
  	}
}
