const { log } = require("./utils");
const fs = require("fs");
const path = require("path");
const sound = require("sound-play");

// Using Google Translate TTS
// See: https://gist.github.com/alotaiba/1728771

// Transform query into url
function getTTSURL(query, voice) {
  let url =
    "http://translate.google.com/translate_tts?ie=UTF-8&total=1&idx=0&textlen=32&client=tw-ob&";
  url += "q=" + encodeURI(query);
  url += "&tl=" + voice.split(" ").pop();

  return url;
}

async function readText(message, language) {
  const url = getTTSURL(message, language);
  await playAudioFromURL(url);
}

async function playAudioFromURL(url) {
  try {
    // Fetch audio from Google
    const response = await fetch(url);

    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      const folderPath = path.join(process.cwd(), "/temp");
      const filePath = path.join(folderPath, "last_message.mp3");

      // Temporarily save TTS audio as mp3 file
      fs.writeFileSync(filePath, Buffer.from(arrayBuffer), "binary");
      await sound.play(filePath, 1.0);
    } else {
      log("Failed to fetch audio:", "red", response.statusText);
    }
  } catch (error) {
    log("An error occurred:", "red", error.message);
  }
}

// Available Voices:
// https://cloud.google.com/text-to-speech/docs/voices
const availableVoices = [
  "Google Afrikaans (South Africa) af-ZA",
  "Google Arabic ar-XA",
  "Google Basque (Spain) eu-ES",
  "Google Bengali (India) bn-IN",
  "Google Bulgarian (Bulgaria) bg-BG",
  "Google Catalan (Spain) ca-ES",
  "Google Chinese (Hong Kong) yue-HK",
  "Google Czech (Czech Republic) cs-CZ",
  "Google Danish (Denmark) da-DK",
  "Google Dutch (Belgium) nl-BE",
  "Google Dutch (Netherlands) nl-NL",
  "Google English (Australia) en-AU",
  "Google English (India) en-IN",
  "Google English (UK) en-GB",
  "Google English (US) en-US",
  "Google Filipino (Philippines) fil-PH",
  "Google Finnish (Finland) fi-FI",
  "Google French (Canada) fr-CA",
  "Google French (France) fr-FR",
  "Google Galician (Spain) gl-ES",
  "Google German (Germany) de-DE",
  "Google Greek (Greece) el-GR",
  "Google Gujarati (India) gu-IN",
  "Google Hebrew (Israel) he-IL",
  "Google Hindi (India) hi-IN",
  "Google Hungarian (Hungary) hu-HU",
  "Google Icelandic (Iceland) is-IS",
  "Google Indonesian (Indonesia) id-ID",
  "Google Italian (Italy) it-IT",
  "Google Japanese (Japan) ja-JP",
  "Google Kannada (India) kn-IN",
  "Google Korean (South Korea) ko-KR",
  "Google Latvian (Latvia) lv-LV",
  "Google Lithuanian (Lithuania) lt-LT",
  "Google Malay (Malaysia) ms-MY",
  "Google Malayalam (India) ml-IN",
  "Google Mandarin Chinese cmn-CN",
  "Google Mandarin Chinese cmn-TW",
  "Google Marathi (India) mr-IN",
  "Google Norwegian (Norway) nb-NO",
  "Google Polish (Poland) pl-PL",
  "Google Portuguese (Brazil) pt-BR",
  "Google Portuguese (Portugal) pt-PT",
  "Google Punjabi (India) pa-IN",
  "Google Romanian (Romania) ro-RO",
  "Google Russian (Russia) ru-RU",
  "Google Serbian (Cyrillic) sr-RS",
  "Google Slovak (Slovakia) sk-SK",
  "Google Spanish (Spain) es-ES",
  "Google Spanish (US) es-US",
  "Google Swedish (Sweden) sv-SE",
  "Google Tamil (India) ta-IN",
  "Google Telugu (India) te-IN",
  "Google Thai (Thailand) th-TH",
  "Google Turkish (Turkey) tr-TR",
  "Google Ukrainian (Ukraine) uk-UA",
  "Google Vietnamese (Vietnam) vi-VN",
];

module.exports = {
  readText,
  availableVoices,
};
