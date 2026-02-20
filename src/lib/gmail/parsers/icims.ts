import type { GmailMessage } from "../types";
import type { ParseResult } from "../types";
import {
  getBodyText,
  extractSenderEmail,
  extractPositionFromBody,
  extractCompanyFromBody,
} from "./utils";

const DOMAINS = ["icims.com"];

function parse(message: GmailMessage): ParseResult | null {
  const body = getBodyText(message);
  const subject = message.subject;

  let companyName: string | null = null;
  let positionTitle: string | null = null;

  // iCIMS: "Thank you for your application - [Position]"
  const appMatch = subject.match(
    /thank you for your application\s*[-–—:]\s*(.+)/i
  );
  if (appMatch) {
    positionTitle = appMatch[1].trim();
  }

  // "Application received for [Position] at [Company]"
  const receivedMatch = subject.match(
    /application received (?:for\s+(.+?)\s+)?at\s+(.+)/i
  );
  if (receivedMatch) {
    if (receivedMatch[1]) positionTitle = receivedMatch[1].trim();
    companyName = receivedMatch[2].trim();
  }

  // From: "Company <noreply@icims.com>"
  const fromNameMatch = message.from.match(/^"?(.+?)"?\s*</);
  if (fromNameMatch && !companyName) {
    const fromName = fromNameMatch[1]
      .replace(/\s*(careers?|recruiting|talent|hr|jobs?)\s*/gi, "")
      .trim();
    if (fromName.length > 1 && !fromName.toLowerCase().includes("icims")) {
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
      platform: "other",
      status: "applied",
      applicationDate: new Date(Number(message.internalDate)),
      url: null,
      contactEmail: extractSenderEmail(message.from),
    },
    confidence: Math.min(confidence, 1),
    parserName: "icims",
  };
}

export const icimsParser = { name: "icims", domains: DOMAINS, parse };
