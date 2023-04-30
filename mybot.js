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

// Handle the /round command
bot.onText(/\/round/, async (msg) => {
  const contractAddress = '0x7F6228DdA3F9ea6B4beAa24181bf95B2F4a29dB8'; // Replace with actual contract address
  const round = await contract._lotteryRound(); // Call _lotteryRound function
    const message = `Current lottery round: ${round}`;
    bot.sendMessage(msg.chat.id, message);
  } catch (error) {
    console.error(`Error retrieving current lottery round: ${error}`);
    bot.sendMessage(msg.chat.id, 'Oops! Something went wrong. Please try again later.');
  }
});


// Handle the /minAmount command
bot.onText(/\/minAmount/, async (msg) => {
  const contractAddress = '0x7F6228DdA3F9ea6B4beAa24181bf95B2F4a29dB8'; // Replace with actual contract address
  const contractABI = [
    {
      "inputs": [],
      "name": "_minAmountToParticipate",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];
  const contract = new ethers.Contract(contractAddress, contractABI, provider);

  try {
    const minAmount = await contract._minAmountToParticipate(); // Call _minAmountToParticipate function
    const message = `Minimum amount to participate in the lottery: ${minAmount}`;
    bot.sendMessage(msg.chat.id, message);
  } catch (error) {
    console.error(`Error retrieving minimum amount to participate: ${error}`);
    bot.sendMessage(msg.chat.id, 'Oops! Something went wrong. Please try again later.');
  }
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
  const message = `
<b>Hello! Welcome to the Lottery bot.</b>

To get the current lottery amount, use the <code>/balance</code> command. 

To get information about a past winner, use the <code>/winner</code> command followed by the round number (e.g. <code>/winner 123</code>).

<i>You can also visit our website at https://www.example.com/lottery for more information and updates.</i>
`;
  bot.sendMessage(msg.chat.id, message, {parse_mode: "HTML"});
});

// Handle other messages
bot.on('message', (msg) => {
  const unrecognizedCommands = ['/balance', '/winner', '/start', '/round'];
  const command = msg.text.split(' ')[0];
  if (!unrecognizedCommands.includes(command)) {
    bot.sendMessage(msg.chat.id, 'Oops! I did not understand that. To get started, use the /start command.');
  }
});

module.exports = bot;