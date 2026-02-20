import type { GmailMessage } from "../types";
import type { ParseResult } from "../types";
import { getBodyText, extractSenderEmail, extractPositionFromBody } from "./utils";

const DOMAINS = ["indeed.com", "indeedmail.com", "indeed.email"];

function parse(message: GmailMessage): ParseResult | null {
  const body = getBodyText(message);
  const subject = message.subject;

  let companyName: string | null = null;
  let positionTitle: string | null = null;

  // Pattern: "Your application to [Company] for [Position]"
  const appMatch = subject.match(
    /your application to\s+(.+?)\s+for\s+(.+)/i
  );
  if (appMatch) {
    companyName = appMatch[1].trim();
    positionTitle = appMatch[2].trim();
  }

  // Pattern: "Application for [Position] at [Company]"
  const appMatch2 = subject.match(
    /application for\s+(.+?)\s+at\s+(.+)/i
  );
  if (appMatch2) {
    positionTitle = appMatch2[1].trim();
    companyName = appMatch2[2].trim();
  }

  // Pattern: "[Company] received your application"
  const receivedMatch = subject.match(
    /(.+?)\s+received your application/i
  );
  if (receivedMatch && !companyName) {
    companyName = receivedMatch[1].trim();
  }

  // Try body extraction
  if (!positionTitle) {
    positionTitle = extractPositionFromBody(body);
  }

  if (!companyName) {
    // Try from body: "Thank you for applying to [Position] at [Company]"
    const bodyMatch = body.match(
      /thank you for applying (?:to|for)\s+(.+?)\s+at\s+(.+?)(?:\.|!|\s{2})/i
    );
    if (bodyMatch) {
      positionTitle = positionTitle ?? bodyMatch[1].trim();
      companyName = bodyMatch[2].trim();
    }
  }

  if (!companyName) return null;

  let confidence = 0.6;
  if (positionTitle) confidence += 0.2;
  if (subject.toLowerCase().includes("application")) confidence += 0.1;

  return {
    parsed: {
      companyName,
      positionTitle: positionTitle ?? "Unknown Position",
      platform: "indeed",
      status: "applied",
      applicationDate: new Date(Number(message.internalDate)),
      url: null,
      contactEmail: extractSenderEmail(message.from),
    },
    confidence: Math.min(confidence, 1),
    parserName: "indeed",
  };
}

export const indeedParser = { name: "indeed", domains: DOMAINS, parse };
