import { createAgent, gemini } from "@inngest/agent-kit";

const analyzeTicket = async (ticket) => {
  const supportAgent = createAgent({
    model: gemini({
      model: "gemini-1.5-flash-8b",
      apiKey: process.env.GEMINI_API_KEY,
    }),
    name: "AI Gopal Ticket Triage Assistant",
    system: ``,
  });
  const response = await supportAgent.run(`
    -Title: ${ticket.title}
    -Description: ${ticket.description}`);

  const raw = response.output[0].context;
  try {
    const match = raw.match(/```json\s*([\s\S]*?)\s*```/i);
    const jsonString = match ? match[1] : raw.trim();
    return JSON.parse(jsonString);
  } catch (e) {
    console.log("Failed to parse JSON from AI response" + e.message);
    return null;
  }
};

export default analyzeTicket;
