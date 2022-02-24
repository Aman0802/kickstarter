import web3 from "./web3";
import CampaignFactory from "./build/CampaignFactory.json";

const instance = new web3.eth.Contract(
  JSON.parse(CampaignFactory.interface),
  "0x00E4Ead9557433Bc55E6246Dc4df314B7B71ca1f"
);

export default instance;
