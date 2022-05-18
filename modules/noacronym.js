let available = [
  "Yo LUA isn't an acronym",
  "LUA - Lua Uppercase Accident",
  "\"LUA\" Nice acronym you got there",
  "LUA here LUA there how about you LUA ya mom",
  "LUA isn't an acronym",
  "People be like: muh muh muh LUA I don't even think they know what they talk about!",
  "People keep yelling this \"LUA\" person I think they aren't actually listening back",
  "That's not how the word Lua works",
  "Yeah... \"LUA\"",
  "LUA? Who even is LUA?",
  "This \"LUA\" keeps me awake at night do they think it's an acronym, do they think they're yelling I don't even know!",
  "LUA...",
  "Starting to think that my creation was merely so I could watch people throw \"LUA\" to places"
];

let repetitive = [
  "Yeah yeah keep going you're doing great",
  "*leaves*",
  "You think you're smart with your \"haha I'm gonna make Aurora mad by throwing LUA to places\" eh?",
  "Yeah... sure...",
  "Can people even feel themselves?",
  "do you know how to read?",
  "Learning how words work is halfway into typing, senselessly typing buttons like what you're doing is not the sole component",
  "Metatablejackson was gonna enter your room at 3am but your stubbornness scared him away, good job?",
  "\"Yeah yeah yeah haha funny look at that Aurora Bot wee! look at it go!!!\" I hope your friends find this concerning",
  "mhmmm yep humanity is screwed",
  "yes yes yes good job keep going",
  "keep going then yeah",
  "mhmm",
  "you keep joking without punch lines",
  "life must've been a never-ending parade of joy for you to even consider this funny",
  "\"Weeee look at it go!!\"",
  "yes yes keep going",
  "I would've sent a \"no maidens?\" meme but I think that's your least of concerns, you brain is also missing",
  "haha funniiiii!!!!!",
  "HAHAHAHAHAHAH",
  "at this point you're either messing around, or you're an idiot"
]

let spammed = [
  "This user thinks they're cool by trying to upset me! Look at them go!",
  "It's perplexing how doing this on purpose is fun to you",
  "Do you actually think you can just go \"OH I BET I CAN UPSET AURORA!\" yeah well not on my watch",
  "You must think you're so cool by spamming it over and over again",
  "What are you gonna do next? Spam about monkeys fixing hydraulic pumps using a sandwich?",
  "You just keep doing things on purpose don't you!",
  "You find this so amazing you just have to do it on purpose!",
  "How is this enjoying to you? Spamming it over and over again just to upset me?",
  "\"Oh!! Have you ever tried to anger Aurora Bot with 'LUA'?? That thing is my favourite!!! XD",
  "Calm down there can't be an idiot too many times",
  "yes yes keep spamming can't wait to see it",
  "I bet you're gonna screenshot this moment and treasure it on a wall, \"the moment I spammed repeatedly to trigger Aurora\" yes your most prized creation can't wait to hear it",
  "There's good people, there's bad people, and there's you spamming to trigger me",
  "\"hehe I'm gonna trigger Aurora hehehehehe\"",
  "You think you're so clever don't you? Running around throwing \"LUA\"s trying to trigger me and going \"hehehehhehee Auroura\"",
  "I know you're spamming",
  "So clever trying to trigger me well not on my watch",
  "Amazing, keep going try to trigger me",
  "You're so clever aren't you",
  "spam spam spam haha!!",
  "I can confidently tell every message you send trying to trigger me is analogous to the rate the neurons on your brain fire",
  "You got nothing better to do other than trying to trigger me?"
]

/**
 * @type {{[item: string]: number}}
 */
let completelyLocked = Object.create(null);

/**
 * @type {{[item: string]: number}}
 */
let firstPayloadLocked = Object.create(null);

/**
 * @type {{[item: string]: number}}
 */
let spamCounter = Object.create(null);

/**
 * @type {(NodeJS.Timeout | null)}
 */
let spamCounterT = null;

function drownSpam() {
  let entries = Object.keys(spamCounter);

  if (entries.length === 0) {
    spamCounterT = null;
    return;
  }

  for (let i of entries) {
    spamCounter[i] *= 0.9;

    if (spamCounter[i] < 0.1) {
      spamCounter[i] = undefined;
    }
  }

  spamCounterT = setTimeout(drownSpam, 1000)
}


/**
 * @param {{[item: string]: number}} limiter
 * @param {string} id
 * @param {number} rate
 * @param {boolean} apply
 * @returns {boolean}
 */
function ratelimited(limiter, id, rate, apply = false) {
  let time = new Date().getTime();

  let limited = limiter[id] !== undefined && limiter[id] > time - rate

  if (!limited && apply) {
    limiter[id] = time;
  }

  return limited;
}

/**
 * @template T
 * @param {T[]} l 
 * @returns {T}
 */
function choice(l) {
  return l[Math.floor(Math.random() * l.length)]
}


/**
 * 
 * @param {string} id
 * @param {string} content
 */
function replying(id, content) {
  return {
    reply: {
      messageReference: id
    },

    content: content
  }
}

let limit = 1000 * 60 * 60 * 60  // 1h

module.exports = {
  enabled: true,

  name: "No acronym",
  description: "LUA isn't uppercase",

  commands: [],

  events: [
    {
      name: "messageCreate",
      once: false,
      /**
       * @param { import("discord.js").Client } client
       */
      async execute(message, client) {

        if (client.user.id !== message.author.id && message.content.includes("LUA") && !ratelimited(completelyLocked, message.author.id, limit)) {
          let channel = /** @type {import("discord.js").TextChannel} */ await client.channels.fetch(message.channelId);

          if(spamCounter[message.author.id] === undefined) {
            spamCounter[message.author.id] = 0;
          }

          spamCounter[message.author.id] += 1;

          if (spamCounterT === null) {
            spamCounterT = setTimeout(drownSpam, 1000);
          }

          if (spamCounter[message.author.id] > 5) {
            ratelimited(completelyLocked, message.author.id, limit, true);

            await channel.send(replying(message.id, choice(spammed)));
          }
          else if (ratelimited(firstPayloadLocked, message.author.id, limit)) {
            ratelimited(completelyLocked, message.author.id, limit, true);

            await channel.send(replying(message.id, choice(repetitive)));
          }
          else if (Math.random() > 0.95) {
            ratelimited(firstPayloadLocked, message.author.id, limit, true);  // ratelimits are done first to prevent race conditions

            await channel.send(replying(message.id, choice(available)));
          }
        }
      }
    }
  ],
};
