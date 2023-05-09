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

// Set up a timer to check the current round at regular intervals

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
    chainId: pair.chainId,
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

//bot.onText(/\/price/, async (msg) => {
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
💦 Liquidity: ${data.liquidity}
💎 Market Cap (FDV): ${data.marketCap}`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "📊Chart", url: "https://example.com/link1" },
        { text: "💰BUY NOW", url: "https://example.com/link2" },
      ],
    ],
  };

  const options = {
    reply_markup: JSON.stringify(keyboard),
  };

  bot.sendMessage(msg.chat.id, message, options);
});


// buy the /buy command
bot.onText(/\/buy/, (msg) => {
    console.log('ca command received');
    const message = `
  <b>To buy a $LEPE, please visit one of the following websites:</b>
  `;
    const options = {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📊Chart", url: "https://www.dexview.com/arbitrum/0x6CB0e4dA8F621A3901573bD8c8d2C8A0987d78d6" },
            { text: "💰BUY NOW", url: "https://app.sushi.com/swap?inputCurrency=ETH&outputCurrency=0x6CB0e4dA8F621A3901573bD8c8d2C8A0987d78d6&chainId=42161" }
          ]
        ]
      }
    };
    bot.sendMessage(msg.chat.id, message, options);
  });
  
// Set up a timer to check the current round at regular intervals
setInterval(async () => {
    const currentRound = await contract._lotteryRound();
    const previousRound = currentRound - 1;
  
    // Check if the previous round has ended
    const hasRoundEnded = await contract.hasRoundEnded(previousRound);
    if (hasRoundEnded) {
      // Get the winner information for the previous round
      const winnerInfo = await contract.lotteryWinnerInfo(previousRound);
      const prizeAmount = isNaN(winnerInfo.prizeAmount) ? "0.0" : (winnerInfo.prizeAmount / 1e18).toFixed(5);
      const arbAmount = isNaN(winnerInfo.arbAmount) ? "0.0" : (winnerInfo.arbAmount / 1e18).toFixed(5);
      const message = `🎉 Round ${previousRound} of the $LEPE Lottery has ended! 🎉\n\nCongratulations to the winner:\nWin By Random Number: ${winnerInfo.randomNumber.toString()}\nWallet Address: ${winnerInfo.wallet}\nPrize Amount: ${arbAmount} ARB = ${prizeAmount} ETH`;
  
      // Send the winner information to all users in the chat
      const chatId = process.env.CHAT_ID;
      bot.sendMessage(chatId, message);
      
      // Check if the next round has started
      if (currentRound > previousRound) {
        const nextRound = currentRound;
        const nextRoundMessage = `Round ${nextRound} has begun. Good luck to all participants! 🍀`;
        bot.sendMessage(chatId, nextRoundMessage);
      }
    } else if (previousRound === 0) {
      // Notify users that the lottery has started
      const chatId = process.env.CHAT_ID;
      const message = "The $LEPE Lottery has started! 🎉";
      const sentMessage = await bot.sendMessage(chatId, message);
  
      // Pin the message to the chat
      bot.pinChatMessage(chatId, sentMessage.message_id);
    }
  }, 60000); // Check every minute


// Handle the /winner command
bot.onText(/\/winner (.+)/, async (msg, match) => {
  console.log('winner command received'); // Add console.log() statement here
  const round = match[1];
  const winnerInfo = await contract.lotteryWinnerInfo(round);
  const prizeAmount = isNaN(winnerInfo.prizeAmount) ? "0.0" : (winnerInfo.prizeAmount / 1e18).toFixed(5);
  const arbAmount = isNaN(winnerInfo.arbAmount) ? "0.0" : (winnerInfo.arbAmount / 1e18).toFixed(5);
  const message = `Win By Random Number: ${winnerInfo.randomNumber.toString()}\nWallet Address: ${winnerInfo.wallet}\nPrize Amount: ${arbAmount} ARB = ${prizeAmount} ETH`;
  
  bot.sendMessage(msg.chat.id, message);
});

// Handle the /round command
bot.onText(/\/(round|lottery)/, async (msg) => {
  console.log('round/lottery command received'); // Add console.log() statement here
  const contractAddress = '0x6CB0e4dA8F621A3901573bD8c8d2C8A0987d78d6'; // Replace with actual contract address
  const round = await contract._lotteryRound(); // Call _lotteryRound function
    const message = `Current lottery round: ${round}`;
    
    bot.sendMessage(msg.chat.id, message);
    // Pin the message to the chat
      bot.pinChatMessage(chatId, sentMessage.message_id);
});


// Handle the /minAmount command
bot.onText(/\/minimum/, async (msg) => {
  console.log('minimum command received'); // Add console.log() statement here
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
    const message = `Minimum amount to participate in the lottery: ${minAmountInEther} ETH`;
    
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
- Presale Start Time - 2023.05.09 15:00 (UTC)
- Presale End Time - 2023.05.10 15:00 (UTC)
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