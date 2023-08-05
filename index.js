const fs = require("fs");
const tmi = require("tmi.js");
const say = require("say");
const { checkForCommand } = require("./commands");
const LanguageDetect = require("languagedetect");

const lngDetector = new LanguageDetect();

let config = JSON.parse(fs.readFileSync("config.json"));
say.getInstalledVoices((err, voices) =>
  console.log("Available voices", voices)
);

const client = new tmi.Client({
  options: { debug: true },
  identity: {
    username: config.twitch_bot_name,
    password: config.twitch_oauth,
  },
  channels: config.twitch_channel_names,
});

client.connect().catch((err) => {
  logRed(
    "Failed to login! If you need an OAuth token, please visit https://twitchapps.com/tmi/ and click on 'connect'."
  );
  console.log(
    "Remember to include the 'oauth:' part of the token. You can always revoke access here: https://twitch.tv/settings/connections"
  );
});

let queue = [];

client.on("message", (channel, tags, message, self) => {
  // Check for commands
  // Only do that if channel name is username
  if (channel === "#" + tags.username) {
    const command = checkForCommand(message);
    switch (command.command) {
      case "tts-nickname":
        console.log("Command executed:", command);
        setNickname(command.userName, command.rawInput);
        break;
      case "tts-stop":
        console.log("Command executed:", command);
        queue = [];
        say.stop();
        break;
      default:
        break;
    }
  }

  if (self) return;

  if (config.ignore.includes(tags.username)) {
    return;
  }

  // Ignore messages starting with '!' and '@'
  if (message.at(0) === "@") {
    message = message.split(" ").splice(1).join(" ");
  }

  if (
    config.ignore_exclamation &&
    (message.at(0) === "!" || message.at(0) === "@")
  ) {
    return;
  }

  const matches = lngDetector.detect(message);
  const german = isGerman(matches);

  queue.push({
    user: replaceName(tags.username),
    message: message,
    voice: german ? config.german_voice : config.english_voice,
  });

  // If the queue was empty before adding this message, start reading immediately
  if (queue.length === 1) {
    processQueue();
  }
});

let lastUsername = "";
function processQueue() {
  // If the queue is empty, stop processing
  if (queue.length === 0) {
    return;
  }

  const { user, message, voice } = queue[0];

  say.speak(
    config.say_name && config.skip_consecutive_name && lastUsername !== user
      ? `${user}: ${message}`
      : message,
    voice,
    1.0,
    (err) => {
      if (err) {
        console.error(err);
      }
      lastUsername = user;
      queue.shift();
      processQueue();
    }
  );
}

function isGerman(matches) {
  const englishMatch = matches.find((arr) => arr[0] === "english");
  const germanMatch = matches.find((arr) => arr[0] === "german");
  try {
    return englishMatch[1] < germanMatch[1];
  } catch {
    return false;
  }
}

function replaceName(name) {
  if (config.name_replacement[name]) {
    return config.name_replacement[name];
  }
  return name;
}

function logRed(text) {
  console.log(`\u001b[1;31m${text}\u001b[0m`);
}

function setNickname(username, nickname) {
  let name_replacement = config.name_replacement;
  name_replacement[username.toLowerCase()] = nickname;
  config = { ...config, name_replacement };
  fs.writeFileSync("config.json", JSON.stringify(config, null, 2));
}
