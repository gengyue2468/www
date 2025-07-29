const fs = require("fs");
const path = require("path");
const time = new Date().toISOString();
fs.writeFileSync(
  path.join(__dirname, "public", "deploy-time.json"),
  JSON.stringify({ deployTime: time })
);
