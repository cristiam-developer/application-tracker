import type { GmailMessage } from "../types";
import type { ParseResult } from "../types";
import {
  getBodyText,
  extractSenderEmail,
  extractPositionFromBody,
  extractCompanyFromBody,
} from "./utils";

const DOMAINS = ["myworkday.com", "wd5.myworkdaysite.com"];

function parse(message: GmailMessage): ParseResult | null {
  const body = getBodyText(message);
  const subject = message.subject;

  let companyName: string | null = null;
  let positionTitle: string | null = null;

  // Workday: "Application Confirmation - [Company]"
  const confirmMatch = subject.match(
    /application (?:confirmation|received|submitted)\s*[-–—:]\s*(.+)/i
  );
  if (confirmMatch) {
    companyName = confirmMatch[1].trim();
  }

  // "Thank you for applying to [Company]"
  const thankYouMatch = subject.match(
    /thank you for (?:applying|your application)\s*(?:to|at|with)?\s*(.+)/i
  );
  if (thankYouMatch && !companyName) {
    companyName = thankYouMatch[1].trim();
  }

  // From: "Company Careers <noreply@myworkday.com>"
  const fromNameMatch = message.from.match(/^"?(.+?)"?\s*</);
  if (fromNameMatch && !companyName) {
    const fromName = fromNameMatch[1]
      .replace(/\s*(careers?|recruiting|talent|hr|jobs?)\s*/gi, "")
      .trim();
    if (fromName.length > 1) {
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
      platform: "workday",
      status: "applied",
      applicationDate: new Date(Number(message.internalDate)),
      url: null,
      contactEmail: extractSenderEmail(message.from),
    },
    confidence: Math.min(confidence, 1),
    parserName: "workday",
  };
}

export const workdayParser = { name: "workday", domains: DOMAINS, parse };
