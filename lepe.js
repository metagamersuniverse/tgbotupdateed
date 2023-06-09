const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const ethers = require('ethers');
const { providers } = require('ethers');

// Set up provider and contract objects
const provider = new providers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');
// Create the Telegram bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true, debug: true });

// Handle the /ca command
bot.onText(/\/(cla|contract)/, async (msg) => {
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
          { text: "BUY NOW", url: "https://zoozoo.lol/" },
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
  <b>Welcome To $LEPE Lottery bot.</b>

  To participate in the lottery and get a description of your photo, follow these steps:
  
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



// Handle the /bido command
bot.onText(/\/bido/, async (msg) => {
  console.log('balance command received');

  // Retrieve Ido balance in ETH
  const walletAddress = '0xD37EAaDe4Cb656e5439057518744fc70AF10BAF2'; // Replace with your desired wallet address
  const balanceInWei = await provider.getBalance(walletAddress);
  const balanceInEth = ethers.utils.formatEther(balanceInWei);
  // Calculate balance in ARB
  const message = `Lottery Balance : ${balanceInEth} ETH`;
  bot.sendMessage(msg.chat.id, message);
  return;
});

// Handle the /bido command
bot.onText(/\/bido/, async (msg) => {
  console.log('balance command received');

  // Retrieve Ido balance in ETH
  const walletAddress = '0xD37EAaDe4Cb656e5439057518744fc70AF10BAF2'; // Replace with your desired wallet address
  const balanceInWei = await provider.getBalance(walletAddress);
  const balanceInEth = ethers.utils.formatEther(balanceInWei);

  // Calculate the percentage based on the balance
  const baseValue = 1; // Base value in ETH
  const incrementValue = 0.1; // Increment value in ETH
  const percentageIncrement = 10; // Percentage increment per incrementValue

  let percentage = 100 + Math.floor((balanceInEth - baseValue) / incrementValue) * percentageIncrement;

  // Create the message with the balance and percentage
  const message = `Presale Balance: ${balanceInEth} ETH\nPercentage: ${percentage}%`;
  bot.sendMessage(msg.chat.id, message);
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