const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

const TELEGRAM_BOT_TOKEN = 'your_telegram_bot_token';
const TELEGRAM_GROUP_ID = '@superrarebears';

const COLLECTION_ID = 'HYPEDAF-9378b5';
const API_URL = `https://api.multiversx.com/nfts?collection=${COLLECTION_ID}&order=desc&from=0&size=1`;

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

let lastSeenNonce = 0;

// Main function to check for new mints
async function checkNewMints() {
  try {
    const response = await axios.get(API_URL);
    const nfts = response.data;

    if (!Array.isArray(nfts) || nfts.length === 0) return;

    // Filter for NFTs we haven't seen yet
    const newMints = nfts.filter(nft => nft.nonce > lastSeenNonce);

    if (newMints.length === 0) {
      // Optional: Comment this out to reduce console noise
      console.log('No new mints detected'); 
      return;
    }

    // Sort by nonce to ensure we process them in order
    newMints.sort((a, b) => a.nonce - b.nonce);

    for (const nft of newMints) {
      const message = `🚀 New HYPEDAF Minted!\n` +
                      `Name: ${nft.name}\n` +
                      `Nonce: ${nft.nonce}`;

      const thumbnailUrl = nft.media && nft.media[0] && nft.media[0].thumbnailUrl;
      
      const urlInlineKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🎨 Mint an ugly mfr', url: 'https://mint-hypedaf.superrarebears.com/' }],
            // "Gotcha" will trigger the callback query below, but won't stop the bot
            [{ text: 'Mark as SPAM', callback_data: 'Gotcha' }] 
          ]
        }
      };

      if (thumbnailUrl) {
        await bot.sendPhoto(TELEGRAM_GROUP_ID, thumbnailUrl, { caption: message, ...urlInlineKeyboard });
      } else {
        await bot.sendMessage(TELEGRAM_GROUP_ID, message, urlInlineKeyboard);
      }
      console.log(`Sent notification for nonce ${nft.nonce}`);
    }

    // Update the last seen nonce to the highest one we just processed
    lastSeenNonce = newMints[newMints.length - 1].nonce;

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Handle callback queries (Button clicks)
bot.on('callback_query', async (callbackQuery) => {
  const action = callbackQuery.data;
  // const chatId = callbackQuery.message.chat.id; // Unused but available if you need to reply to user

  // Handle the "Mark as SPAM" button
  if (action === 'Gotcha') {
      console.log('User clicked Mark as SPAM - Action acknowledged.');
      // You can add logic here to log the spam report to a database if needed
  }

  // Answer the callback query to remove the "loading" animation on the button
  // We do NOT stop the monitoring interval here.
  bot.answerCallbackQuery(callbackQuery.id, { text: 'Feedback received!' });
});

// Start monitoring every 30 seconds
setInterval(checkNewMints, 30000);

// Initial check immediately on start
checkNewMints();

console.log('Bot started and monitoring for new mints indefinitely...');
