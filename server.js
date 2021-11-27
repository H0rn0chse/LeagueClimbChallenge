const path = require("path");
const connect = require("connect");
const serveStatic = require("serve-static");
const { handleGetRequest } = require("./server/handler.js");

const port = parseInt(process.env.PORT, 10) || 8080;
const host = process.env.PORT ? "0.0.0.0" : "localhost";
const local = !!process.env.npm_config_debug;

connect()
    .use(serveStatic(path.join(__dirname, "client")))
    .use("/get", handleGetRequest)
    .use((req, res) => {
        const body = "not supported";
        res
            .writeHead(400, {
                'Content-Length': Buffer.byteLength(body),
                'Content-Type': 'text/plain'
            })
            .end(body);
    })
    .listen(port, host, function(){
        console.log(`Server running on http://${host}:${port}`);
    });