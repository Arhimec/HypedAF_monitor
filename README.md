HYPEDAF Mint Monitor Bot
A Node.js Telegram bot that monitors the MultiversX blockchain for new NFT mints in the HYPEDAF collection. When a new NFT is detected, the bot automatically sends a notification with an image and mint details to a specified Telegram group.

🚀 Features
Real-time Monitoring: Polls the MultiversX API every 30 seconds to check for new mints.

Smart Tracking: Uses nonce tracking to ensure only new items are reported.

Rich Notifications: Sends the NFT thumbnail (if available) along with the Name and Nonce.

Interactive Buttons: Includes inline buttons to direct users to the minting page.

📋 Prerequisites
Before running the bot, ensure you have the following installed:

Node.js (v14 or higher)

npm (usually comes with Node.js)

You also need:

A Telegram Bot Token (Create one via @BotFather).

The Chat ID or Username of the Telegram group/channel where notifications should be sent.

🛠️ Installation
Clone or download this repository (or save the code into a file named bot.js).

Initialize the project (if you haven't already):

Bash

npm init -y
Install dependencies:

Bash

npm install axios node-telegram-bot-api
⚙️ Configuration
Open the bot.js file and configure the following constants at the top of the file:

JavaScript

// Replace with your actual token from BotFather
const TELEGRAM_BOT_TOKEN = 'your_telegram_bot_token';

// Replace with your Group username (e.g. @mygroup) or numeric Chat ID
const TELEGRAM_GROUP_ID = '@superrarebears';

// The MultiversX Collection ID you want to track
const COLLECTION_ID = 'HYPEDAF-9378b5';
Note: For security best practices, consider using dotenv to store your API tokens in an .env file rather than hardcoding them in the source code.

🏃‍♂️ Usage
Run the bot using the following command:

Bash

node bot.js
You should see the message: Bot started and monitoring for new mints...

🧠 How It Works
Initialization: The bot starts with lastSeenNonce set to 0.

Polling: Every 30 seconds, it calls checkNewMints().

API Request: It fetches the latest NFT from the MultiversX API for the specific collection.

Comparison: It checks if the fetched NFT's nonce is higher than lastSeenNonce.

Notification:

If a new mint is found, it constructs a message.

It attempts to send sendPhoto. If no photo exists, it falls back to sendMessage.

Update: The lastSeenNonce is updated to prevent duplicate alerts.
