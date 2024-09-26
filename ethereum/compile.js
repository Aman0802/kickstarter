const path = require("path");
const solc = require("solc");
const fs = require("fs-extra");
const crypto = require("crypto");

const buildPath = path.resolve(__dirname, "build");
fs.removeSync(buildPath);

const campaignPath = path.resolve(__dirname, "contracts", "Campaign.sol");
const source = fs.readFileSync(campaignPath, "utf8");
const output = solc.compile(source, 1).contracts;

fs.ensureDirSync(buildPath);

for (let contract in output) {
  const id = crypto.randomUUID();
  const joinedPath = path.join(buildPath, id);
  const fullPath = path.normalize(joinedPath);
  if (!fullPath.startsWith(buildPath)) {
      console.log("Invalid path specified!");
      continue;
  }
  fs.outputJSONSync(
    path.resolve(buildPath, `${id}.json`),
    output[contract]
  );
}