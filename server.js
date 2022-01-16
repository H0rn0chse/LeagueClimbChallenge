import { startServer, registerXhrHandler } from "@h0rn0chse/socket-server";

import { config } from "./server/config.js";
import { getData } from "./server/leagueHandler.js";

startServer({
    useClientHandler: true
});

registerXhrHandler("get", "/blob", async (req, res) => {
    console.log("handling /blob request");

    const data = await getData();
    data.endDate = new Date(config.endDate).getTime();

    res.json(data);
    res.end();
});
