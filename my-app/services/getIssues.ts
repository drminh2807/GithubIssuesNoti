/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import axios from "axios";
import fetchIssues from "./fetchIssues";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL ?? "";
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseKey);

const getIssues = async () => {
  try {
    const issues = await fetchIssues();
    const result = await supabase.from("issues").select("*").limit(1);
    const latestIssueId = result.data?.[0]?.issue_id;
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
            `- ${issue.title} https://github.com/Expensify/App/issues/${issue.id}`
        )
        .join("\n");
      const result = await axios.post(process.env.SLACK_WEBHOOK ?? "", {
        text: text,
      });
      if (result.status === 200) {
        await supabase.from("issues").insert({ issue_id: newIssues[0].id });
        return `New issues have been sent to Slack: ID ${newIssues[0].id}`;
      }
    }
    return "Have no new issue";
  } catch (error: any) {
    return error.message as string;
  }
};

export default getIssues;
