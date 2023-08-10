function checkForCommand(message) {
  const ttsSetCommandRegex = /^!tts\s+set\s+nickname\s+@?(\w+)\s+(.*)$/i;
  const ttsStopCommandRegex = /^!tts\s+stop$/i;

  if (ttsSetCommandRegex.test(message)) {
    const match = message.match(ttsSetCommandRegex);
    const userName = match[1];
    const rawInput = match[2];
    return {
      command: "tts-nickname",
      userName,
      rawInput,
    };
  } else if (ttsStopCommandRegex.test(message)) {
    return {
      command: "tts-stop",
    };
  } else {
    return {
      command: "unknown",
    };
  }
}

module.exports = {
  checkForCommand,
};
