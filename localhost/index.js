const cheerio = require("cheerio");
require("dotenv").config();
const nodeMailjet = require("node-mailjet");
const fs = require("fs").promises;
const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

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

const getIssues = async () => {
  try {
    console.log("1");
    const res = await fetch("https://github.com/Expensify/App/issues");
    const text = await res.text();
    console.log("2");
    const $ = cheerio.load(text);
    const issues = [];
    $("a.v-align-middle").each((index, element) => {
      const url = $(element).attr("href");
      const title = $(element).text().trim();
      const id = url?.split("/").pop();
      if (id) {
        issues.push({ id, title });
      }
    });
    const latestIssueId = await fs.readFile("./lastIssueId.txt", {
      encoding: "utf-8",
    });
    const latestIssueIndex = issues.findIndex(
      (issue) => issue.id === latestIssueId
    );
    const newIssues = issues.slice(
      0,
      latestIssueIndex > -1 ? latestIssueIndex : undefined
    );
    if (newIssues.length) {
      for (const issue of newIssues) {
        const text = `${issue.title} https://github.com/Expensify/App/issues/${issue.id}`;
        await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, text);
      }
      console.log("4");
      await fs.writeFile("./lastIssueId.txt", newIssues[0].id, {
        encoding: "utf-8",
      });
    }
    console.log(`Latest issueId ${issues[0]?.id}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error) {
    console.log(error?.message);
  }
};

getIssues();
