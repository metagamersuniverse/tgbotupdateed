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

const chatId = -1001921605828; // replace with the group chat ID
console.log(`Sending starting message to group ${chatId}...`);

// Send a starting message to the group
bot.sendMessage(chatId, "Starting lottery checker...", { parse_mode: "HTML", disable_web_page_preview: true })
  .then(() => {
    console.log(`Started lottery checker in group ${chatId}.`);

    // Set up a timer to check the current round at regular intervals
    setInterval(async () => {
      console.log('Checking current round...');
      const currentRound = await contract._lotteryRound();
      const previousRound = currentRound > 0 ? currentRound - 1 : 0;
      const nextRound = currentRound + 1;

      // Check if the previous round has ended
      const winnerInfo = await contract.lotteryWinnerInfo(previousRound);
      console.log(`Winner info for round ${previousRound}:`, winnerInfo);

      if (winnerInfo.randomNumber > 0) {
        console.log(`Round ${previousRound} has ended. Notifying the group chat...`);

        // Get the winner information for the previous round
        const prizeAmount = isNaN(winnerInfo.prizeAmount) ? "0.0" : (winnerInfo.prizeAmount / 1e18).toFixed(5);
        const arbAmount = isNaN(winnerInfo.arbAmount) ? "0.0" : (winnerInfo.arbAmount / 1e18).toFixed(5);
        const winnerMessage = winnerInfo.winnerMessage ? `Hey everyone, ${winnerInfo.winnerMessage}` : "";
        const walletLink = `https://arbiscan.io/address/${winnerInfo.wallet}`;
        const message = `🎉 Round ${previousRound} of the $LEPE Lottery has ended! 🎉\n\n${winnerMessage}\n\nHere are the details of my win:\nWin By Random Number: ${winnerInfo.randomNumber.toString()}\nWallet Address: <a href="${walletLink}">${winnerInfo.wallet}</a>\nPrize Amount: ${arbAmount} ARB = ${prizeAmount} ETH\n\nGood luck to all participants in the next round! 🍀`;

        // Send the notification to the group chat
        const sentMessage = await bot.sendMessage(chatId, message, { parse_mode: "HTML", disable_web_page_preview: true });
        console.log('Notification sent:', message);

        // Check if the next round has started
        if (currentRound < nextRound) {
          const nextRoundMessage = `Round ${nextRound} has begun. Good luck to all participants! 🍀`;
          bot.sendMessage(chatId, nextRoundMessage);
          console.log(`Notifying the group chat: ${nextRoundMessage}`);
        }

        // Pin the message to the chat
        bot.pinChatMessage(chatId, sentMessage.message_id);
        console.log('Message pinned to the chat.');
      } 
      else if (previousRound === 0) {
        console.log('Lottery has started. Notifying the group chat...');
        // Notify users that the lottery has started
        const message = "The $LEPE Lottery has started! 🎉";
        const sentMessage = await bot.sendMessage(chatId, message, { parse_mode: "HTML", disable_web_page_preview: true });
        console.log('Notification sent:', message);

        // Pin the message to the chat
        bot.pinChatMessage(chatId, sentMessage.message_id);
        console.log('Message pinned to the chat.');
      }
    }, 60000); // 1 minute interval
  })
  .catch((error) => {
    console.error('Error:', error);
  });
  


    
// Handle the /round command
bot.onText(/\/(round|lottery)/, async (msg) => {
  console.log('round/lottery command received'); // Add console.log() statement here
  const contractAddress = '0x6CB0e4dA8F621A3901573bD8c8d2C8A0987d78d6'; // Replace with actual contract address
  const round = await contract._lotteryRound(); // Call _lotteryRound function
  bot.sendMessage(msg.chat.id, message);
});

// Handle the /minimum command //done
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

// Handle the /bido command //done
bot.onText(/\/balance/, async (msg) => {
  console.log('balance command received');

  // Retrieve Ido balance in ETH
  const walletAddress = '0x087859e91ee03cb339ddd8df8e8f2a0b95fe07d6'; // Replace with your desired wallet address
  const balanceInWei = await provider.getBalance(walletAddress);
  const balanceInEth = ethers.utils.formatEther(balanceInWei);
  // Retrieve ARB price from the API
  const pairAddress = '0xC6F780497A95e246EB9449f5e4770916DCd6396A';
  const apiEndpoint = `https://api.dexscreener.com/latest/dex/pairs/arbitrum/${pairAddress}`;
  const response = await axios.get(apiEndpoint);
  const data = response.data;
  const priceNative = parseFloat(data.pairs[0].priceNative); // Get the price of the token in the trading pair

  // Calculate balance in ARB
  const balanceInArb = (balanceInEth / priceNative).toFixed(2);
  const message = `Lottery Balance : ${balanceInArb} ARB = ${balanceInEth} ETH`;
  bot.sendMessage(msg.chat.id, message);
  return;
});

// Handle the /bido command
bot.onText(/\/bido/, async (msg) => {
  console.log('balance command received');

  // Retrieve Ido balance in ETH
  const walletAddress = '0x0bcbbcd3186e5d857af2a4c4a158d5027037032f'; // Replace with your desired wallet address
  const balanceInWei = await provider.getBalance(walletAddress);
  const balanceInEth = ethers.utils.formatEther(balanceInWei);
  // Retrieve ARB price from the API
  const pairAddress = '0xC6F780497A95e246EB9449f5e4770916DCd6396A';
  const apiEndpoint = `https://api.dexscreener.com/latest/dex/pairs/arbitrum/${pairAddress}`;
  const response = await axios.get(apiEndpoint);
  const data = response.data;
  const priceNative = parseFloat(data.pairs[0].priceNative); // Get the price of the token in the trading pair

  // Calculate balance in ARB
  const balanceInArb = (balanceInEth / priceNative).toFixed(2);
  const message = `Lottery Balance : ${balanceInEth} ETH = ${balanceInArb} ARB`;
  bot.sendMessage(msg.chat.id, message);
  return;
});

// Handle the /ca command //done
bot.onText(/\/(ca|contract)/, async (msg) => {
  console.log('ca/contract command received');
  const walletAddress = "0x6CB0e4dA8F621A3901573bD8c8d2C8A0987d78d6"; // replace with your desired wallet address
  const message = `
<b>Contract Address:
</b>  <code>${walletAddress}</code>
(Tap To Copy)`;
  bot.sendMessage(msg.chat.id, message, { parse_mode: "HTML" });
});


// buy the /buy command
bot.onText(/\/by/, (msg) => {
  console.log('ca command received');
  const message = `
<b>To buy a $LEPE, please visit one of the following websites:</b>
- Listed on Sushiswap
- Listed on DexView
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