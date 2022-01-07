import fs from "fs";
import path from "path";

const configContent = fs.readFileSync(path.join("./config.json"));
let _config;

try {
    _config = JSON.parse(configContent);
} catch (err) {
    console.error(err);
    _config = {};
}

export const config = _config;
