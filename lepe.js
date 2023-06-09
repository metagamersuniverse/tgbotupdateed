const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const ethers = require('ethers');
// Create the Telegram bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true, debug: true });

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
// Handle the /start command
bot.onText(/\/start/, async (msg) => {
  console.log('start command received'); // Add console.log() statement here
  const message = `
Hi! 
Welcome to AI POP bot. 
Send me a photo and I'll generate a description for you.
Type 'help' if you need assistance. 
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
  const messageId = msg.message_id;

  // Reply to the user with styled text
  const replyMessage = `<b>ZooZoo Image Caption Generation</b>\n\n<i>Starting from 10th June, 4 PM UTC</i>\n\nStay tuned!`;
  bot.sendMessage(chatId, replyMessage, { parse_mode: "HTML" });
});

// Handle incoming photos with the /photo command in a group
bot.onText(/\/photo/, (msg) => {
  const chatId = msg.chat.id;

  // Check if the message is from a group
  if (msg.chat.type === "group" || msg.chat.type === "supergroup") {
    // Check if the message contains a photo
    if (msg.photo && msg.photo.length > 0) {
      // Reply to the user in the group with the loading message
      const loadingMessage = "Generating caption... ⏳";
      bot.sendMessage(chatId, loadingMessage)
        .then(() => {
          // Reply to the user with the styled text
          const styledText = `<b>ZooZoo Image Caption Generation</b>\n\n<i>Starting from 10th June, 4 PM UTC</i>\n\nStay tuned!`;
          bot.sendMessage(chatId, styledText, { parse_mode: "HTML" });
        })
        .catch((error) => {
          console.error("Error sending message:", error);
        });
    } else {
      // Reply with an error message if no photo is found
      const errorMessage = "Please send a photo with the /photo command.";
      bot.sendMessage(chatId, errorMessage);
    }
  } else {
    // Reply with an error message if the command is used outside a group
    const errorMessage = "This command is only available in groups. Please use it in a group chat.";
    bot.sendMessage(chatId, errorMessage);
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

  const photoUrl = "https://zoozoo.lol/wp-content/uploads/2023/06/top-banner-1.png"; // replace with your photo URL
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