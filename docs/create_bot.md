# How to create a bot discord

A bot discord is composed of 2 things:
- The code
- A Discord Application

The code is what I've done: just download it and it's ready, but the application is different.  

A Discord application is what's going to do what the code tells it in discord, and it's the application that'll define the bot's name and icon, as well as which servers it'll be on.

To create it, go to [l'espace dévelopeur de discord](https://discord.com/developers/applications), make sure you're logged in with your discord account, then follow these steps
- Click on "New Application
- Give your application a name
- Check the box
- Click on "Create".
- You'll come to "General Information" if you want to change your bot's icon, select "APP ICON".
- On the left of the page, click on "Bot".
- Once in "Bot", you can change your bot's name under "USERNAME".
- Scroll down to the "Privileged Gateway Intents" section, then tick "PRESENCE INTENT".
- Then go back up and select "Reset Token" then "Yes, do it".
- Then select "Copy" to retrieve your token. This is what will enable my code to interact with your application, so make a note of it as we'll be using it again later.
- Now go to "OAuth2" then "URL Generator".
- Check "bot" inside "SCOPES".
- Then in "BOT PERMISSIONS" select "Administrator".
- Now copy "GENERATED URL" and paste it into your browser, this will allow you to add your bot to your server.