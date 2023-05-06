const axios = require('axios');
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
  const prizeAmount = isNaN(winnerInfo.prizeAmount) ? "0.0" : (winnerInfo.prizeAmount / 1e18).toFixed(5);
  const arbAmount = isNaN(winnerInfo.arbAmount) ? "0.0" : (winnerInfo.arbAmount / 1e18).toFixed(5);
  //const message = `Win By Random Number: ${winnerInfo.randomNumber.toString()}\nWallet Address: ${winnerInfo.wallet}\nPrize Amount: ${arbAmount} ARB = ${prizeAmount} ETH`;
  const message = `
<b>Get ready to win big!</b> 
The lottery is coming soon, but it hasn't started yet. 
Keep an eye out for updates and be prepared to participate when it opens.`
  ;
   bot.sendMessage(msg.chat.id, message, {parse_mode: "HTML"});
  //bot.sendMessage(msg.chat.id, message);
});

// Handle the /round command
bot.onText(/\/(round|lottery)/, async (msg) => {
  console.log('round/lottery command received'); // Add console.log() statement here
  const contractAddress = '0x6CB0e4dA8F621A3901573bD8c8d2C8A0987d78d6'; // Replace with actual contract address
  const round = await contract._lotteryRound(); // Call _lotteryRound function
    //const message = `Current lottery round: ${round}`;
    const message = `
<b>Get ready to win big!</b> 
The lottery is coming soon, but it hasn't started yet. 
Keep an eye out for updates and be prepared to participate when it opens.`
  ;
   bot.sendMessage(msg.chat.id, message, {parse_mode: "HTML"});
    //bot.sendMessage(msg.chat.id, message);
});


// Handle the /minAmount command
bot.onText(/\/minimum/, async (msg) => {
  const contractAddress = '0x6CB0e4dA8F621A3901573bD8c8d2C8A0987d78d6'; // Replace with actual contract address
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
  const minAmount = await contract._minAmountToParticipate(); // Call _minAmountToParticipate function
    const minAmountInEther = ethers.utils.formatEther(minAmount);
    //const message = `Minimum amount to participate in the lottery: ${minAmountInEther} ETH`;
    const message = `
<b>Get ready to win big!</b> 
The lottery is coming soon, but it hasn't started yet. 
Keep an eye out for updates and be prepared to participate when it opens.`
  ;
   bot.sendMessage(msg.chat.id, message, {parse_mode: "HTML"});
    //bot.sendMessage(msg.chat.id, message);
});

// Handle the /balance command
bot.onText(/\/balance/, async (msg) => {
  console.log('Balance command received'); // Add console.log() statement here
  const walletAddress = "0x087859e91ee03cb339ddd8df8e8f2a0b95fe07d6"; // replace with your desired wallet address
  const balance = await provider.getBalance(walletAddress);
  const formattedBalance = ethers.utils.formatEther(balance);
  //const message = `Lottery Balance Amount: ${formattedBalance} ETH`;
  const message = `
<b>Get ready to win big!</b> 
The lottery is coming soon, but it hasn't started yet. 
Keep an eye out for updates and be prepared to participate when it opens.`
  ;
   bot.sendMessage(msg.chat.id, message, {parse_mode: "HTML"});
                 //bot.sendMessage(msg.chat.id, message);
  return; // Add return statement here to exit the function
});


// Handle the /ca command
bot.onText(/\/(ca|contract)/, async (msg) => {
  console.log('ca command received');
  const walletAddress = "0x087859e91ee03cb339ddd8df8e8f2a0b95fe07d6"; // replace with your desired wallet address
  const message = `
<b>Contract Address:
</b>  <code>${walletAddress}</code>
(Tap To Copy)`;
  bot.sendMessage(msg.chat.id, message, { parse_mode: "HTML" });
});

// Handle the /buy command
bot.onText(/\/(buy|ido|presale|pinksale)/, (msg) => {
  console.log('ca command received');
  const message = `
<b>To buy a $LEPE, please visit one of the following websites:</b>
`;
  const options = {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "💰BUY NOW", url: "https://www.pinksale.finance/launchpad/0x0bcbBCd3186E5d857AF2A4C4A158d5027037032F?chain=Arbitrum" }
        ]
      ]
    }
  };
  bot.sendMessage(msg.chat.id, message, options);
});

// Handle the /start command
bot.onText(/\/start/, async (msg) => {
  const message = `
<b>Hello! Welcome to the $LEPE Lottery bot.</b>

To get help with using the bot, use the /guide command.

<i>You can also visit our website at https://www.luckypepe.io/ for more information and updates.</i>
`;
  bot.sendMessage(msg.chat.id, message, {parse_mode: "HTML"});
});

// Handle the /guide command
bot.onText(/\/(help|guide)/, async (msg) => {
  const message = `
<b>Welcome To $LEPE Lottery bot.</b>

- To get the current lottery amount, use the /balance command.
- To get the current lottery round, use the /round or /lottery command.
- To get the minimum amount of $LEPE required to participate in the lottery, use the /minimum command.
- To get information about a past winner, use the <code>/winner</code> command followed by the round number (e.g. <code>/winner 123</code>).
- To get information about our contract address, use the /ca or /contract command.
- To buy $LEPE, use the /buy command.
- To buy in Presale, use the /ido command.
`;

  const photoUrl = "https://www.luckypepe.io/assets/img/logo/logo.png"; // replace with your photo URL
  const options = {
    parse_mode: "HTML",
    caption: message,
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Visit our website", url: "https://www.luckypepe.io/" }
        ]
      ]
    }
  };

  bot.sendPhoto(msg.chat.id, photoUrl, options);
});

// Handle other messages
bot.on('message', (msg) => {
  const unrecognizedCommands = ['/balance', '/winner', '/start', '/round', '/minimum', '/price', '/ca','/contract', '/guide','/help','/buy','/presale','/ido','/pinksale','/lottery' ];
  const command = msg.text.split(' ')[0];
  if (!unrecognizedCommands.includes(command)) {
    bot.sendMessage(msg.chat.id, 'Oops! I did not understand that. To get started, use the /start or /help command.');
  }
});

module.exports = bot;