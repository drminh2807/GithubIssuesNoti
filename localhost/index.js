const cheerio = require("cheerio");
require("dotenv").config();
const nodeMailjet = require("node-mailjet");
const fs = require("fs").promises;
const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  request: {
    agentOptions: {
      keepAlive: true,
      family: 4,
    },
    url: "https://api.telegram.org",
  },
});

const sendMail = (email, subject, content) => {
  const mailjet = nodeMailjet.Client.apiConnect(
    process.env.MJ_APIKEY_PUBLIC ?? "",
    process.env.MJ_APIKEY_PRIVATE ?? ""
  );
  return mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: "minh@spritely.co",
          Name: "Expensify",
        },
        To: [
          {
            Email: email,
            Name: email,
          },
        ],
        TemplateID: 6244256,
        TemplateLanguage: true,
        Subject: subject,
        Variables: {
          CONTENT: content,
        },
      },
    ],
  });
};

let cachedLatestIssueId = "";
const getIssues = async () => {
  try {
    console.log("1");
    const res = await fetch("https://github.com/Expensify/App/issues");
    const text = await res.text();
    console.log("2");
    const $ = cheerio.load(text);
    const issues = [];
    $("a").each((index, element) => {
      const url = $(element).attr("href");
      const className = $(element).attr("class");
      const title = $(element).text().trim();
      const id = url?.split("/Expensify/App/issues/").pop();
      if (
        id &&
        Number(id) &&
        issues.length === 0 &&
        Number(id) > Number(cachedLatestIssueId) &&
        className.includes("TitleHeader")
      ) {
        cachedLatestIssueId = id;
        issues.push({ id, title });
      }
    });
    for (const issue of issues) {
      const text = `${issue.title} https://github.com/Expensify/App/issues/${issue.id}`;
      bot.sendMessage(process.env.TELEGRAM_CHAT_ID, text);
    }
    console.log(`Latest issueId ${cachedLatestIssueId}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error) {
    console.log(error?.message);
  }
};

setInterval(() => {
  getIssues();
}, 5000);
