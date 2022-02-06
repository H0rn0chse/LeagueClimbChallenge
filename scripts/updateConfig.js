/**
 * @fileoverview Builds the config by extending the participants with their stable ids
 * This can be executed when updating summoners of the config
 */

import fs from "fs";
import path from "path";
import { config } from "../server/config.js";
import { getSummonerIds } from "../server/leagueHandler.js";

const promises = config.participants.map(async (data) => {
    if (data.summonerId && data.accountId && data.puuid) {
        return;
    }

    const result = await getSummonerIds(data.summonerName);
    data.summonerId = result.id;
    data.accountId = result.accountId;
    data.puuid = result.puuid;
});

Promise.all(promises)
    .then(() => {
        const configString = JSON.stringify(config, null, 4);
        fs.writeFileSync(path.join("./config.json"), configString);

        console.log("updated config successfully");
    });
