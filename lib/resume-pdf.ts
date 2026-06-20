import PDFDocument from "pdfkit";

import type { ProfileFormValues, WorkExperienceItem } from "@/types/profile";

const PAGE_MARGIN = 54;
const CONTENT_WIDTH = 504;
const PDF_COLORS = {
  accent: "#7c5cfc",
  border: "#e7eaf3",
  textPrimary: "#101828",
  textSecondary: "#6a7282",
  textDark: "#364153",
};

export async function generateResumePdf(profile: ProfileFormValues): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({
      margins: {
        top: PAGE_MARGIN,
        bottom: PAGE_MARGIN,
        left: PAGE_MARGIN,
        right: PAGE_MARGIN,
      },
      size: "LETTER",
    });

    doc.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });
    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    doc.on("error", reject);

    drawResume(doc, profile);
    doc.end();
  });
}

function drawResume(doc: PDFKit.PDFDocument, profile: ProfileFormValues): void {
  drawHeader(doc, profile);
  drawSection(doc, "Profile", [createProfileSummary(profile)]);
  drawListSection(doc, "Skills", profile.skills);
  drawExperience(doc, profile.workExperience);
  drawEducation(doc, profile);
  drawListSection(doc, "Industries", profile.industries);
}

function drawHeader(doc: PDFKit.PDFDocument, profile: ProfileFormValues): void {
  doc.fillColor(PDF_COLORS.textPrimary).font("Helvetica-Bold").fontSize(24).text(profile.fullName || "Resume", {
    width: CONTENT_WIDTH,
  });

  if (profile.currentTitle) {
    doc.moveDown(0.25).font("Helvetica").fontSize(11).fillColor(PDF_COLORS.textDark).text(profile.currentTitle);
  }

  const contactItems = [
    profile.email,
    profile.phone,
    profile.location,
    profile.linkedinUrl,
    profile.portfolioUrl,
  ].filter(Boolean);

  if (contactItems.length > 0) {
    doc.moveDown(0.6).font("Helvetica").fontSize(9).fillColor(PDF_COLORS.textSecondary).text(contactItems.join("  |  "), {
      width: CONTENT_WIDTH,
    });
  }

  doc
    .moveDown(0.9)
    .strokeColor(PDF_COLORS.border)
    .lineWidth(1)
    .moveTo(PAGE_MARGIN, doc.y)
    .lineTo(PAGE_MARGIN + CONTENT_WIDTH, doc.y)
    .stroke();
  doc.moveDown(0.8);
}

function drawSection(doc: PDFKit.PDFDocument, title: string, paragraphs: string[]): void {
  const content = paragraphs.filter(Boolean);
  if (content.length === 0) return;

  ensureSpace(doc, 90);
  drawSectionTitle(doc, title);
  content.forEach((paragraph) => {
    doc.font("Helvetica").fontSize(10).fillColor(PDF_COLORS.textDark).text(paragraph, {
      width: CONTENT_WIDTH,
      lineGap: 2,
    });
    doc.moveDown(0.4);
  });
  doc.moveDown(0.3);
}

function drawListSection(doc: PDFKit.PDFDocument, title: string, items: string[]): void {
  const content = items.filter(Boolean);
  if (content.length === 0) return;

  ensureSpace(doc, 80);
  drawSectionTitle(doc, title);
  doc.font("Helvetica").fontSize(10).fillColor(PDF_COLORS.textDark).text(content.join(", "), {
    width: CONTENT_WIDTH,
    lineGap: 2,
  });
  doc.moveDown(0.8);
}

function drawExperience(doc: PDFKit.PDFDocument, roles: WorkExperienceItem[]): void {
  const completeRoles = roles.filter((role) => role.companyName || role.jobTitle || role.responsibilities);
  if (completeRoles.length === 0) return;

  drawSectionTitle(doc, "Experience");
  completeRoles.forEach((role) => {
    ensureSpace(doc, 96);

    const title = [role.jobTitle, role.companyName].filter(Boolean).join(" - ");
    if (title) {
      doc.font("Helvetica-Bold").fontSize(11).fillColor(PDF_COLORS.textPrimary).text(title, {
        width: CONTENT_WIDTH,
      });
    }

    const dates = [role.startDate, role.currentlyWorking ? "Present" : role.endDate].filter(Boolean).join(" - ");
    if (dates) {
      doc.moveDown(0.15).font("Helvetica").fontSize(9).fillColor(PDF_COLORS.textSecondary).text(dates, {
        width: CONTENT_WIDTH,
      });
    }

    if (role.responsibilities) {
      doc.moveDown(0.3).font("Helvetica").fontSize(10).fillColor(PDF_COLORS.textDark).text(role.responsibilities, {
        width: CONTENT_WIDTH,
        lineGap: 2,
      });
    }

    doc.moveDown(0.7);
  });
}

function drawEducation(doc: PDFKit.PDFDocument, profile: ProfileFormValues): void {
  const { education } = profile;
  const degree = [education.highestDegree, education.fieldOfStudy].filter(Boolean).join(" in ");
  const details = [education.institutionName, education.graduationYear].filter(Boolean).join(" | ");

  if (!degree && !details) return;

  ensureSpace(doc, 70);
  drawSectionTitle(doc, "Education");

  if (degree) {
    doc.font("Helvetica-Bold").fontSize(11).fillColor(PDF_COLORS.textPrimary).text(degree, {
      width: CONTENT_WIDTH,
    });
  }

  if (details) {
    doc.moveDown(0.2).font("Helvetica").fontSize(10).fillColor(PDF_COLORS.textDark).text(details, {
      width: CONTENT_WIDTH,
    });
  }

  doc.moveDown(0.8);
}

function drawSectionTitle(doc: PDFKit.PDFDocument, title: string): void {
  doc.font("Helvetica-Bold").fontSize(10).fillColor(PDF_COLORS.accent).text(title.toUpperCase(), {
    width: CONTENT_WIDTH,
  });
  doc.moveDown(0.35);
}

function createProfileSummary(profile: ProfileFormValues): string {
  const fragments = [
    profile.experienceLevel ? `${formatLabel(profile.experienceLevel)} level` : "",
    profile.yearsExperience ? `${profile.yearsExperience} years of experience` : "",
    profile.jobTitlesSeeking ? `seeking ${profile.jobTitlesSeeking}` : "",
    profile.remotePreference ? `open to ${formatLabel(profile.remotePreference)} roles` : "",
  ].filter(Boolean);

  if (fragments.length === 0) {
    return profile.currentTitle || "";
  }

  return fragments.join(", ") + ".";
}

function ensureSpace(doc: PDFKit.PDFDocument, needed: number): void {
  if (doc.y + needed <= doc.page.height - PAGE_MARGIN) return;
  doc.addPage();
}

function formatLabel(value: string): string {
  return value.replaceAll("_", " ");
}
