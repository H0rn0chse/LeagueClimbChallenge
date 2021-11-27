import { getData } from "./request.js";

async function update () {
    const data = await getData();
    console.log(data);

    const map = {
        "userName": "name",
        "league": "league",
        "points": "points"
    };

    const users = {
        "1": "left",
        "2": "right"
    };

    // set data
    Object.keys(users).forEach((identifier) => {
        const containerId = users[identifier];
        const container = document.querySelector(`#${containerId}`);
        const userData = data[`summoner${identifier}`];

        Object.keys(map).forEach(key => {
            const value = map[key];
            const elem = document.querySelector(`#${key}${identifier}`);
            if (!elem) {
                return;
            }
            elem.innerText = userData[value];
        });

        if (userData.lead) {
            container.classList.add("lead");
        } else {
            container.classList.remove("lead");
        }

        const info = document.querySelector(`#info${identifier}`);
        const ratio = userData.wins / (userData.losses + userData.wins) * 100;
        info.innerText = `${userData.wins}W/${userData.losses}L (${ratio.toFixed(1)}%)`
    })
}

update();

const updateButton = document.querySelector("#btnUpdate");
updateButton.addEventListener("click", (evt) => {
    update();
});
