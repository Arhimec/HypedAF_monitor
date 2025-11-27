const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

const TELEGRAM_BOT_TOKEN = 'your_telegram_bot_token';
const TELEGRAM_GROUP_ID = '@superrarebears';

const COLLECTION_ID = 'HYPEDAF-9378b5';
const API_URL = `https://api.multiversx.com/nfts?collection=${COLLECTION_ID}&order=desc&from=0&size=1`;

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
let lastSeenNonce = 0;
let monitoringInterval = null;
let isRunning = false;

async function checkNewMints() {
  try {
    const response = await axios.get(API_URL);
    const nfts = response.data;

    if (!Array.isArray(nfts) || nfts.length === 0) return;

    const newMints = nfts.filter(nft => nft.nonce > lastSeenNonce);

    if (newMints.length === 0) {
      console.log('No new mints detected');
      return;
    }

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

    lastSeenNonce = newMints[newMints.length - 1].nonce;

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Handle callback queries from inline keyboard
bot.on('callback_query', async (callbackQuery) => {
  const action = callbackQuery.data;
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;

  if (action === 'stop_bot') {
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
      monitoringInterval = null;
      isRunning = false;
      await bot.sendMessage(chatId, '🛑 Bot monitoring stopped!');
      console.log('Bot stopped by user');
    } else {
      await bot.sendMessage(chatId, '⚠️ Bot is not currently running');
    }
  }

  // Answer the callback query to remove loading state
  bot.answerCallbackQuery(callbackQuery.id);
});

// Start monitoring
isRunning = true;
monitoringInterval = setInterval(checkNewMints, 30000);
checkNewMints();

console.log('Bot started and monitoring for new mints...');
