const fs = require("fs");
const { log } = require("./utils");

let config;
let botList = [];

async function startViewerBot() {
  config = JSON.parse(fs.readFileSync("config.json"));
  await loadBots();
  await startComparingUsers();
}

async function startComparingUsers() {
  const chatters = await getChatters(config.auth.twitch_channel_name);
  const changes = compareUsers(chatters);

  if (changes.joined.length > 0) {
    log(config.viewers.join_message.replace("{{users}}", formatUserList(changes.joined)), "green");
  }
  if (changes.left.length > 0) {
    log(config.viewers.leave_message.replace("{{users}}", formatUserList(changes.left)), "gray");
  }
  if (changes.left.length > 0 || changes.joined.length > 0) {
    log(config.viewers.count_message.replace("{{count}}", chatters.length), "yellow");
  }

  setTimeout(startComparingUsers, 60000);
}

function formatUserList(list) {
  return list
    .map((user) => `${user.user}${user.role !== "viewers" ? ` (${user.role})` : ""}`)
    .join(", ");
}

async function getChatters(user) {
  try {
    const res = await fetch("https://gql.twitch.tv/gql#origin=twilight", {
      headers: {
        "Client-Id": "kimne78kx3ncx6brgo4mv6wki5h1ko",
      },
      body: `[{"operationName":"CommunityTab","variables":{"login":"${user}"},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"2e71a3399875770c1e5d81a9774d9803129c44cf8f6bad64973aa0d239a88caf"}}}]`,
      method: "POST",
    });
    const json = await res.json();
    const chatters = json[0].data.user.channel.chatters;
    return transformToUserRoles(chatters);
  } catch {
    return [];
  }
}

function transformToUserRoles(inputObject) {
  const outputArray = [];

  for (const role in inputObject) {
    if (Array.isArray(inputObject[role])) {
      inputObject[role].forEach((chatter) => {
        if (
          role !== "broadcasters" &&
          !(!config.viewers.include_bots && checkForBot(chatter.login))
        ) {
          outputArray.push({ role, user: chatter.login });
        }
      });
    }
  }

  return outputArray;
}

async function loadBots() {
  const res = await fetch(
    "https://raw.githubusercontent.com/arrowgent/Twitchtv-Bots-List/main/list.txt"
  );
  const list = await res.text();
  botList = list.split("\n");
}

function checkForBot(user) {
  return botList.find((bot) => bot === user);
}

let previousState = [];
function compareUsers(currentState) {
  const previousUsers = previousState.map((obj) => obj.user);
  const currentUsers = currentState.map((obj) => obj.user);

  const left = previousState.filter((obj) => !currentUsers.includes(obj.user));
  const joined = currentState.filter((obj) => !previousUsers.includes(obj.user));

  previousState = currentState;
  return {
    left: left,
    joined: joined,
  };
}

module.exports = {
  startViewerBot,
};
