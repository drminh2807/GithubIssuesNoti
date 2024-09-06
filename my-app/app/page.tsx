import getIssues from "@/services/getIssues";

export default async function Home() {
  const result = await getIssues();
  return <div>{result}</div>;
}
