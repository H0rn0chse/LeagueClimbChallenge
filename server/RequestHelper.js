import { request } from "https";

export function getRequest (host, endpoint, headers = {}, queryParams = {}) {
    return new Promise((resolve, reject) => {
        let url = endpoint;
        Object.keys(queryParams).forEach(key => {
            const value = queryParams[key];
            if (url.includes("?")) {
                url += `&${key}=${value}`;
            } else {
                url += `?${key}=${value}`;
            }
        });

        const options = {
            hostname: host,
            path: encodeURI(url),
            method: "GET",
            headers: headers
        };

        console.log(`sending request: ${endpoint}`);
        const req = request(options, res => {

            res.on("data", d => {
                const buffer = Buffer.from(d);
                const json = buffer.toString();
                let data;
                try {
                    data =JSON.parse(json);
                } catch (err) {
                    data = json;
                }
                resolve(data);
            });
        });

        req.on("error", error => {
            reject(error);
        });
        req.on("abort", error => {
            reject(error);
        });

        req.end();
    });
}
