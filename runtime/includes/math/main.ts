import Environment from "../../environment.ts";
import { MK_NATIVE_FN, MK_NUMBER, NumberVal } from "../../values.ts";

export function init(env: Environment) {
    env.declareVar("sqrt", MK_NATIVE_FN((args, _scope) => {
        if (args.length == 1) {
            if (args[0].type == "number") {
                return MK_NUMBER(Math.sqrt((args[0] as NumberVal).value));
            } else {
                console.error("sqrt can only take a number arg.");
                Deno.exit(1);
            }
        } else {
            console.error("sqrt can only take one arg.");
            Deno.exit(1);
        }
    }), true);

    env.declareVar("abs", MK_NATIVE_FN((args, _scope) => {
        if (args.length == 1) {
            if (args[0].type == "number") {
                return MK_NUMBER(Math.abs((args[0] as NumberVal).value));
            } else {
                console.error("abs can only take a number arg.");
                Deno.exit(1);
            }
        } else {
            console.error("abs can only take one arg.");
            Deno.exit(1);
        }
    }), true);

    env.declareVar("ceil", MK_NATIVE_FN((args, _scope) => {
        if (args.length == 1) {
            if (args[0].type == "number") {
                return MK_NUMBER(Math.ceil((args[0] as NumberVal).value));
            } else {
                console.error("ceil can only take a number arg.");
                Deno.exit(1);
            }
        } else {
            console.error("ceil can only take one arg.");
            Deno.exit(1);
        }
    }), true);

    env.declareVar("floor", MK_NATIVE_FN((args, _scope) => {
        if (args.length == 1) {
            if (args[0].type == "number") {
                return MK_NUMBER(Math.floor((args[0] as NumberVal).value));
            } else {
                console.error("floor can only take a number arg.");
                Deno.exit(1);
            }
        } else {
            console.error("floor can only take one arg.");
            Deno.exit(1);
        }
    }), true);

    env.declareVar("round", MK_NATIVE_FN((args, _scope) => {
        if (args.length == 1) {
            if (args[0].type == "number") {
                return MK_NUMBER(Math.sqrt((args[0] as NumberVal).value));
            } else {
                console.error("round can only take a number arg.");
                Deno.exit(1);
            }
        } else {
            console.error("round can only take one arg.");
            Deno.exit(1);
        }
    }), true);

    env.declareVar("random", MK_NATIVE_FN((args, _scope) => {
        if (args.length == 1) {
            if (args[0].type == "number") {
                return MK_NUMBER(Math.floor(Math.random()*(args[0] as NumberVal).value));
            } else {
                console.error("random can only take a number arg.");
                Deno.exit(1);
            }
        } else {
            console.error("random can only take one arg.");
            Deno.exit(1);
        }
    }), true);

    env.declareVar("cos", MK_NATIVE_FN((args, _scope) => {
        if (args.length == 1) {
            if (args[0].type == "number") {
                return MK_NUMBER(Math.cos((args[0] as NumberVal).value));
            } else {
                console.error("cos can only take a number arg.");
                Deno.exit(1);
            }
        } else {
            console.error("cos can only take one arg.");
            Deno.exit(1);
        }
    }), true);

    env.declareVar("log", MK_NATIVE_FN((args, _scope) => {
        if (args.length == 1) {
            if (args[0].type == "number") {
                return MK_NUMBER(Math.log((args[0] as NumberVal).value));
            } else {
                console.error("log can only take a number arg.");
                Deno.exit(1);
            }
        } else {
            console.error("log can only take one arg.");
            Deno.exit(1);
        }
    }), true);

    env.declareVar("sin", MK_NATIVE_FN((args, _scope) => {
        if (args.length == 1) {
            if (args[0].type == "number") {
                return MK_NUMBER(Math.sin((args[0] as NumberVal).value));
            } else {
                console.error("sin can only take a number arg.");
                Deno.exit(1);
            }
        } else {
            console.error("sin can only take one arg.");
            Deno.exit(1);
        }
    }), true);
}
