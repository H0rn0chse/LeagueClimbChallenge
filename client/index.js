import { request } from "./socket-server/handler.js";

const { alertify } = globalThis;

async function update () {
    const data = await request("GET", "/blob");
    console.log(data);

    const container = document.querySelector("#app");
    container.innerHTML = "";

    data.participants.forEach((player, index) => {
        const node = document.createElement("div");
        node.classList.add("box");

        const userName = document.createElement("h1");
        userName.innerHTML = `<span class="rank">${index + 1}. </span>${player.name}`;
        node.appendChild(userName);

        const league = document.createElement("h2");
        league.innerText = `${player.league} ${player.points}`;
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
