const path = require("path");
const connect = require("connect");
const serveStatic = require("serve-static");
const dotenv = require("dotenv");

const port = parseInt(process.env.PORT, 10) || 8080;
const host = process.env.PORT ? "0.0.0.0" : "localhost";
const local = !!process.env.npm_config_debug;

// local .env setup
if (process.env.RIOT_APP_TOKEN === undefined) {
    dotenv.config();
}
const riotToken = process.env.RIOT_APP_TOKEN;

console.log(riotToken)

connect()
    .use(serveStatic(path.join(__dirname, "client")))
    .listen(port, host, function(){
        console.log(`Server running on http://${host}:${port}`);
    });