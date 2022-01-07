import { request } from "./socket-server/handler.js";

const { alertify } = globalThis;

async function update () {
    const data = await request("GET", "/blob");
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
        let ratio = 0;
        if (userData.losses + userData.wins > 0) {
            ratio = userData.wins / (userData.losses + userData.wins) * 100;
        }
        info.innerText = `${userData.wins}W/${userData.losses}L (${ratio > 0 ? ratio.toFixed(1) : ratio.toFixed(0)}%)`;
    });

    const msRemaining = data.endDate - Date.now();
    const daysRemaining = Math.floor((((msRemaining / 1000) / 60) / 60) / 24);
    document.querySelector("#daysRemaining").innerText = daysRemaining;
}

update()
    .catch(console.error);

const updateButton = document.querySelector("#btnUpdate");
updateButton.addEventListener("click", async (evt) => {
    let timer;
    const busyContainer = document.querySelector("#busyContainer");
    try {
        updateButton.setAttribute("disabled", "");
        timer = setTimeout(() => {
            // SetBusy
            busyContainer.style.display = "";
        }, 800);
        await update();
        alertify.success("Updated");
    } catch (err) {
        console.error(err);
        alertify.error("Some error occurred");
    } finally {
        updateButton.removeAttribute("disabled");
        clearTimeout(timer);
        busyContainer.style.display = "none";
    }
});
