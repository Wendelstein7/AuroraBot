export const ENABLED_MODULES = (process.env.ENABLED_MODULES || "").trim().split(",");

export const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN as string | undefined;
export const DISCORD_GUILD_ID  = process.env.DISCORD_GUILD_ID as string | undefined;

export const DEBUG = process.env.NODE_ENV === "development";
