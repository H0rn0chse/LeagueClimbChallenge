export function getData () {
    return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();
        req.addEventListener("load", () => {
            let data;
            try {
                data = JSON.parse(req.responseText);
            } catch (err) {
                data = req.responseText;
            }
            resolve(data);
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