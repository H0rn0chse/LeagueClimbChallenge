import { getData } from "./request.js";

console.log("start fetching data");
getData().then((data) => {
    console.log("got some data");
    console.log(data);
})
console.log("still fetching data");

const updateButton = document.querySelector("#btnUpdate");
updateButton.addEventListener("click", (evt) => {
    alert("should update");
});
