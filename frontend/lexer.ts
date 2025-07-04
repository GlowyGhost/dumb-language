import Environment from "../runtime/environment.ts";
import { newInclude } from "../runtime/import.ts";

export enum TokenType {
	// Literal Types
	Number,
	Identifier,
	String,

	// Keywords
	Let,
	Const,
	Fn,

	// Grouping * Operators
	BinaryOperator,
	Equals,
	Comma,
	Dot,
	Colon,
	Semicolon,
	OpenParen, // (
	CloseParen, // )
	OpenBrace, // {
	CloseBrace, // }
	OpenBracket, // [
	CloseBracket, // ]
	EOF, // Signified the end of file
}

const KEYWORDS: Record<string, TokenType> = {
	let: TokenType.Let,
	const: TokenType.Const,
	function: TokenType.Fn,
};

export interface Token {
	value: string;
	type: TokenType;
}

function token(value = "", type: TokenType): Token {
	return { value, type };
}

function isalpha(src: string) {
	return src.toUpperCase() != src.toLowerCase();
}

function isskippable(str: string) {
	return str == " " || str == "\n" || str == "\t" || str == "\r";
}

function getGlobalEnv(env: Environment): Environment {
	if (env.parent != undefined)
		return getGlobalEnv(env.parent);
	return env;
}

function isint(str: string) {
	const c = str.charCodeAt(0);
	const bounds = ["0".charCodeAt(0), "9".charCodeAt(0)];
	return c >= bounds[0] && c <= bounds[1];
}

export function tokenize(sourceCode: string, env: Environment): Token[] {
	const tokens = new Array<Token>();
	const src = sourceCode.split("");

	while (src.length > 0) {
		//Comment check
		if (src[0] == "/" && src[1] == "/") {
			src.shift();
			src.shift();

			let str = "";

			while (src.length > 0 && (src[0] as string) != "\n" && (src[0] as string) != "\r") {
				str = str + src.shift();
			}

			const flag = str.split(" ")[0];
			
			if (flag == "--i") {
				newInclude(str.slice(4), getGlobalEnv(env));
			}

			continue;
		}

		if (src[0] == "(") {
			tokens.push(token(src.shift(), TokenType.OpenParen));
		} else if (src[0] == ")") {
			tokens.push(token(src.shift(), TokenType.CloseParen));
		} else if (src[0] == "{") {
			tokens.push(token(src.shift(), TokenType.OpenBrace));
		} else if (src[0] == "}") {
			tokens.push(token(src.shift(), TokenType.CloseBrace));
		} else if (src[0] == "[") {
			tokens.push(token(src.shift(), TokenType.OpenBracket));
		} else if (src[0] == "]") {
			tokens.push(token(src.shift(), TokenType.CloseBracket));
		}
		else if (
			src[0] == "+" ||
			src[0] == "-" ||
			src[0] == "*" ||
			src[0] == "/" ||
			src[0] == "%"
		) {
			tokens.push(token(src.shift(), TokenType.BinaryOperator));
		}
		else if (src[0] == "=") {
			tokens.push(token(src.shift(), TokenType.Equals));
		} else if (src[0] == ";") {
			tokens.push(token(src.shift(), TokenType.Semicolon));
		} else if (src[0] == ":") {
			tokens.push(token(src.shift(), TokenType.Colon));
		} else if (src[0] == ",") {
			tokens.push(token(src.shift(), TokenType.Comma));
		} else if (src[0] == ".") {
			tokens.push(token(src.shift(), TokenType.Dot));
		}
		else if (src[0] == '"') {
			src.shift();
			let str = "";
			while (src.length > 0 && src[0] != '"') {
				str += src.shift();
			}
			if (src.length === 0) {
				console.error("Unterminated string literal");
				Deno.exit(1);
			}
			src.shift();
			tokens.push(token(str, TokenType.String));
		}
		else {
			if (isint(src[0])) {
				let num = "";
				while (src.length > 0 && isint(src[0])) {
					num += src.shift();
				}

				tokens.push(token(num, TokenType.Number));
			}
			else if (isalpha(src[0])) {
				let ident = "";
				while (src.length > 0 && isalpha(src[0])) {
					ident += src.shift();
				}

				const reserved = KEYWORDS[ident];
				if (typeof reserved == "number") {
					tokens.push(token(ident, reserved));
				} else {
					tokens.push(token(ident, TokenType.Identifier));
				}
			} else if (isskippable(src[0])) {
				src.shift();
			}
			else {
				console.error(
					"Unreconized character found in source: ",
					src[0].charCodeAt(0),
					src[0]
				);
				Deno.exit(1);
			}
		}
	}

	tokens.push({ type: TokenType.EOF, value: "EndOfFile" });
	return tokens;
}
