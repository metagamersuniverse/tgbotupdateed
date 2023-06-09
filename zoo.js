const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const ethers = require('ethers');
const { providers } = require('ethers');

// Set up provider and contract objects
const provider = new providers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');
// Create the Telegram bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true, debug: true });

// Handle the /ca command
bot.onText(/\/(ca|contract)/, async (msg) => {
  console.log('ca/contract command received');
  const walletAddress = "0xc58A4963c09AE6d8a152D194a147450D5f7cC55a"; // replace with your desired wallet address
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
<b>To buy a $ZZ, please visit one of the following websites:</b>
- Presale Start Time - 2023.06.08 14:00 (UTC)
- Presale End Time - 2023.06.10 14:00 (UTC)
`;
  const options = {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "💰BUY ON PRESALE", url: "https://www.pinksale.finance/launchpad/0xD37EAaDe4Cb656e5439057518744fc70AF10BAF2?chain=Arbitrum" }
        ]
      ]
    }
  };
  bot.sendMessage(msg.chat.id, message, options);
});
// Handle the /start command
bot.onText(/\/start/, async (msg) => {
  console.log('start command received'); // Add console.log() statement here
  const message = `
Hi! 
Welcome to ZZ AI bot. 
Send me a photo and I'll generate a description for you.
Type '/help' if you need assistance. 
Let's get started!
`;

  const photoUrl = "https://raw.githubusercontent.com/metagamersuniverse/zz/main/FAIRLAUNCH%20LIVE.jpg"; // replace with your photo URL
  const options = {
    parse_mode: "HTML",
    caption: message,
    reply_markup: {
      inline_keyboard: [
        [
          { text: "BUY NOW", url: "https://www.pinksale.finance/launchpad/0xD37EAaDe4Cb656e5439057518744fc70AF10BAF2?chain=Arbitrum" },
          { text: "Visit our website", url: "https://zoozoo.lol/" }
        ]
      ]
    }
  };
  bot.sendPhoto(msg.chat.id, photoUrl, options);
});


// Handle incoming photos
bot.on("photo", (msg) => {
  const chatId = msg.chat.id;
  const photo = msg.photo[msg.photo.length - 1]; // Get the last photo from the array

  // Store the received photo in a variable accessible for caption requests
  bot.currentPhoto = photo;

  // Reply to the user with the loading message
  const loadingMessage = "Generating caption... ⏳";
  bot.sendMessage(chatId, loadingMessage, { parse_mode: "HTML" })
    .catch((error) => {
      console.error("Error sending message:", error);
    });
});

let captionCount = 0; // Variable to store the count of /caption commands

// Handle caption requests
bot.onText(/\/caption/, (msg, match) => {
  const chatId = msg.chat.id;

  // Increment the caption count
  captionCount++;

  // Create the reply message including the count
  const replyMessage = `
ZooZoo Image Caption Generation
Starting from <b>10th June, 4 PM UTC</b>
Stay tuned!
`;

  // Send the reply message
  bot.sendMessage(chatId, replyMessage, { parse_mode: "HTML" })
    .catch((error) => {
      console.error("Error sending message:", error);
    });
});






// Handle the /guide command
bot.onText(/\/(help|guide)/, async (msg) => {
  console.log('help/guide command received'); // Add console.log() statement here
  const message = `
  <b>Welcome To $ZOO ZOO AI.</b>

  To get a description of your photo, follow these steps:
  
  1. Join a ZooZoo group where the bot is available.
  2. Send a photo in JPG or PNG format to the group.
  3. Once the photo is sent, use the /caption command and mention the photo you want to get a description for.
  4. The bot will generate a caption for your photo.

  Please note:
- Photos must be in JPG or PNG format to be processed by the bot.
- Make sure to mention the photo you want to get a caption for using the /caption command.
- The bot will reply with the generated caption.

Enjoy using $ZZ Ai bot!
`;

  const photoUrl = "https://raw.githubusercontent.com/metagamersuniverse/zz/main/FAIRLAUNCH%20LIVE.jpg"; // replace with your photo URL
  const options = {
    parse_mode: "HTML",
    caption: message,
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Visit our website", url: "https://www.zoozoo.lol" }
        ]
      ]
    }
  };

  bot.sendPhoto(msg.chat.id, photoUrl, options);
});


// Handle the /do command
bot.onText(/\/do/, async (msg) => {
  console.log('balance command received');

  // Retrieve balance in ETH
  const walletAddress = '0xD37EAaDe4Cb656e5439057518744fc70AF10BAF2'; // Replace with your desired wallet address
  const balanceInWei = await provider.getBalance(walletAddress);
  const balanceInEth = ethers.utils.formatEther(balanceInWei);

  // Calculate the percentage based on the balance
  const baseValue = 0.01; // Base value in ETH
  const percentageIncrement = 1; // Percentage increment per 0.01 ETH

  let percentage = Math.floor((balanceInEth - baseValue) / 0.01) * percentageIncrement;

  // Create the message with the balance and percentage
  const message = `Presale Balance: ${balanceInEth} ETH\nPercentage: ${percentage}%`;
  bot.sendMessage(msg.chat.id, message);
});

const Web3 = require('web3'); // Add this line

// Create a Web3 instance connected to the Ethereum network
const web3 = new Web3('https://arb1.arbitrum.io/rpc');
// Keep track of the last processed transaction hash
let lastProcessedTxHash = '';

// Function to check for new transactions
async function checkNewTransactions(chatId) {
  try {
    const walletAddress = '0xD37EAaDe4Cb656e5439057518744fc70AF10BAF2'; // Replace with the desired wallet address

    // Get the transaction list using the Arbiscan explorer API
    const response = await axios.get(`https://api.arbiscan.io/api?module=account&action=txlist&address=${walletAddress}&apikey=8KG5ZN21T1JI8K9NVHQ6HB58S4NUBK1BI7`);
    const transactions = response.data.result;

    if (transactions.length > 0) {
      // Get the last transaction
      const lastTransaction = transactions[0];

      // Check if a new transaction has occurred
      if (lastTransaction.hash !== lastProcessedTxHash) {
        // Get the ETH value in wei and convert it to ETH
        const ethValue = web3.utils.fromWei(lastTransaction.value, 'ether');

        // Create the message with the last transaction details
        const message = `
New Transaction:
Hash: ${lastTransaction.hash}
From: ${lastTransaction.from}
To: ${lastTransaction.to}
Value: ${ethValue} ETH
        `;

        // Send the message to the user
        bot.sendMessage(chatId, message);

        // Update the last processed transaction hash
        lastProcessedTxHash = lastTransaction.hash;
      } else {
        // Send a message indicating no new transaction
        bot.sendMessage(chatId, 'No new transactions');
      }
    } else {
      // Send a message indicating no transactions found
      bot.sendMessage(chatId, 'No transactions found for the wallet address');
    }
  } catch (error) {
    console.error('Error checking new transactions:', error);
  }
}

// Handle the /lasttransaction command
bot.onText(/\/lasttransaction/, (msg) => {
  const chatId = msg.chat.id;
  checkNewTransactions(chatId);
});



let processedTransactions = [];

async function checkLastReceivedEthTransaction(walletAddress, chatId) {
  try {
    const apiKey = '8KG5ZN21T1JI8K9NVHQ6HB58S4NUBK1BI7';
    const apiUrl = `https://api.arbiscan.io/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=latest&apikey=${apiKey}`;
    const ethPriceUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';

    const ethPriceResponse = await axios.get(ethPriceUrl);
    const ethPrice = ethPriceResponse.data.ethereum.usd;

    const response = await axios.get(apiUrl);

    if (response.status === 200) {
      const transactions = response.data.result;

      const newTransactions = transactions.filter(transaction =>
        !processedTransactions.includes(transaction.hash)
      );

      if (newTransactions.length > 0) {
        console.log('New transaction found:', newTransactions);

        for (const transaction of newTransactions) {
          const senderAddress = transaction.from;
          const ethAmount = web3.utils.fromWei(transaction.value, 'ether');
          const spendEthAmount = `${ethAmount} WETH`;
          const spendUsdAmount = (parseFloat(ethAmount) * parseFloat(ethPrice)).toFixed(2);

          const balanceWei = await web3.eth.getBalance(walletAddress);
          const filledEthBalance = parseFloat(web3.utils.fromWei(balanceWei, 'ether')).toFixed(2);

          const senderBalanceWei = await web3.eth.getBalance(senderAddress);
          const senderEthBalance = parseFloat(web3.utils.fromWei(senderBalanceWei, 'ether')).toFixed(2);

          const stickerCount = Math.floor(spendUsdAmount / 2) + 1;

          const boldText = Array.from({ length: stickerCount }, () => '🟢').join('');

          const senderUsdBalance = (parseFloat(senderEthBalance) * parseFloat(ethPrice)).toFixed(2);

          const formattedSenderUsdBalance = `${senderUsdBalance} USD`;

          const message = `
<b>${boldText}</b>
<b>ZooZoo presale Buy</b>
<b>Spent:</b> ${spendEthAmount} (${spendUsdAmount} USD)
<a href="https://arbiscan.io//address/${senderAddress}"><b>Buyer funds:</b></a> (${formattedSenderUsdBalance})
<b>Filled:</b> ${filledEthBalance} WETH
`;

          const imageUrl = 'https://raw.githubusercontent.com/metagamersuniverse/zz/main/FAIRLAUNCH%20LIVE.jpg';
          const keyboard = {
            inline_keyboard: [
              [
                { text: "💰BUY ON PRESALE", url: "https://www.pinksale.finance/launchpad/0xD37EAaDe4Cb656e5439057518744fc70AF10BAF2?chain=Arbitrum" }
              ]
            ]
          };

          bot.sendPhoto(chatId, imageUrl, {
            caption: message,
            parse_mode: 'HTML',
            reply_markup: JSON.stringify(keyboard)
          });

          processedTransactions.push(transaction.hash);
        }
      } else {
        console.log('No new transactions found');
      }
    }
  } catch (error) {
    if (error.response && error.response.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 5;
      console.log(`Rate limited. Retrying after ${retryAfter} seconds...`);

      setTimeout(() => {
        checkLastReceivedEthTransaction(walletAddress, chatId);
      }, retryAfter * 1000);
    } else {
      console.error('Error checking last received ETH transaction:', error);
    }
  }
}

bot.onText(/\/fixcheck/, (msg) => {
  const chatId = msg.chat.id;
  const walletAddress = '0xD37EAaDe4Cb656e5439057518744fc70AF10BAF2';

  checkLastReceivedEthTransaction(walletAddress, chatId);

  const interval = 5000;
  setInterval(() => {
    checkLastReceivedEthTransaction(walletAddress, chatId);
  }, interval);
});

bot.onText(/\/stoppcheck/, (msg) => {
  processedTransactions = [];
  clearInterval(scheduleTransactionCheck);
  bot.sendMessage(msg.chat.id, 'Recurring checks stopped.');
});

bot.onText(/\/checklasteth/, (msg) => {
  const chatId = msg.chat.id;
  const walletAddress = '0xD37EAaDe4Cb656e5439057518744fc70AF10BAF2';
  checkLastReceivedEthTransaction(walletAddress, chatId);
});
















bot.on('message', (msg) => {
  const command = msg.text.split(' ')[0];
  if (command === '/balance') {
    // handle balance command
  } else if (command === '/winner') {
    // handle winner command
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