/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as cheerio from "cheerio";
import { GithubIssue } from "./GithubIssue";
const fetchIssues = async () => {
  const res = await fetch("https://github.com/Expensify/App/issues");
  const text = await res.text();
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
  return issues;
};

export default fetchIssues;
