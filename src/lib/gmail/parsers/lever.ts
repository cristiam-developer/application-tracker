import type { GmailMessage } from "../types";
import type { ParseResult } from "../types";
import {
  getBodyText,
  extractSenderEmail,
  extractPositionFromBody,
  extractCompanyFromBody,
} from "./utils";

const DOMAINS = ["hire.lever.co", "lever.co"];

function parse(message: GmailMessage): ParseResult | null {
  const body = getBodyText(message);
  const subject = message.subject;

  let companyName: string | null = null;
  let positionTitle: string | null = null;

  // Lever emails: "Your application to [Company]"
  const appMatch = subject.match(
    /your application (?:to|at|with)\s+(.+)/i
  );
  if (appMatch) {
    companyName = appMatch[1].trim();
  }

  // "Application for [Position] - [Company]"
  const dashMatch = subject.match(
    /application for\s+(.+?)\s*[-–—]\s*(.+)/i
  );
  if (dashMatch) {
    positionTitle = dashMatch[1].trim();
    companyName = dashMatch[2].trim();
  }

  // From header: "Company <noreply@hire.lever.co>"
  const fromNameMatch = message.from.match(/^"?(.+?)"?\s*</);
  if (fromNameMatch && !companyName) {
    const fromName = fromNameMatch[1].trim();
    if (!fromName.toLowerCase().includes("lever")) {
      companyName = fromName;
    }
  }

  if (!positionTitle) {
    positionTitle = extractPositionFromBody(body);
  }

  if (!companyName) {
    companyName = extractCompanyFromBody(body);
  }

  if (!companyName) return null;

  let confidence = 0.6;
  if (positionTitle) confidence += 0.2;
  if (subject.toLowerCase().includes("application")) confidence += 0.1;

  return {
    parsed: {
      companyName,
      positionTitle: positionTitle ?? "Unknown Position",
      platform: "lever",
      status: "applied",
      applicationDate: new Date(Number(message.internalDate)),
      url: null,
      contactEmail: extractSenderEmail(message.from),
    },
    confidence: Math.min(confidence, 1),
    parserName: "lever",
  };
}

export const leverParser = { name: "lever", domains: DOMAINS, parse };
