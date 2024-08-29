/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as cheerio from "cheerio";

// The Cloud Functions for Firebase SDK to set up triggers and logging.
import {onSchedule} from "firebase-functions/v2/scheduler";
import {logger} from "firebase-functions";

// The Firebase Admin SDK to delete inactive users.
import admin = require("firebase-admin");
import {getFirestore} from "firebase-admin/firestore";
import {sendMail} from "./mailjet";
admin.initializeApp();
const db = getFirestore();
const getIssues = async () => {
  try {
    const res = await fetch("https://github.com/Expensify/App/issues");
    const text = await res.text();
    const $ = cheerio.load(text);
    const issues: GithubIssue[] = [];
    $("a.v-align-middle").each((index, element) => {
      const url = $(element).attr("href");
      const title = $(element).text().trim();
      const id = url?.split("/").pop();
      if (id) {
        issues.push({id, title});
      }
    });
    const latestIssue = await db.doc("issues/latest").get();
    const latestIssueId = latestIssue.get("id");
    const latestIssueIndex = issues.findIndex(
      (issue) => issue.id === latestIssueId
    );
    const newIssues = issues.slice(
      0,
      latestIssueIndex > -1 ? latestIssueIndex : undefined
    );
    if (newIssues.length) {
      const content = `<ul>${issues
        .map(
          (issue) =>
            `<li><a href='https://github.com/Expensify/App/issues/${issue.id}'>${issue.title}</a></li>`
        )
        .join("")}</ul>`;
      await sendMail(
        "drminh2807@gmail.com",
        `[Expensify] ${issues[0].title}`,
        content
      );
      await db.doc("issues/latest").set({id: issues[0].id});
    }
    logger.info(`Latest issueId ${issues[0]?.id}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.error(error?.message);
  }
};

exports.getIssuesCrontab = onSchedule("15 * * * *", getIssues);
