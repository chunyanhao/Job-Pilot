import path from "node:path";
import { pathToFileURL } from "node:url";
import OpenAI from "openai";
import { PDFParse } from "pdf-parse";

import { parseExtractedProfile } from "@/lib/profile";
import type { ProfileFormValues } from "@/types/profile";

const MIN_EXTRACTED_TEXT_LENGTH = 80;
const MAX_PROMPT_TEXT_LENGTH = 18000;

const pdfWorkerPath = path.join(process.cwd(), "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs");

PDFParse.setWorker(pathToFileURL(pdfWorkerPath).href);

type ExtractProfileResult =
  | {
      success: true;
      data: ProfileFormValues;
    }
  | {
      success: false;
      error: string;
    };

export async function extractProfileFromResume(
  resumeBuffer: ArrayBuffer,
  fallbackEmail: string,
): Promise<ExtractProfileResult> {
  try {
    const resumeText = await extractTextFromPdf(resumeBuffer);

    if (resumeText.length < MIN_EXTRACTED_TEXT_LENGTH) {
      return {
        success: false,
        error: "Could not extract text from this PDF. Please try a different file.",
      };
    }

    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: "Resume extraction is not configured yet.",
      };
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 800,
      messages: [
        {
          role: "system",
          content: createSystemPrompt(),
        },
        {
          role: "user",
          content: `Resume text:\n${resumeText.slice(0, MAX_PROMPT_TEXT_LENGTH)}`,
        },
      ],
    });

    const content = response.choices[0]?.message.content;
    if (!content) {
      return {
        success: false,
        error: "Could not extract profile details from this resume.",
      };
    }

    const parsed = parseModelJson(content);
    if (!parsed.success) {
      return {
        success: false,
        error: "Could not extract profile details from this resume.",
      };
    }

    return {
      success: true,
      data: parseExtractedProfile(parsed.value, fallbackEmail),
    };
  } catch (error) {
    console.error("[agent/profile-extractor]", error);
    return {
      success: false,
      error: "Could not extract profile details from this resume.",
    };
  }
}

async function extractTextFromPdf(resumeBuffer: ArrayBuffer): Promise<string> {
  const parser = new PDFParse({ data: resumeBuffer });

  try {
    const result = await parser.getText();
    return result.text.replace(/\s+/g, " ").trim();
  } finally {
    await parser.destroy();
  }
}

function parseModelJson(content: string): { success: true; value: unknown } | { success: false } {
  try {
    return { success: true, value: JSON.parse(content) };
  } catch {
    return { success: false };
  }
}

function createSystemPrompt(): string {
  return `You extract editable candidate profile data from resume text.

Return ONLY valid JSON with this exact object shape:
{
  "fullName": string,
  "phone": string,
  "location": string,
  "linkedinUrl": string,
  "portfolioUrl": string,
  "workAuthorization": "citizen" | "permanent_resident" | "visa_required" | "",
  "currentTitle": string,
  "experienceLevel": "junior" | "mid" | "senior" | "lead" | "",
  "yearsExperience": string,
  "skills": string[],
  "industries": string[],
  "workExperience": [
    {
      "companyName": string,
      "jobTitle": string,
      "startDate": string,
      "endDate": string,
      "currentlyWorking": boolean,
      "responsibilities": string
    }
  ],
  "education": {
    "highestDegree": string,
    "fieldOfStudy": string,
    "institutionName": string,
    "graduationYear": string
  },
  "jobTitlesSeeking": string,
  "remotePreference": "remote" | "onsite" | "hybrid" | "any" | "",
  "salaryExpectation": string,
  "preferredLocations": string,
  "coverLetterTone": "formal" | "casual" | "enthusiastic" | ""
}

Rules:
- Use empty strings or empty arrays when a field is not present in the resume.
- Do not invent salary, work authorization, remote preference, or preferred locations.
- Keep workExperience to the three most recent roles.
- Put role achievements and responsibilities in one concise multiline string per role.
- Infer experienceLevel only from seniority signals in titles and responsibility scope.
- Use yearsExperience as a plain number string when it can be estimated from dates.
- Normalize links to full URLs when the resume contains enough information.`;
}
