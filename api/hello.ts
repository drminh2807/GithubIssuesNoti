// Use the @vercel/functions package to import waitUntil
import { waitUntil } from "@vercel/functions";
import getIssues from "../services/getIssues";


export function GET(request: Request) {
  waitUntil(getIssues());
  return new Response(`Hello from ${request.url}, I'm a Vercel Function!`);
}
