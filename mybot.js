const TelegramBot = require('node-telegram-bot-api');
const ethers = require('ethers');
const { providers } = require('ethers');

// Set up provider and contract objects
const provider = new providers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');
const contractAddress = process.env.CONTRACT_ADDRESS;
const contractABI = require('./contractABI');
const contract = new ethers.Contract(contractAddress, contractABI, provider);

// Create the Telegram bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Handle the /winner command
bot.onText(/\/winner (.+)/, async (msg, match) => {
  const round = match[1];
  const winnerInfo = await contract.lotteryWinnerInfo(round);
  const prizeAmount = (winnerInfo.prizeAmount / 1e18).toFixed(5);
  const message = `Win By Random Number: ${winnerInfo.randomNumber.toString()}\nWallet Address: ${winnerInfo.wallet}\nPrize Amount: ${prizeAmount} ETH`;
  bot.sendMessage(msg.chat.id, message);
});

// Handle the /balance command
bot.onText(/\/balance/, async (msg) => {
  console.log('Balance command received'); // Add console.log() statement here
  const walletAddress = "0x61a02472f539c316c73d3da32155a85a26435973"; // replace with your desired wallet address
  const balance = await provider.getBalance(walletAddress);
  const formattedBalance = ethers.utils.formatEther(balance);
  const message = `Lottery Balance Amount: ${formattedBalance} ETH`;
  bot.sendMessage(msg.chat.id, message);
  return; // Add return statement here to exit the function
});

// Handle the /start command
bot.onText(/\/start/, async (msg) => {
  const message = `Hello! Welcome to the Lottery bot. To get the current lottery amount, use the /balance command. To get information about a past winner, use the /winner command followed by the round number (e.g. /winner 123).`;
  bot.sendMessage(msg.chat.id, message);
});

// Handle other messages
bot.on('message', (msg) => {
  const unrecognizedCommands = ['/balance', '/winner', '/start'];
  const command = msg.text.split(' ')[0];
  if (!unrecognizedCommands.includes(command)) {
    bot.sendMessage(msg.chat.id, 'Oops! I did not understand that. To get started, use the /start command.');
  }
});

module.exports = bot;