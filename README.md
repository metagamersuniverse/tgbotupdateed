# tgbotupdateed
Here's a step-by-step guide to deploy your Telegram bot on an Azure VM:

Create an Azure VM: Log in to your Azure account and create a new virtual machine (VM) with the desired configuration. Make sure you select the appropriate operating system image for your VM, such as Ubuntu.

Connect to the VM: Once the VM is created, connect to it using an SSH client such as PuTTY or the Azure Cloud Shell.

Update the package list and install Git and Node.js: Run the following commands to update the package list and install Git and Node.js:

sql
Copy code

sudo apt update
sudo apt install git nodejs npm

Clone your Git repository: Clone your Git repository to the VM using the following command:
bash
Copy code

git clone https://github.com/metagamersuniverse/tgbotupdateed.git

Install project dependencies: Change the current directory to your project folder and install the project dependencies using the following commands:
bash
Copy code

cd tgbotupdateed
npm install

Start your Node.js script with PM2: Use the following command to start your Node.js script with PM2:
sql
Copy code

pm2 start mybot.js

Open port on the firewall: Open the port on the firewall to allow incoming traffic to your bot using the following command:
bash
Copy code

sudo ufw allow 8443/tcp

Set environment variables: Set the environment variables required by your bot using the following command:
arduino
Copy code

export TELEGRAM_BOT_TOKEN="6197218385:AAGJs_GGYcE0JhmP4BEKKyZnm6NUeZwgEZU"
export RPC_URL="https://arb-mainnet.g.alchemy.com/v2/-4-rxeMBTi-yavAgPLLK5TkFBvri4Pvr"
export CONTRACT_ADDRESS="0x7F6228DdA3F9ea6B4beAa24181bf95B2F4a29dB8"

Replace <your-bot-token> with the actual token of your bot and <your-domain> with the domain name or IP address of your VM.

Configure HTTPS: In order to use the webhook feature of your bot, you need to configure HTTPS on your VM. You can use a tool like Certbot to obtain a free SSL/TLS certificate from Let's Encrypt. To install Certbot on Ubuntu, follow the instructions on the Certbot website: https://certbot.eff.org/lets-encrypt/ubuntufocal-nginx

Set up NGINX reverse proxy: Use NGINX as a reverse proxy to forward incoming traffic from the web to your bot running on a local port. To set up NGINX on your VM, follow the instructions on the NGINX website: https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/

Restart your bot: Use the following command to restart your bot:

Copy code
pm2 restart mybot.js
That's it! Your Telegram bot should now be running on your Azure VM, and you can access it using the domain name or IP address of your VM. To test your bot, send a message to it on Telegram.



export TELEGRAM_BOT_TOKEN="6197218385:AAGJs_GGYcE0JhmP4BEKKyZnm6NUeZwgEZU"
export RPC_URL="https://arb-mainnet.g.alchemy.com/v2/-4-rxeMBTi-yavAgPLLK5TkFBvri4Pvr"
export CONTRACT_ADDRESS="0x7F6228DdA3F9ea6B4beAa24181bf95B2F4a29dB8"


pm2 restart mybot.js --update-env


-for sync github to file 

pm2 stop mybot.js

git pull origin main:main

pm2 restart mybot.js
