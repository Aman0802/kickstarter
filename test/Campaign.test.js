const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());

const compiledFactory = require("../ethereum/build/CampaignFactory.json");
const compiledCampaign = require("../ethereum/build/Campaign.json");

let accounts, factory, campaignAddress, campaign;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send({ from: accounts[0], gas: "1000000" });

  await factory.methods.createCampaign("100").send({
    from: accounts[0],
    gas: "1000000",
  });

  [campaignAddress] = await factory.methods.getDeployedCampaigns().call();

  campaign = await new web3.eth.Contract(
    JSON.parse(compiledCampaign.interface),
    campaignAddress
  );
});

describe("Campaign", () => {
  it("deploys a factory and a campaign", () => {
    assert.ok(factory.options.address);
    assert.ok(campaign.options.address);
  });

  it("marks caller the campaign manager", async () => {
    const manager = await campaign.methods.manager().call();
    assert.equal(accounts[0], manager);
  });

  it("allows people to contribute money and mark them as contributors", async () => {
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: web3.utils.toWei("0.2", "ether"),
    });

    const isContributor = await campaign.methods.approvers(accounts[1]).call();

    assert(isContributor);
  });

  it("checks minimum contribution", async () => {
    try {
      await campaign.methods
        .contribute()
        .send({ from: accounts[1], value: "5" });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it("allows a manager to make a payment request", async () => {
    await campaign.methods
      .createRequest("Buy batteries", "100", accounts[1])
      .send({ from: accounts[0], gas: "1000000" });

    const request = await campaign.methods.requests(0).call();

    // just checking the description property to make sure the manager was able to add a request.
    // Assumption is that if one property was added others were added to.
    assert.equal("Buy batteries", request.description);
  });

  it("processes requests", async () => {
    await campaign.methods.contribute().send({
      from: accounts[0],
      value: web3.utils.toWei("10", "ether"),
    });

    await campaign.methods
      .createRequest(
        "Buy Batteries",
        web3.utils.toWei("5", "ether"),
        accounts[1]
      )
      .send({
        from: accounts[0],
        gas: "1000000",
      });

    await campaign.methods.approveRequest(0).send({
      from: accounts[0],
      gas: "1000000",
    });

    await campaign.methods.finalizeRequest(0).send({
      from: accounts[0],
      gas: "1000000",
    });

    let balance = await web3.eth.getBalance(accounts[1]);
    balance = web3.utils.fromWei(balance, "ether");
    balance = parseFloat(balance);

    // ganache does not have a cleanup function so whenever we run previous tests and make payment/gas from there it wont be reset here hence we are saying balance>104. In ideal case it would have been balance == 105.
    assert(balance > 104);
  });
});
