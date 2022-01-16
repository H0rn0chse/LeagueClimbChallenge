const container = document.querySelector("#countdown");
let timer;

export function init (endDate) {
    if (timer) {
        clearInterval(timer);
    }

    updateTime(endDate - Date.now());

    timer = setInterval(() => {
        updateTime(endDate - Date.now());
    }, 1000 * 60);
}

function updateTime (diff) {
    let seconds = Math.floor(diff / 1000);
    const nbsp = String.fromCharCode(160);

    const daysRemaining = Math.floor(((seconds / 60) / 60) / 24);
    const daysText = daysRemaining ? `${daysRemaining.toString().padStart(2, nbsp)}<small>T</small> ` : "";
    seconds = seconds - (daysRemaining * 60 * 60 * 24);

    const hoursRemaining = Math.floor((seconds / 60) / 60);
    const showHours = daysRemaining || hoursRemaining;
    const hoursText =  showHours ? `${hoursRemaining.toString().padStart(2, nbsp)}<small>h</small> ` : "";
    seconds = seconds - (hoursRemaining * 60 * 60);

    const minsRemaining = Math.floor(seconds / 60);
    const showMins = showHours || minsRemaining;
    const minsText = showMins ? `${minsRemaining.toString().padStart(2, nbsp)}<small>min</small> ` : "";
    seconds = seconds - (minsRemaining * 60);

    /*const secsRemaining = Math.floor(seconds);
    const showSecs = showMins || secsRemaining;
    const secsText = showSecs ? `${secsRemaining.toString().padStart(2, nbsp)}<small>sek</small>` : "";
    */

    container.innerHTML = `${daysText}${hoursText}${minsText}`;
}
