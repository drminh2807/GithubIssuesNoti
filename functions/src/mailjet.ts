/**
 *
 * This call sends a message to the given recipient with vars and custom vars.
 *
 */
import {Client} from "node-mailjet";
import {defineSecret} from "firebase-functions/params";
const publicKey = defineSecret("MJ_APIKEY_PUBLIC");
const privateKey = defineSecret("MJ_APIKEY_PRIVATE");
export const sendMail = (email: string, subject: string, content: string) => {
  const mailjet = Client.apiConnect(publicKey.value(), privateKey.value());
  return mailjet.post("send", {version: "v3.1"}).request({
    Messages: [
      {
        From: {
          Email: "drminh2807@gmail.com",
          Name: "Minh",
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
