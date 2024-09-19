const ethers = require('ethers');
const axios = require('axios');
require('dotenv').config();

const FlashLoanABI = require('../build/contracts/FlashLoan.json');

// Binance Smart Chain provider
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const flashLoanContract = new ethers.Contract(process.env.FLASHLOAN_CONTRACT, FlashLoanABI.abi, wallet);

// Gas and transaction monitoring metrics
let gasLimitBuffer = ethers.BigNumber.from("100000"); // Buffer to prevent out-of-gas issues

// Function to fetch real-time price of BNB (for monitoring purposes)
async function getBNBPrice() {
    try {
        const response = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT');
        return parseFloat(response.data.price);
    } catch (error) {
        console.error("Error fetching BNB price:", error);
        return 0;
    }
}

// Function to get the current wallet balance and display it in a human-readable format
async function getWalletBalance() {
    const balance = await wallet.getBalance();
    return ethers.utils.formatUnits(balance, 18); // Balance in BNB
}

// Function to get current gas price from the network
async function getCurrentGasPrice() {
    return await provider.getGasPrice();
}

// Monitoring function to ensure we are not being front-run (simple slippage protection)
async function checkSlippageProtection(transactionGasPrice) {
    const currentGasPrice = await getCurrentGasPrice();
    if (currentGasPrice.gt(transactionGasPrice)) {
        console.log("⚠️ Potential front-running detected! Canceling transaction.");
        return false;
    }
    return true;
}

// Telegram message function to send notifications
async function sendTelegramMessage(message) {
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    const payload = { chat_id: process.env.TELEGRAM_CHAT_ID, text: message };
    await axios.post(url, payload).catch((error) => console.error("Telegram error:", error));
}

// Execute flash loan with additional metrics and monitoring
async function executeFlashLoan(amount) {
    try {
        const gasPrice = await getCurrentGasPrice();
        const walletBalance = await getWalletBalance();
        const bnbPrice = await getBNBPrice();
        
        console.log(`💼 Wallet Balance: ${walletBalance} BNB`);
        console.log(`📈 Current BNB Price: ${bnbPrice} USDT`);
        console.log(`⛽ Current Gas Price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`);

        // Front-running protection (checking slippage)
        if (!(await checkSlippageProtection(gasPrice))) {
            console.log("⚠️ Transaction aborted due to gas price hike.");
            await sendTelegramMessage("⚠️ Transaction aborted due to potential front-running.");
            return;
        }

        const tx = await flashLoanContract.executeFlashLoan(process.env.TOKEN_ADDRESS, amount, {
            gasPrice,
            gasLimit: ethers.BigNumber.from("500000").add(gasLimitBuffer), // Ensure gas limit buffer
        });

        console.log("🚀 FlashLoan transaction sent, awaiting confirmation...");

        const receipt = await tx.wait();
        const updatedBalance = await wallet.getBalance();

        const netProfit = ethers.utils.formatUnits(updatedBalance.sub(amount), 18); // Assuming simple profit calculation

        // Send successful trade info to Telegram
        const message = `
        🎉 Successful Trade!
        💰 Investment: ${ethers.utils.formatUnits(amount, 18)} BNB
        📈 Profit: ${netProfit.toFixed(6)} BNB
        💼 Wallet Balance: ${ethers.utils.formatUnits(updatedBalance, 18)} BNB
        ⛽ Gas Price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei
        🔗 Transaction: https://bscscan.com/tx/${tx.hash}
        `;
        await sendTelegramMessage(message);

        console.log("FlashLoan executed successfully and Telegram notified!");

    } catch (error) {
        console.error("Execution error:", error);
        await sendTelegramMessage(`❌ Error during FlashLoan execution: ${error.message}`);
    }
}

// Monitoring function to check overall bot health
async function monitorBotHealth() {
    const walletBalance = await getWalletBalance();
    const gasPrice = await getCurrentGasPrice();
    const bnbPrice = await getBNBPrice();

    const monitoringMessage = `
    🔍 Bot Monitoring:
    💼 Wallet Balance: ${walletBalance} BNB
    ⛽ Current Gas Price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei
    📈 BNB Price: ${bnbPrice} USDT
    `;

    console.log(monitoringMessage);
    await sendTelegramMessage(monitoringMessage);
}

async function main() {
    console.log("🚀 Starting FlashLoan Arbitrage Bot...");

    const amount = ethers.utils.parseUnits("1", 18); // Example: 1 BNB

    // Monitoring before the trade
    await monitorBotHealth();

    // Execute Flash Loan and Arbitrage
    await executeFlashLoan(amount);
}

// Schedule monitoring every 5 minutes (adjust as needed)
setInterval(monitorBotHealth, 5 * 60 * 1000);

main().catch(console.error);
