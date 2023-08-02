const fs = require("fs");
const tmi = require("tmi.js");
const say = require("say");
const LanguageDetect = require("languagedetect");

const lngDetector = new LanguageDetect();

const config = JSON.parse(fs.readFileSync("config.json"));
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

client.connect().catch(console.error);

const queue = [];

client.on("message", (channel, tags, message, self) => {
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
