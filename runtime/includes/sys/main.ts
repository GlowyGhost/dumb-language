import Environment from "../../environment.ts";
import { MK_NATIVE_FN, MK_NULL, NumberVal, StringVal } from "../../values.ts";

const worker = new Worker(new URL("./worker.ts", import.meta.url).href, {
    type: "module"
});

const user32 = Deno.dlopen("user32.dll", {
    RegisterClassExW: {
        parameters: ["buffer"],
        result: "u16",
    },
    CreateWindowExW: {
        parameters: ["u32", "pointer", "pointer", "u32", "i32", "i32", "i32", "i32", "pointer", "pointer", "pointer", "pointer"],
        result: "pointer",
    },
    DefWindowProcW: {
        parameters: ["pointer", "u32", "usize", "isize"],
        result: "isize",
    },
    ShowWindow: {
        parameters: ["pointer", "i32"],
        result: "bool",
    },
    UpdateWindow: {
        parameters: ["pointer"],
        result: "bool",
    },
    GetMessageW: {
        parameters: ["buffer", "pointer", "u32", "u32"],
        result: "bool",
    },
    TranslateMessage: {
        parameters: ["buffer"],
        result: "bool",
    },
    DispatchMessageW: {
        parameters: ["buffer"],
        result: "isize",
    },
    BeginPaint: {
        parameters: ["pointer", "buffer"], 
        result: "pointer" 
    },
    EndPaint: { 
        parameters: ["pointer", "buffer"], 
        result: "bool" 
    },
    FillRect: { 
        parameters: ["pointer", "pointer", "pointer"], 
        result: "i32" 
    },
    InvalidateRect: { 
        parameters: ["pointer", "pointer", "i32"], 
        result: "i32" 
    },
    GetClientRect: { 
        parameters: ["pointer", "buffer"], 
        result: "bool" 
    },
    PostMessageW: {
        parameters: ["pointer", "u32", "usize", "isize"],
        result: "bool",
    },
});

const gdi32 = Deno.dlopen("gdi32.dll", {
    CreateSolidBrush: { 
        parameters: ["u32"], 
        result: "pointer" 
    },
    DeleteObject: { 
        parameters: ["pointer"], 
        result: "bool" 
    },
});

const kernel32 = Deno.dlopen("kernel32.dll", {
    GetModuleHandleW: {
        parameters: ["pointer"],
        result: "pointer",
    },
});

function toWide(str: string): Uint16Array {
    const buf = new Uint16Array(str.length + 1);

    for (let i = 0; i < str.length; i++) buf[i] = str.charCodeAt(i);
    return buf;
}

function toWidePointer(str: string): Deno.PointerValue {
    const buf = toWide(str);
    const view = new Uint8Array(buf.buffer);
    const ptr = Deno.UnsafePointer.of(view);

    if (!ptr) throw new Error("Pointer creation failed");

    return ptr;
}

function getPointerValue(ptr: Deno.PointerValue | null): bigint {
    if (!ptr) throw new Error("Pointer is null");
    const addr = Deno.UnsafePointer.value(ptr);
    if (addr === null) throw new Error("Pointer has no address");
    return BigInt(addr);
}

function sendWorker(data: object) {
    worker.postMessage(data);
}

let mainWindow: Deno.PointerValue | null = null;
let backgroundColor: number = 0x777215;

export function init(env: Environment) {
    if (Deno.build.os != "windows") {
        console.error(`Unsupported os used. sys can only be used on windows, not ${Deno.build.os}`);
        Deno.exit(1);
    }

    //-----------------------------------ShowWindow------------------------------------------
    env.declareVar("ShowWindow", MK_NATIVE_FN((args, _scope) => {
        // === Struct Definitions ===

        const WNDPROC = new Deno.UnsafeCallback({
            parameters: ["pointer", "u32", "usize", "isize"],
            result: "isize",
        }, (hwnd, msg, wParam, lParam) => {
            const WM_DESTROY = 0x0002;
            const WM_PAINT = 0x000F;

            if (msg === WM_DESTROY) {
                Deno.exit(0); // Gracefully quit
            }

            if (msg === WM_PAINT) {
                const paintStruct = new Uint8Array(64);
                const hdc = user32.symbols.BeginPaint(hwnd, paintStruct);
                if (!hdc) return 0n;

                const rect = new Uint8Array(16);
                user32.symbols.GetClientRect(hwnd, rect);
                const rectPtr = Deno.UnsafePointer.of(rect);

                const hBrush = gdi32.symbols.CreateSolidBrush(backgroundColor);
                user32.symbols.FillRect(hdc, rectPtr, hBrush);

                gdi32.symbols.DeleteObject(hBrush); // <-- important cleanup
                user32.symbols.EndPaint(hwnd, paintStruct);

                return 0n;
            }

            return user32.symbols.DefWindowProcW(hwnd, msg, wParam, lParam);
        });

        const className = toWide("MyWindowClass");

        const hInstance = kernel32.symbols.GetModuleHandleW(null);
        

        const wndClassSize = 80;
        const wndClass = new Uint8Array(wndClassSize);
        new DataView(wndClass.buffer).setUint32(0, wndClassSize, true);

        // Set WNDCLASS fields
        const view = new DataView(wndClass.buffer);
        const classNamePtr = Deno.UnsafePointer.of(className);

        view.setUint32(0, 80, true);
        view.setUint32(4, 0x0003, true);
        view.setBigUint64(8,  getPointerValue(WNDPROC.pointer), true);
        view.setBigUint64(24, getPointerValue(hInstance), true);
        view.setBigUint64(64, getPointerValue(classNamePtr), true);

        const result = user32.symbols.RegisterClassExW(wndClass);
        if (result === 0) throw new Error("Failed to register window class");

        const hwnd = user32.symbols.CreateWindowExW(
            0,
            Deno.UnsafePointer.of(className),
            toWidePointer((args[0] as StringVal).value),
            0xCF0000,
            100, 100,
            (args[1] as NumberVal).value, (args[2] as NumberVal).value,
            null, null, hInstance, null
        );

        const hwndAddr = Deno.UnsafePointer.value(hwnd);
        if (hwndAddr === 0n) {
            throw new Error("Failed to create window");
        }

        user32.symbols.ShowWindow(hwnd, 1);
        user32.symbols.UpdateWindow(hwnd);

        mainWindow = hwnd;

        //const msg = new Uint8Array(48);
        //while (user32.symbols.GetMessageW(msg, null, 0, 0)) {
        //    user32.symbols.TranslateMessage(msg);
        //    user32.symbols.DispatchMessageW(msg);
        //}

        postMessage = true;
        dataMessage = { cmd: "loop" }

        return MK_NULL();
    }), true);

    //-----------------------------------ChnageColor------------------------------------------
    env.declareVar("ChangeColor", MK_NATIVE_FN((args, _scope) => {
        if (mainWindow == null) {
            console.error("Cannot assign a color to a window");
            Deno.exit(1);
        }

        const r = (args[0] as NumberVal).value;
        const g = (args[1] as NumberVal).value;
        const b = (args[2] as NumberVal).value;

        // COLORREF is 0x00BBGGRR
        backgroundColor = (b << 16) | (g << 8) | r;
        console.log("Color set to:", backgroundColor.toString(16));

        user32.symbols.InvalidateRect(mainWindow, null, 1);

        return MK_NULL();
    }), true);
}

let postMessage = false;
let dataMessage = {}
let count = 0

function pollWorkerMessages() {
    try {
        console.log("poll");
        if (postMessage) {
            sendWorker(dataMessage);
            postMessage = false;
            dataMessage = {};
        }
    } catch(e) {
        console.error("pollWorkerMessages error:", e);
    }
    setTimeout(pollWorkerMessages, 50);
}

pollWorkerMessages();
