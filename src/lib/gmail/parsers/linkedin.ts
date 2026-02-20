import type { GmailMessage } from "../types";
import type { ParseResult } from "../types";
import { getBodyText, extractSenderEmail, extractPositionFromBody } from "./utils";

const DOMAINS = ["linkedin.com", "e.linkedin.com"];

function parse(message: GmailMessage): ParseResult | null {
  const body = getBodyText(message);
  const subject = message.subject;

  // LinkedIn application confirmation subjects:
  // "Your application was sent to [Company]"
  // "You applied to [Position] at [Company]"
  let companyName: string | null = null;
  let positionTitle: string | null = null;

  // Pattern: "Your application was sent to [Company]"
  const sentMatch = subject.match(
    /your application was sent to\s+(.+)/i
  );
  if (sentMatch) {
    companyName = sentMatch[1].trim();
  }

  // Pattern: "You applied to [Position] at [Company]"
  const appliedMatch = subject.match(
    /you applied to\s+(.+?)\s+at\s+(.+)/i
  );
  if (appliedMatch) {
    positionTitle = appliedMatch[1].trim();
    companyName = appliedMatch[2].trim();
  }

  // Try to extract position from body if not in subject
  if (!positionTitle) {
    positionTitle = extractPositionFromBody(body);
  }

  if (!companyName) return null;

  let confidence = 0.6; // Base: known platform
  if (positionTitle) confidence += 0.2;
  if (subject.toLowerCase().includes("application")) confidence += 0.1;

  return {
    parsed: {
      companyName,
      positionTitle: positionTitle ?? "Unknown Position",
      platform: "linkedin",
      status: "applied",
      applicationDate: new Date(Number(message.internalDate)),
      url: null,
      contactEmail: extractSenderEmail(message.from),
    },
    confidence: Math.min(confidence, 1),
    parserName: "linkedin",
  };
}

export const linkedinParser = { name: "linkedin", domains: DOMAINS, parse };
