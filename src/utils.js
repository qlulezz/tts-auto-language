const consoleColors = {
  gray: 0,
  red: 1,
  green: 2,
  yellow: 3,
  blue: 4,
  purple: 5,
  cyan: 6,
};

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

module.exports = {
  log,
};
