module.exports = {
  enabled: true,
  name: "ready",
  once: true,
  execute(client) {
    console.log(
      `The bot is online! Logged in as ${client.user.tag} (id: ${client.user.id})`
    );
  },
};
