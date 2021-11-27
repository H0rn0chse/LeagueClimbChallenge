import { getData } from "./request.js";

async function update () {
    const data = await getData();
    console.log(data);
}

const updateButton = document.querySelector("#btnUpdate");
updateButton.addEventListener("click", (evt) => {
    update();
});
