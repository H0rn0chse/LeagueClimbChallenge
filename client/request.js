export function getData () {
    return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();
        req.addEventListener("load", () => {
            resolve(req.responseText);
        });
        req.addEventListener("error", () => {
            reject("error");
        });
        req.addEventListener("abort", ()  => {
            reject("abort");
        });
        req.open("GET", "/get/blob", true);
        req.send();
    })
}