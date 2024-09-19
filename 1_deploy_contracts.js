const FlashLoan = artifacts.require("FlashLoan");
const CTokenStorage = artifacts.require("CTokenStorage");
const StableSwapCompound = artifacts.require("StableSwapCompound");

module.exports = async function (deployer) {
    await deployer.deploy(FlashLoan);
    await deployer.deploy(CTokenStorage);
    await deployer.deploy(StableSwapCompound);
};
