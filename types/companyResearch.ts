export type CompanyResearchDossier = {
  companyOverview: string;
  techStack: string[];
  culture: string[];
  whyThisRole: string;
  yourEdge: string[];
  gapsToAddress: string[];
  smartQuestions: string[];
  interviewPrep: string[];
  sources: string[];
};

export type ResearchCompanyResponse =
  | {
      success: true;
      data: {
        dossier: CompanyResearchDossier;
      };
    }
  | {
      success: false;
      error: string;
    };

export function parseCompanyResearchDossier(value: unknown): CompanyResearchDossier | null {
  if (!isRecord(value)) return null;

  const dossier = {
    companyOverview: parseString(value.companyOverview),
    techStack: parseStringArray(value.techStack),
    culture: parseStringArray(value.culture),
    whyThisRole: parseString(value.whyThisRole),
    yourEdge: parseStringArray(value.yourEdge),
    gapsToAddress: parseStringArray(value.gapsToAddress),
    smartQuestions: parseStringArray(value.smartQuestions),
    interviewPrep: parseStringArray(value.interviewPrep),
    sources: parseStringArray(value.sources),
  };

  const hasContent =
    dossier.companyOverview ||
    dossier.whyThisRole ||
    dossier.techStack.length > 0 ||
    dossier.culture.length > 0 ||
    dossier.yourEdge.length > 0 ||
    dossier.gapsToAddress.length > 0 ||
    dossier.smartQuestions.length > 0 ||
    dossier.interviewPrep.length > 0;

  return hasContent ? dossier : null;
}

function parseString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
