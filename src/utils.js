const consoleColors = {
  gray: 0,
  red: 1,
  green: 2,
  yellow: 3,
  blue: 4,
  purple: 5,
  cyan: 6,
};

// Color the output
function log(message, color, data = "") {
  const time = new Date().toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (!color) {
    console.log(`[${time}] ${message}`, data);
    return;
  }
  const colorCode = consoleColors[color];
  console.log(`[${time}]\u001b[1;3${colorCode}m ${message}\u001b[0m`, data);
}

// Removes emotes from the chat message
// Can also keep the first occurrence
function removeEmotes(inputString, indexesToRemove, keepFirstOccurrence) {
  const modifiedString = inputString.split("");
  const ranges = [];

  // Transform object to array for sorting
  for (const id in indexesToRemove) {
    if (indexesToRemove.hasOwnProperty(id)) {
      const indicesArray = indexesToRemove[id];
      indicesArray.forEach((indices, i) => {
        ranges.push({
          indices: indices,
          i: i,
        });
      });
    }
  }

  // Sort array from last to first, prevents shifting of text
  ranges.sort((a, b) => b.indices.split("-")[0] - a.indices.split("-")[0]);

  // Loop through emote types
  for (const range of ranges) {
    // Do not remove if it is the first occurrence of that type
    if (!(keepFirstOccurrence && range.i == 0)) {
      const [start, end] = range.indices.split("-").map(Number);
      modifiedString.splice(start, end - start + 1);
    }
  }

  return modifiedString.join("");
}

module.exports = {
  log,
  removeEmotes,
};
