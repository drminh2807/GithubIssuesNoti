const sendSlack = async (text: string) => {
  const response = await fetch(process.env.SLACK_WEBHOOK ?? "", {
    method: "POST",
    body: JSON.stringify({ text }),
    headers: { "Content-Type": "application/json" },
  });
  return response.json();
};

export default sendSlack;
