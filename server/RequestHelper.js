const https = require("https");
const { hostname } = require("os");

function getRequest (host, endpoint, headers = {}, queryParams = {}) {
    return new Promise((resolve, reject) => {
        const url = endpoint;
        Object.keys(queryParams).forEach(key => {
            const value = queryParams[key];
            if (url.includes("?")) {
                url += `&${key}=${value}`
            } else {
                url += `?${key}=${value}`
            }
        });

        const options = {
            hostname: host,
            path: encodeURI(url),
            method: 'GET',
            headers: headers
        };

        console.log(`sending request: ${endpoint}`);
        const req = https.request(options, res => {

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
            })
        });

        req.on("error", error => {
            reject(error);
        });
        req.on("abort", error => {
            reject(error);
        });

        req.end()
    });
}

module.exports = {
    getRequest
};