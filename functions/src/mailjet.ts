/**
 *
 * This call sends a message to the given recipient with vars and custom vars.
 *
 */
import {Client} from "node-mailjet";
export const sendMail = (email: string, subject: string, content: string) => {
  const mailjet = Client.apiConnect(
    process.env.MJ_APIKEY_PUBLIC ?? "",
    process.env.MJ_APIKEY_PRIVATE ?? ""
  );
  return mailjet.post("send", {version: "v3.1"}).request({
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
