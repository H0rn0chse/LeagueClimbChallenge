
function handleGetRequest (req, res, next) {
    switch (req.url) {
        case "/blob":
                console.log("request got in");
                res.end(JSON.stringify({ id: "some data" }));
            	break;
        default:
            console.log(`handler could not match the request ${req.url}`)
            next();
    }
}

module.exports = {
    handleGetRequest: handleGetRequest
}