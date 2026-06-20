import { Stagehand } from "@browserbasehq/stagehand";

export type ResearchStagehand = Stagehand;

export function createResearchStagehand(sessionId: string): ResearchStagehand {
  const apiKey = process.env.BROWSERBASE_API_KEY;
  const projectId = process.env.BROWSERBASE_PROJECT_ID;
  const openAiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || !projectId) {
    throw new Error("Browserbase is not configured.");
  }

  if (!openAiKey) {
    throw new Error("OpenAI is not configured.");
  }

  return new Stagehand({
    env: "BROWSERBASE",
    apiKey,
    projectId,
    browserbaseSessionID: sessionId,
    model: {
      modelName: "openai/gpt-4o",
      apiKey: openAiKey,
    },
    disablePino: true,
  });
}
