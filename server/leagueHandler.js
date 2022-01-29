import dotenv from "dotenv";

import { getRequest } from "./RequestHelper.js";
import { config } from "./config.js";

// local .env setup
if (process.env.RIOT_APP_TOKEN === undefined) {
    dotenv.config();
}

const cache = {
    summoner: {},
    lastData: {}
};

const riotToken = process.env.RIOT_APP_TOKEN;
const updateDiff = 60*1000; // 1min
let latestUpdate = null;

const tierMap = {
    UNRANKED: {
        name: "Unranked",
        hasDivisions: false,
        score: 0,
    },
    IRON: {
        name: "Iron",
        hasDivisions: true,
        score: 100000,
    },
    BRONZE: {
        name: "Bronze",
        hasDivisions: true,
        score: 200000,
    },
    SILVER: {
        name: "Silver",
        hasDivisions: true,
        score: 300000,
    },
    GOLD: {
        name: "Gold",
        hasDivisions: true,
        score: 400000,
    },
    PLATINUM: {
        name: "Platinum",
        hasDivisions: true,
        score: 500000,
    },
    DIAMOND: {
        name: "Diamond",
        hasDivisions: true,
        score: 600000,
    },
    MASTER: {
        name: "Master",
        hasDivisions: false,
        score: 700000,
    },
    GRANDMASTER: {
        name: "Grandmaster",
        hasDivisions: false,
        score: 800000,
    },
    CHALLENGER: {
        name: "Challenger",
        hasDivisions: false,
        score: 900000,
    }
};

const divisionMap = {
    "I": {
        score: 100000
    },
    "II": {
        score: 200000
    },
    "III": {
        score: 300000
    },
    "IV": {
        score: 400000
    },
    "V": {
        score: 500000
    },
};

const REGION = config.region;
const QUEUE_TYPE = config.queueType;

/**
 * Fetches the summoner id by name
 * @param {string} summonerName
 * @returns {Promise{object}} Resolves object containing the id
 */
function getSummoner (summonerName) {
    let summonerPromise = cache.summoner?.[summonerName];
    if (summonerPromise) {
        return summonerPromise;
    }

    const host = `${REGION.toLowerCase()}.api.riotgames.com`;
    const endpoint = `/lol/summoner/v4/summoners/by-name/${summonerName}`;
    summonerPromise = getRequest(host, endpoint, { "X-Riot-Token": riotToken });

    if (!cache.summoner[summonerName]) {
        cache.summoner[summonerName] = summonerPromise;
    }
    return summonerPromise;
}

let ladderCachePromise;
/**
 * Fetches and chaches the ladder rank and
 * @param {string} summonerId
 */
async function getLadderRank (summonerId) {
    if (ladderCachePromise) {
        const ladder = await ladderCachePromise;
        return ladder[summonerId] || -1;
    }

    const host = `${REGION.toLowerCase()}.api.riotgames.com`;
    const endpoint = `/lol/league/v4/challengerleagues/by-queue/${QUEUE_TYPE}`;
    ladderCachePromise = getRequest(host, endpoint, { "X-Riot-Token": riotToken })
        .then((data) => {
            const dict = {};
            data.entries
                .sort((playerA, playerB) => {
                    return playerB.leaguePoints - playerA.leaguePoints;
                })
                .forEach((entry, index) => {
                    dict[entry.summonerId] = index + 1;
                });

            return dict;
        });

    return getLadderRank(summonerId);
}

/**
 * clears the ladder cache
 */
function clearLadderCache () {
    ladderCachePromise = null;
}

/**
 * Fetches informations about the current rank
 * @param {string} summonerName
 * @returns {Promise{object}} Resolves information object
 */
async function getStatus (summonerName) {

    const info = await getSummoner(summonerName);
    const ladderRank = await getLadderRank(info.id);

    const host = `${REGION.toLowerCase()}.api.riotgames.com`;
    const endpoint = `/lol/league/v4/entries/by-summoner/${info.id}`;
    const statusPromise = getRequest(host, endpoint, { "X-Riot-Token": riotToken })
        .then((entries = []) => {
            const rankedEntry = entries.filter(entries => {
                return entries.queueType === QUEUE_TYPE;
            })[0];
            if (!rankedEntry) {
                return {
                    tier: "UNRANKED",
                    rank: "I",
                    leaguePoints: 0
                };
            }
            rankedEntry.ladderRank = ladderRank;
            return rankedEntry;
        });

    return statusPromise;
}

function getTier (status) {
    let tier = tierMap[status.tier]?.name;

    if (tierMap[status.tier]?.hasDivisions) {
        tier += ` ${status.rank}`;
    }
    return tier;
}

function getScore (status) {
    const tier = tierMap[status.tier];
    const division = divisionMap[status.rank];
    if (!tier || !division) {
        return 0;
    }

    return tier.score + division.score + status.leaguePoints;
}

export async function getData () {
    if (latestUpdate && Date.now() - latestUpdate < updateDiff) {
        console.log(`serving from cache: wait ${((updateDiff - (Date.now() - latestUpdate)) / 1000).toFixed(1)} seconds`);
        return cache.lastData;
    }
    latestUpdate = Date.now();

    const data = {
        participants: []
    };

    clearLadderCache();

    await config.participants.reduce(async (promise, player) => {
        await promise;
        try {
            const status = await getStatus(player.summonerName);

            const playerData = {
                name: player.name,
                league: getTier(status),
                points: (status.leaguePoints ?? 0) + " LP",
                wins: status.wins ?? 0,
                losses: status.losses ?? 0,
                score: getScore(status) ?? 0,
                rank: status.ladderRank
            };
            data.participants.push(playerData);
        } catch (err) {
            console.log("some error occurred");
            console.log(err);
        }
    }, Promise.resolve());

    data.participants.sort((playerA, playerB) => {
        return playerB.score - playerA.score;
    });

    cache.lastData = data;

    return data;
}
