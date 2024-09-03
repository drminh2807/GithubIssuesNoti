/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as cheerio from "cheerio";
import axios from "axios";
// The Firebase Admin SDK to delete inactive users.
import admin = require("firebase-admin");
import { getFirestore } from "firebase-admin/firestore";
import { GithubIssue } from "./GithubIssue";
var serviceAccount = require("/Users/minh/githubissuesnoti-firebase-adminsdk-ysx6h-2169c24e3b.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = getFirestore();
const getIssues = async () => {
  try {
    console.log(1);
    const res = await fetch("https://github.com/Expensify/App/issues");
    console.log(2);
    const text = await res.text();
    console.log(3);
    const $ = cheerio.load(text);
    const issues: GithubIssue[] = [];
    $("a.v-align-middle").each((index, element) => {
      const url = $(element).attr("href");
      const title = $(element).text().trim();
      const id = url?.split("/").pop();
      if (id) {
        issues.push({ id, title });
      }
    });
    console.log(4);
    const latestIssue = await db.doc("issues/latest").get();
    console.log(5);
    const latestIssueId = latestIssue.get("id");
    const latestIssueIndex = issues.findIndex(
      (issue) => issue.id === latestIssueId
    );
    const newIssues = issues.slice(
      0,
      latestIssueIndex > -1 ? latestIssueIndex : undefined
    );
    if (newIssues.length) {
      const text = newIssues
        .map(
          (issue) =>
            `- ${issue.title} [link](https://github.com/Expensify/App/issues/${issue.id})`
        )
        .join("\n");
      console.log(6);
      const result = await axios.post(process.env.SLACK_WEBHOOK ?? "", {
        text: text,
      });
      console.log(7);
      if (result.status === 200) {
        console.log(8);
        await db.doc("issues/latest").set({ id: newIssues[0].id });
        console.log(9);
      }
    }
    console.log(`Latest issueId ${issues[0]?.id}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
  }
};

export default getIssues;
