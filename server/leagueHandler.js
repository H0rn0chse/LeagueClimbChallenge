const dotenv = require("dotenv");

const config = require("../config.json");
const { getRequest } = require("./RequestHelper.js");

// local .env setup
if (process.env.RIOT_APP_TOKEN === undefined) {
    dotenv.config();
}

const cache = {
    summoner: {},
    lastData: {}
};

const riotToken = process.env.RIOT_APP_TOKEN;
const updateDiff = 60*1000 // 1min
let latestUpdate = null;

const tierMap = {
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
    MASTER: {
        name: "Master",
        hasDivisions: false,
        score: 600000,
    },
    GRANDMASTER: {
        name: "Grandmaster",
        hasDivisions: false,
        score: 700000,
    },
    CHALLENGER: {
        name: "Challenger",
        hasDivisions: false,
        score: 800000,
    }
};

divisionMap = {
    "I": {
        score: 100000
    },
    "II": {
        score: 200000
    },
    "II": {
        score: 300000
    },
    "III": {
        score: 400000
    },
    "IV": {
        score: 500000
    },
}

function getSummoner (summonerName, region) {
    let summonerPromise = cache.summoner?.[region]?.[summonerName];
    if (summonerPromise) {
        return summonerPromise;
    }

    const host = `${region.toLowerCase()}.api.riotgames.com`;
    const endpoint = `/lol/summoner/v4/summoners/by-name/${summonerName}`
    summonerPromise = getRequest(host, endpoint, { "X-Riot-Token": riotToken })

    if (!cache.summoner[region]) {
        cache.summoner[region] = {};
    }
    if (!cache.summoner[region][summonerName]) {
        cache.summoner[region][summonerName] = summonerPromise;
    }

    return summonerPromise;
}

async function getStatus (summonerName, region) {

    const info = await getSummoner(summonerName, region);

    const host = `${region.toLowerCase()}.api.riotgames.com`;
    const endpoint = `/lol/league/v4/entries/by-summoner/${info.id}`
    statusPromise = getRequest(host, endpoint, { "X-Riot-Token": riotToken })
        .then(aEntries => {
            return aEntries.filter(entries => {
                return entries.queueType === "RANKED_SOLO_5x5"
            })[0]
        });

    return statusPromise;
}

function getTier (status) {
    let tier = tierMap[status.tier]?.name;

    if (tierMap[status.tier]?.hasDivisions) {
        tier += ` ${status.rank}`;
    }
    return tier;
};

function getScore (status) {
    const tier = tierMap[status.tier];
    const division = divisionMap[status.rank];
    if (!tier || !division) {
        return 0;
    }

    return tier.score + division.score + status.leaguePoints;
}

async function getData () {
    if (latestUpdate && Date.now() - latestUpdate < updateDiff) {
        console.log(`serving from cache: wait ${((updateDiff - (Date.now() - latestUpdate)) / 1000).toFixed(1)} seconds`)
        return cache.lastData;
    }
    latestUpdate = Date.now();
    let status1 = {};
    let status2 = {};

    try {
        status1 = await getStatus(config.summoner1, config.region1);
        status2 = await getStatus(config.summoner2, config.region2);
    } catch (err) {
        console.log("some error occurred");
        console.log(err);
    }

    const data = {
        summoner1: {
            name: config.summoner1,
            league: getTier(status1),
            points: status1.leaguePoints + " LP",
            wins: status1.wins,
            losses: status1.losses,
            score: getScore(status1)
        },
        summoner2: {
            name: config.summoner2,
            league: getTier(status2),
            points: status2.leaguePoints + " LP",
            wins: status2.wins,
            losses: status2.losses,
            score: getScore(status2)
        }
    };
    data.summoner1.lead = data.summoner1.score > data.summoner2.score;
    data.summoner2.lead = data.summoner2.score > data.summoner1.score;
    cache.lastData = data;

    return data;
}

module.exports = {
    getData
};