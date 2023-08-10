const fs = require("fs");
const tmi = require("tmi.js");
const say = require("say");
const { checkForCommand } = require("./src/commands");
const { log } = require("./src/utils");
const { startViewerBot } = require("./src/viewers");
const LanguageDetect = require("languagedetect");

const lngDetector = new LanguageDetect();

let config = JSON.parse(fs.readFileSync("config.json"));
say.getInstalledVoices((err, voices) => {
  err ? console.error(err) : console.log("Available voices", voices);
});

const client = new tmi.Client({
  options: { debug: true },
  identity: {
    username: config.auth.twitch_bot_name,
    password: config.auth.twitch_oauth,
  },
  channels: [config.auth.twitch_channel_name],
});

client
  .connect()
  .then(async () => {
    if (config.viewers.enable_viewer_bot) {
      await startViewerBot();
    }
  })
  .catch((err) => {
    if (err === "Login authentication failed") {
      log(
        "Failed to login! If you need an OAuth token, please visit https://twitchapps.com/tmi/ and click on 'connect'.",
        "red"
      );
      log(
        "Remember to include the 'oauth:' part of the token. You can always revoke access here: https://twitch.tv/settings/connections"
      );
    } else {
      log(err);
    }
  });

let queue = [];

client.on("message", (channel, tags, message, self) => {
  // Check for commands
  // Only do that if channel name is username
  if (channel === "#" + tags.username) {
    const command = checkForCommand(message);
    switch (command.command) {
      case "tts-nickname":
        log("Command executed:", "blue", command);
        setNickname(command.userName, command.rawInput);
        break;
      case "tts-stop":
        log("Command executed:", "blue", command);
        queue = [];
        say.stop();
        break;
      default:
        break;
    }
  }

  if (self) return;

  if (config.tts.ignore.includes(tags.username)) {
    return;
  }

  // Ignore messages starting with '!' and '@'
  if (message.at(0) === "@") {
    message = message.split(" ").splice(1).join(" ");
  }

  if (config.tts.ignore_exclamation && (message.at(0) === "!" || message.at(0) === "@")) {
    return;
  }

  const matches = lngDetector.detect(message);
  const german = isGerman(matches);

  queue.push({
    user: replaceName(tags.username),
    message: message,
    voice: german ? config.tts.voices.german : config.tts.voices.english,
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
    config.tts.say_name && config.tts.skip_consecutive_name && lastUsername !== user
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
  let newName = name;
  if (config.tts.name_replacement[name]) {
    newName = config.tts.name_replacement[name];
  }
  if (!config.tts.read_numbers_in_name) {
    newName = newName.replace(/[0-9]/g, "");
  }
  return newName;
}

function setNickname(username, nickname) {
  let name_replacement = config.tts.name_replacement;
  name_replacement[username.toLowerCase()] = nickname;
  config.tts = { ...config.tts, name_replacement };
  fs.writeFileSync("config.json", JSON.stringify(config, null, 2));
}
