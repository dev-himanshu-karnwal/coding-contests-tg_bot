const { Telegraf } = require("telegraf");
const axios = require("axios");
const server = require("http").createServer();
require("dotenv").config();

// create bot using token
const bot = new Telegraf(process.env.TOKEN);

const showMainMenu = async (ctx) => {
  ctx.deleteMessage();

  ctx.telegram.sendMessage(
    ctx.chat.id,
    "Which coding contests to be showcased?",
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Show All Contests", callback_data: "all" }],
          [{ text: "Choose Site based", callback_data: "site-based" }],
          [
            {
              text: "Running / Yet to start based",
              callback_data: "status-based",
            },
          ],
          [
            {
              text: "Running within 24 hours",
              callback_data: "in-24-hours",
            },
          ],
        ],
      },
    }
  );
};

bot.start((ctx) => {
  ctx.reply("Hello, lets get started");
  showMainMenu(ctx);
});
bot.help(showMainMenu);

bot.action("main-menu", showMainMenu);

bot.action("all", async (ctx) => {
  ctx.deleteMessage();

  const sendResponse = (res) => {
    ctx.telegram.sendMessage(ctx.chat.id, res, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "Back to main menu", callback_data: "main-menu" }],
        ],
      },
    });
  };

  try {
    const result = await axios.get(`https://kontests.net/api/v1/all`);
    const contests = result.data;

    if (!contests.length)
      return sendResponse("No contests available at current moment");

    const response = contests.slice(0, 30).reduce((acc, contest, i) => {
      return (
        acc +
        `${i + 1}: <a href="${contest.url}">${contest.name}</a>\nSite: ${
          contest.site
        }\n\n`
      );
    }, "");
    sendResponse(
      response + '\n\n\n<a href="https://kontests.net">See more</a>'
    );
  } catch (err) {
    sendResponse("Faced Error getting All contests");
  }
});

bot.action("site-based", (ctx) => {
  ctx.deleteMessage();

  ctx.telegram.sendMessage(
    ctx.chat.id,
    "Choose CP site whose contests to be showcased?",
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Leet Code", callback_data: "leet_code" }],
          [
            { text: "Code Chef", callback_data: "code_chef" },
            { text: "Hacker Rank", callback_data: "hacker_rank" },
          ],
          [
            { text: "Hacker Earth", callback_data: "hacker_earth" },
            { text: "Code Forces", callback_data: "codeforces" },
          ],
          [
            { text: "At Coder", callback_data: "at_Coder" },
            { text: "CS Academy", callback_data: "cs_academy" },
          ],
          [{ text: "Back to Main Menu", callback_data: "main-menu" }],
        ],
      },
    }
  );
});

// prettier-ignore
[ "codeforces", "top_coder", "at_coder", "code_chef", "cs_academy", "hacker_rank", "hacker_earth", "leet_code" ].forEach((site) => {
  bot.action(site, async (ctx) => {
    ctx.deleteMessage();

    const sendResponse = (res) => {
      ctx.telegram.sendMessage(ctx.chat.id, res, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "Back to Sites menu", callback_data: "site-based" }],
          ],
        },
      });
    };

    try {
      const result = await axios.get(`https://kontests.net/api/v1/${site}`);
      const contests = result.data;

      if (!contests.length)
        return sendResponse(
          "No contests available for this Site at current moment"
        );

      const response = contests.slice(0, 30).reduce((acc, contest, i) => {
        return (
          acc +
          `${i + 1}: <a href="${contest.url}">${
            contest.name
          }</a>\nStart at: ${new Date(
            contest.start_time
          ).toLocaleString()}\nEnds at: ${new Date(
            contest.end_time
          ).toLocaleString()}\nStatus: ${
            contest.status === "CODING" ? "Running" : "Yet to start"
          }\nDuration: ${Math.round(+contest.duration / 3600, 1)} hours\n\n`
        );
      }, "");
      sendResponse(
        response + '\n\n\n<a href="https://kontests.net">See more</a>'
      );
    } catch (err) {
      sendResponse("Faced Error getting contests for this site");
    }
  });
});

bot.action("status-based", (ctx) => {
  ctx.deleteMessage();

  ctx.telegram.sendMessage(ctx.chat.id, "What contests are to be showed?", {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Running", callback_data: "CODING" },
          { text: "Yet to start", callback_data: "BEFORE" },
        ],
        [{ text: "Back to Main Menu", callback_data: "main-menu" }],
      ],
    },
  });
});

["CODING", "BEFORE"].forEach((status) => {
  bot.action(status, async (ctx) => {
    ctx.deleteMessage();

    const sendResponse = (res) => {
      ctx.telegram.sendMessage(ctx.chat.id, res, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "Back to Last Menu", callback_data: "status-based" }],
          ],
        },
      });
    };

    try {
      const result = await axios.get(`https://kontests.net/api/v1/all`);
      const contests = result.data;

      if (!contests.length)
        return sendResponse(
          `No ${
            status === "CODING" ? "Running" : "Yet to start"
          } contests available at current moment`
        );

      const response = contests
        .filter((contest) => contest.status === status)
        .slice(0, 30)
        .reduce((acc, contest, i) => {
          return (
            acc +
            `${i + 1}: <a href="${contest.url}">${contest.name}</a>\nSite: ${
              contest.site
            }\n\n`
          );
        }, "");

      if (!response)
        return sendResponse(
          `No ${
            status === "CODING" ? "Running" : "Yet to start"
          } contests available at current moment`
        );

      sendResponse(
        response + '\n\n\n<a href="https://kontests.net">See more</a>'
      );
    } catch (err) {
      sendResponse("Faced Error getting All contests");
    }
  });
});

bot.action("in-24-hours", async (ctx) => {
  ctx.deleteMessage();

  const sendResponse = (res) => {
    ctx.telegram.sendMessage(ctx.chat.id, res, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "Back to Main Menu", callback_data: "main-menu" }],
        ],
      },
    });
  };

  try {
    const result = await axios.get(`https://kontests.net/api/v1/all`);
    const contests = result.data;

    if (!contests.length)
      return sendResponse("No Running contests available at current moment");

    const response = contests
      .filter((contest) => contest.in_24_hours === "YES")
      .slice(0, 30)
      .reduce((acc, contest, i) => {
        return (
          acc +
          `${i + 1}: <a href="${contest.url}">${contest.name}</a>\nSite: ${
            contest.site
          }\n\n`
        );
      }, "");

    if (!response) return sendResponse("No Contests in coming 24 hours");

    sendResponse(
      response + '\n\n\n<a href="https://kontests.net">See more</a>'
    );
  } catch (err) {
    sendResponse("Faced Error getting in 24 hours contests");
  }
});

// launches bot
bot.launch();

server.listen();
