# TTS-Auto-Language

Text-To-Speech for Twitch, but it switches voices based on the language of the message.<br>

**Only supports German and English for now. Please message me, if you need another language.**

## Features

- Ignore messages starting with `!` exclamation mark
- Read the username of the chatter
- Option to skip numbers in a username
- Skip the name for consecutive messages by the same user
- Ignore usernames in reply messages
- Replace names being spoken with better pronunciation
- Limit maximum words or characters
- Skip certain users like bots
- Option to skip emotes or only speak the first
- Choose any installed voice or from 57 Google voices
- Viewerbot, that tells you who is lurking or who left

More features will be added in the future if demand is high.<br>
Please message me if you want something added or if you find a bug.

## Config

All the configuration is done in the `config.json` file.<br>
Variables should be self-explanatory, more configuration will likely be added in the future.

You need a Twitch OAuth token for the bot to be able to read the chat.
If you need an OAuth token, please visit https://twitchapps.com/tmi/ and click on 'connect'.
Remember to include the 'oauth:' part of the token. You can always revoke access here: https://twitch.tv/settings/connections

## Run

Start the executable by double-clicking the batch file next to it. This will ensure that the program doesn't immediately close if misconfigured.

## Debug

You need to have Node.js Version 18+ installed, then run `npm run dev` or `node index.js`<br>

## Build

Run `npm run build` to build the app into a standalone executable.
