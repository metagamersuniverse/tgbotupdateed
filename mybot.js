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

async function getDexscreenerData() {
  const response = await axios.get('https://api.dexscreener.com/latest/dex/pairs/arbitrum/0xbf28fc1d36478c562ef25ab7701bd6f72f0d48b9,0xBF28FC1D36478C562ef25aB7701bd6f72f0d48B9');
  const data = response.data;
  const pair = data.pairs[0];
  const price = pair.priceUsd;
  const priceChange1h = pair.priceChange.h1;
  const priceChange24h = pair.priceChange.h24;
  const volume24h = pair.volume.h24;
  const liquidity = pair.liquidity.usd;
  const marketCap = pair.fdv;
  const buyers24h = pair.txns.h24.buys;
  const sellers24h = pair.txns.h24.sells;
  return {
    symbol: pair.baseToken.symbol,
    name: pair.baseToken.name,
    chainId: pair.chainId.toUpperCase(),
    price: `$${price}`,
    priceChange1h: `${priceChange1h.toFixed(2)}%`,
    priceChange24h: `${priceChange24h.toFixed(2)}%`,
    volume24h: `$${volume24h.toLocaleString()}`,
    liquidity: `$${liquidity.toLocaleString()}`,
    marketCap: `$${marketCap.toLocaleString()}`,
    buyers24h: buyers24h,
    sellers24h: sellers24h
  };
}

bot.onText(/\/price/, async (msg) => {
  console.log('Price command received');
  const data = await getDexscreenerData();
  const message = `
💰 ${data.symbol} Price: ${data.price}
⚡ Name: ${data.name}
⚡ Network: ${data.chainId}
📈 1h: ${data.priceChange1h}
📈 24h: ${data.priceChange24h}
📊 Volume: ${data.volume24h}
👥 24h Total Buyers: ${data.buyers24h}
👥 24h Total Sellers: ${data.sellers24h}
💦 Liquidity: ${data.liquidity}
💎 Market Cap (FDV): ${data.marketCap}`;
  
  // Add the "refresh" button to the message
  message += "\n\nPress the 'Refresh' button to update this information";
  bot.sendMessage(msg.chat.id, message, {
    reply_markup: {
      inline_keyboard: [
        [{
          text: 'Refresh',
          callback_data: 'refresh'
        }]
      ]
    }
  });
});

// Handle the callback query from the "refresh" button
bot.on('callback_query', async (query) => {
  if (query.data === 'refresh') {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const newData = await getDexscreenerData();
    const newMessage = `
💰 ${newData.symbol} Price: ${newData.price}
⚡ Name: ${newData.name}
⚡ Network: ${newData.chainId}
📈 1h: ${newData.priceChange1h}
📈 24h: ${newData.priceChange24h}
📊 Volume: ${newData.volume24h}
👥 24h Total Buyers: ${newData.buyers24h}
👥 24h Total Sellers: ${newData.sellers24h}
💦 Liquidity: ${newdata.liquidity}
💎 Market Cap (FDV): ${newData.marketCap}`;
bot.editMessageText(newMessage, {
chat_id: chatId,
message_id: messageId
});




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
bot.onText(/\/round/, async (msg) => {
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

// Handle the /start command
bot.onText(/\/start/, async (msg) => {
  const message = `
<b>Hello! Welcome to the Lottery bot.</b>

To get the current lottery amount, use the <code>/balance</code> command. 

To get information about a past winner, use the <code>/winner</code> command followed by the round number (e.g. <code>/winner 123</code>).

<i>You can also visit our website at https://www.luckypepe.io/ for more information and updates.</i>
`;
  bot.sendMessage(msg.chat.id, message, {parse_mode: "HTML"});
});

// Handle other messages
bot.on('message', (msg) => {
  const unrecognizedCommands = ['/balance', '/winner', '/start', '/round', '/minimum', '/price', ];
  const command = msg.text.split(' ')[0];
  if (!unrecognizedCommands.includes(command)) {
    bot.sendMessage(msg.chat.id, 'Oops! I did not understand that. To get started, use the /start command.');
  }
});

module.exports = bot;