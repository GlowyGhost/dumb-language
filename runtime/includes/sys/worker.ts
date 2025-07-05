/// <reference lib="webworker" />

onmessage = (e: any) => {
    console.log(e.data);
    if (e.data.cmd == "loop") {
        console.log("looping")
    }
}
