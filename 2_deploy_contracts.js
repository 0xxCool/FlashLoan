const FlashLoan = artifacts.require("FlashLoan");

module.exports = async function (deployer) {
  await deployer.deploy(
    FlashLoan,
    process.env.FLASH_LENDER_ADDRESS,
    process.env.STABLE_SWAP_ADDRESS,
    process.env.COMPTROLLER_ADDRESS,
    process.env.CTOKEN_STORAGE_ADDRESS
  );
};
