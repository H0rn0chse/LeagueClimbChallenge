import { init as initCountdown } from "./Countdown.js";
import { request } from "./socket-server/handler.js";

const { alertify } = globalThis;

const LOCAL_STORAGE_KEY = "LeagueClimbChallengeData";

async function fetchData () {
    const data = await request("GET", "/blob");
    console.log(data);
    saveToLocalStorage(data);
    return data;
}

function saveToLocalStorage (data) {
    let json;
    try {
        json = JSON.stringify(data);
        localStorage.setItem(LOCAL_STORAGE_KEY, json);
    } catch (err) {
        console.error("Could not save to localStorage", err);
    }
}

function fetchFromLocalStorage () {
    let data;
    const json = localStorage.getItem(LOCAL_STORAGE_KEY);
    try {
        data = JSON.parse(json);
    } catch (err) {
        data = null;
    }
    return data;
}

function updateDOM (data) {
    if (!data) {
        return;
    }

    const container = document.querySelector("#app");
    container.innerHTML = "";

    data.participants.forEach((player, index) => {
        const node = document.createElement("div");
        node.classList.add("box");

        const userName = document.createElement("h1");
        userName.innerHTML = `<span class="rank">${index + 1}. </span>${player.name}`;
        node.appendChild(userName);

        const globalRank = player.rank > 0 ? `${player.rank}. ` : "";
        const league = document.createElement("h2");
        league.innerHTML = `<small>${globalRank}</small>${player.league} ${player.points}`;
        node.appendChild(league);

        let ratio = 0;
        if (player.losses + player.wins > 0) {
            ratio = player.wins / (player.losses + player.wins) * 100;
        }
        const stats = document.createElement("p");
        const games = `${player.wins + player.losses}<small>Games</small>`;
        const winRate = `${ratio > 0 ? ratio.toFixed(1) : ratio.toFixed(0)}<small>%</small>`;
        const winLoose = `<span class="green">${player.wins}<small>W</small></span> <span class="red">${player.losses}<small>L</small></span>`;
        stats.innerHTML = `${games} ${winRate} ${winLoose}`;
        node.appendChild(stats);

        container.appendChild(node);
    });

    initCountdown(data.endDate);
}

function fetchAndUpdate () {
    return fetchData()
        .then(updateDOM);
}

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
        await fetchAndUpdate();
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

// First try to update from localStorage
updateButton.setAttribute("disabled", "");
updateDOM(fetchFromLocalStorage());
// Second fetch new data from server
fetchAndUpdate()
    .catch(console.error)
    .finally(() => {
        updateButton.removeAttribute("disabled");
    });
