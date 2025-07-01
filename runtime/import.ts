// deno-lint-ignore-file no-explicit-any
import Environment from "./environment.ts";
import * as sys from "./includes/sys/main.ts";
import * as math from "./includes/math/main.ts";

const nativeIncludes: Record<string, any> = {
	sys,
    math,
};
const nativeIncludesList = ["sys", "math"];

export function newInclude(includeName: string, env: Environment) {
	if (nativeIncludesList.includes(includeName)) {
		try {
			const module = nativeIncludes[includeName];
			if (module?.init) {
				module.init(env);
			}
		} catch (err) {
			console.error(`Failed to import ${includeName}: ${err}`);
			Deno.exit(1);
		}
	} else {
		console.error(`${includeName} is not a possible script to include natively.`);
		Deno.exit(1);
	}
}
