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
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true, debug: true });

// Handle the /winner command
bot.onText(/\/winner (.+)/, async (msg, match) => {
  const round = match[1];
  const winnerInfo = await contract.lotteryWinnerInfo(round);
  if (winnerInfo.wallet === "0x0000000000000000000000000000000000000000") {
    const message = `🎉 Round ${round} of the $LEPE Lottery hasn't completed yet. Please be patient! 🎉`;
    bot.sendMessage(msg.chat.id, message, { reply_to_message_id: msg.message_id });
  } else {
    console.log(`Fetching winner info for round ${round}...`);
    const prizeAmount = isNaN(winnerInfo.prizeAmount) ? "0.0" : (winnerInfo.prizeAmount / 1e18).toFixed(5);
    const arbAmount = isNaN(winnerInfo.arbAmount) ? "0.0" : (winnerInfo.arbAmount / 1e18).toFixed(5);
    const walletLink = `https://arbiscan.io/address/${winnerInfo.wallet}`; // create link to wallet address
    const message = `🎉 Round ${round} of the $LEPE Lottery has ended! 🎉\n\nHere are the details of the win:\nWin By Random Number: ${winnerInfo.randomNumber.toString()}\nWallet Address: <a href="${walletLink}">${winnerInfo.wallet}</a>\nPrize Amount: ${arbAmount} ARB = ${prizeAmount} ETH`;
    bot.sendMessage(msg.chat.id, message, { parse_mode: "HTML", disable_web_page_preview: true, reply_to_message_id: msg.message_id }); // set parse_mode to HTML and disable preview
  }
});


// Handle the /round command
bot.onText(/\/(round|lottery)/, async (msg) => {
  console.log('round/lottery command received'); // Add console.log() statement here
  const contractAddress = '0x6CB0e4dA8F621A3901573bD8c8d2C8A0987d78d6'; // Replace with actual contract address
  const round = await contract._lotteryRound(); // Call _lotteryRound function
  bot.sendMessage(msg.chat.id, message);
});

// Handle the /minimum command
bot.onText(/\/minimum/, async (msg) => {
  console.log('minimum command received');
  const contractAddress = '0x6CB0e4dA8F621A3901573bD8c8d2C8A0987d78d6';
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
    },
    {
      "inputs": [],
      "name": "_lotteryExecuteAmount",
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
  const minAmount = await contract._minAmountToParticipate();
  const minAmountInEther = ethers.utils.formatEther(minAmount);
  const winningAmount = await contract._lotteryExecuteAmount();
  const winningAmountInEther = ethers.utils.formatEther(winningAmount);

  // Retrieve arbitrage price from the API
  const pairAddress = '0xC6F780497A95e246EB9449f5e4770916DCd6396A';
  const apiEndpoint = `https://api.dexscreener.com/latest/dex/pairs/arbitrum/${pairAddress}`;
  const response = await axios.get(apiEndpoint);
  console.log(response.data);
  const data = response.data;
  const priceNative = parseFloat(data.pairs[0].priceNative); // Get the price of the token in the trading pair
  const arbitrageAmount = winningAmountInEther / priceNative; // Calculate the arbitrage amount in ARB

  const message = `Minimum amount to participate in the lottery: ${minAmountInEther} LEPE\nWinning amount is: ${winningAmountInEther} ETH = ${arbitrageAmount.toFixed(2)} ARB`;
  bot.sendMessage(msg.chat.id, message);
});


// Handle the /balance command
bot.onText(/\/balance/, async (msg) => {
  console.log('Balance command received'); // Add console.log() statement here
  const walletAddress = "0x087859e91ee03cb339ddd8df8e8f2a0b95fe07d6"; // replace with your desired wallet address
  const balance = await provider.getBalance(walletAddress);
  const formattedBalance = ethers.utils.formatEther(balance);
  const message = `Lottery Balance Amount: ${formattedBalance} ETH`;
  bot.sendMessage(msg.chat.id, message);
  return; // Add return statement here to exit the function
});

// Handle the /bido command
bot.onText(/\/b/, async (msg) => {
  console.log('bido command received');

  // Retrieve Ido balance in ETH
  const walletAddress = '0x0bcbbcd3186e5d857af2a4c4a158d5027037032f'; // Replace with your desired wallet address
  const balanceInWei = await provider.getBalance(walletAddress);
  const balanceInEth = ethers.utils.formatEther(balanceInWei);

  // Retrieve ARB price from the API
  const pairAddress = '0xC6F780497A95e246EB9449f5e4770916DCd6396A';
  const apiEndpoint = `https://api.dexscreener.com/latest/dex/pairs/arbitrum/${pairAddress}`;
  const response = await axios.get(apiEndpoint);
  console.log(response.data);
  const data = response.data;
  const priceNative = parseFloat(data.pairs[0].priceNative); // Get the price of the token in the trading pair

  // Calculate balance in ARB
  const balanceInArb = (balanceInEth / priceNative).toFixed(2);

  const message = `Ido : ${balanceInEth} ETH = ${balanceInArb} ARB`;
  bot.sendMessage(msg.chat.id, message);
  return;
});



// Handle the /bido command
bot.onText(/\/bido/, async (msg) => {
  console.log('bido command received'); // Add console.log() statement here
  const walletAddress = "0x0bcbbcd3186e5d857af2a4c4a158d5027037032f"; // replace with your desired wallet address
  const balance = await provider.getBalance(walletAddress);
  const formattedBalance = ethers.utils.formatEther(balance);
  const message = `Ido : ${formattedBalance} ETH`;
  bot.sendMessage(msg.chat.id, message);
  return; // Add return statement here to exit the function
});
// Handle the /ca command
bot.onText(/\/(ca|contract)/, async (msg) => {
  console.log('ca/contract command received');
  const walletAddress = "0x6CB0e4dA8F621A3901573bD8c8d2C8A0987d78d6"; // replace with your desired wallet address
  const message = `
<b>Contract Address:
</b>  <code>${walletAddress}</code>
(Tap To Copy)`;
  bot.sendMessage(msg.chat.id, message, { parse_mode: "HTML" });
});

// Handle the /buy command
bot.onText(/\/(buy|ido|presale|pinksale)/, (msg) => {
  console.log('buy/ido/presale/pinksale command received');
  const message = `
<b>To buy a $LEPE, please visit one of the following websites:</b>

<b>Presale is running...</b>

- Presale Start Time - 2023.05.09 03:00 (UTC)
- Presale End Time - 2023.05.10 03:00 (UTC)
- Launch Time - 2023.05.10 03:10 (UTC)
`;
  const options = {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "💰BUY ON PRESALE", url: "https://www.pinksale.finance/launchpad/0x0bcbBCd3186E5d857AF2A4C4A158d5027037032F?chain=Arbitrum" }
        ]
      ]
    }
  };
  bot.sendMessage(msg.chat.id, message, options);
});

// Handle the /guide command
bot.onText(/\/start/, async (msg) => {
  console.log('start command received'); // Add console.log() statement here
  const message = `
<b>Hello! Welcome to the $LEPE Lottery bot.</b>

To get help with using the bot, use the /guide command.
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

//handle new member
bot.on('new_chat_members', async (msg) => {
  console.log('New member command received');
  
  const newUser = msg.new_chat_member;
  const message = `Welcome to LEPE Community, ${newUser.first_name}!`;
  const keyboard = {
    inline_keyboard: [
      [
        {
          text: 'Visit our website',
          url: 'https://www.luckypepe.io/'
        }
      ]
    ]
  };
  bot.sendMessage(msg.chat.id, message, {reply_markup: keyboard});

  // Check for the /checknew command
  if (msg.text === '/checknew') {
    console.log('Checking new member function...');
    bot.sendMessage(msg.chat.id, 'Checking new member function...');
  }
});

// Handle the /guide command
bot.onText(/\/(help|guide)/, async (msg) => {
  console.log('help/guide command received'); // Add console.log() statement here
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

bot.on('message', (msg) => {
  const command = msg.text.split(' ')[0];
  if (command === '/balance') {
    // handle balance command
  } else if (command === '/winner') {
    // handle winner command
  } else if (command === '/round' || command === '/lottery') {
    // handle round/lottery command
  } else if (command === '/minimum') {
    // handle minimum command
  } else if (command === '/ca' || command === '/contract') {
    // handle ca/contract command
  } else if (command === '/buy') {
    // handle buy command
  } else if (command === '/ido' || command === '/presale' || command === '/pinksale') {
    // handle ido/presale/pinksale command
  } else if (command === '/help' || command === '/guide' || command === '/start') {
    // handle help/guide/start command
  }
});

module.exports = bot;