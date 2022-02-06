import { startServer, registerXhrHandler } from "@h0rn0chse/socket-server";

import { config } from "./server/config.js";
import { getData } from "./server/leagueHandler.js";

startServer({
    useClientHandler: true,
    publicPaths: [[
        "/client", "/"
    ], [
        "/node_modules/picnic", "/picnic"
    ], [
        "/node_modules/alertifyjs/build", "/alertifyjs"
    ], [
        "/node_modules/@h0rn0chse/night-sky/dist", "/night-sky"
    ], [
        "/node_modules/wc-github-corners/dist", "/wc-github-corners"
    ]]
});

registerXhrHandler("get", "/blob", async (req, res) => {
    console.log("handling /blob request");

    const data = await getData();
    data.endDate = new Date(config.endDate).getTime();

    res.json(data);
    res.end();
});
