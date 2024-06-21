const Faucet = artifacts.require("Faucet");

module.exports = function(_deployer) {
  _deployer.deploy(Faucet);
};
