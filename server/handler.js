const { getData } = require("./leagueHandler.js");
const config = require("../config.json");

async function handleGetRequest (req, res, next) {
    switch (req.url) {
        case "/blob":
                console.log("handling /blob request");

                const data = await getData();
                data.endDate = config.endDateEpoch;

                res.end(JSON.stringify(data));

            	break;
        default:
            console.log(`handler could not match the request ${req.url}`)
            next();
    }
}

module.exports = {
    handleGetRequest
}