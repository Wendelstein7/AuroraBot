module.exports = {
  enabled: true,

  name: "System",
  description: "This module implements various core-functions.",

  commands: [],

  events: [
    {
      name: "ready",
      once: true,
      execute(client) {
        console.log(
          `The bot is online! Logged in as ${client.user.tag} (id: ${client.user.id})`
        );
      },
    },
    {
      name: "rateLimit",
      once: false,
      execute(data) {
        console.log(
          `Rate limit exceeded! (Expires in ${data.timeout ?? "?"} ms)`
        );
      },
    },
    {
      name: "guildUnavailable",
      once: false,
      execute(guild) {
        console.warn(
          `Guild ${guild.id} has become unavailable. This could be due to Discord outages.`
        );
      },
    },
    {
      name: "warn",
      once: false,
      execute(warning) {
        console.warn(`Warning: ${warning}`);
      },
    },
  ],
};
