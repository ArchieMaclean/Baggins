# Baggins - A Discord Chat Moderation Bot
Baggins is a discord chat bot designed to moderate voice channels. Feel free to fork the code and use yourself, but beware of spaghetti!
This was created in 2 days for the 8th Repl.it codejam, by user @ArchieMaclean#5954. It uses discord.js, and Python's SpeechRecognition (Based on the Houndify API).
Note that I am using the free version of the Houndify API, so if it starts not working it's probably because I ran out of requests (100/day).
It also saves all the audio from a session into a single file, in the directory `audio_files`.

## Setup instructions
* Install npm and python3.
* Clone this repository and `cd` into the folder
* Run `npm install` 
* Run` sudo python3 -m pip install -r requirements.txt`
* Run `mkdir audio_files`
* Create a bot account on the [discord developers page](https://discordapp.com/developers) and get a token.
* Create a file called `.env` and put `TOKEN={your_token}` inside (replacing with your bot token).
* Create an account on [Houndify](https://www.houndify.com) and use your default project to get a client id and a client key
* In your `.env`, set `CLIENT_ID={your_client_id}` and `CLIENT_KEY={your_client_key}`.
* Invite the bot to your server, and create a channel called `log` (for the bot to write to).
* Run with `node main.js`.