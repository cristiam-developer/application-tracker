import type { GmailMessage } from "../types";
import type { ParseResult } from "../types";
import {
  getBodyText,
  extractSenderEmail,
  extractSenderDomain,
  domainToCompanyName,
  extractPositionFromBody,
  extractCompanyFromBody,
  subjectContainsApplicationKeyword,
} from "./utils";

function parse(message: GmailMessage): ParseResult | null {
  const body = getBodyText(message);
  const subject = message.subject;
  const domain = extractSenderDomain(message.from);

  // Must have application-related keywords
  if (!subjectContainsApplicationKeyword(subject)) {
    // Also check body for keywords
    const bodyLower = body.toLowerCase().slice(0, 500);
    const hasBodyKeyword = [
      "application",
      "applied",
      "thank you for applying",
      "received your application",
    ].some((kw) => bodyLower.includes(kw));

    if (!hasBodyKeyword) return null;
  }

  let companyName: string | null = null;
  let positionTitle: string | null = null;

  // Try subject patterns
  // "[Company] - Application received"
  const dashMatch = subject.match(
    /^(.+?)\s*[-–—:]\s*(?:application|thank you)/i
  );
  if (dashMatch) {
    companyName = dashMatch[1].trim();
  }

  // "Application for [Position] at [Company]"
  const atMatch = subject.match(
    /application (?:for\s+(.+?)\s+)?at\s+(.+)/i
  );
  if (atMatch) {
    if (atMatch[1]) positionTitle = atMatch[1].trim();
    companyName = atMatch[2].trim();
  }

  // "Thank you for applying to [Position] at [Company]"
  const thankMatch = subject.match(
    /thank you for applying\s+(?:(?:for|to)\s+(.+?)\s+)?(?:at|to|with)\s+(.+)/i
  );
  if (thankMatch) {
    if (thankMatch[1]) positionTitle = thankMatch[1].trim();
    companyName = thankMatch[2].trim();
  }

  // Try body extraction
  if (!positionTitle) {
    positionTitle = extractPositionFromBody(body);
  }

  if (!companyName) {
    companyName = extractCompanyFromBody(body);
  }

  // Fallback: derive company from sender domain
  if (!companyName && domain) {
    companyName = domainToCompanyName(domain);
  }

  if (!companyName) return null;

  // Lower confidence since this is generic
  let confidence = 0.3;
  if (positionTitle) confidence += 0.15;
  if (subjectContainsApplicationKeyword(subject)) confidence += 0.1;
  if (companyName !== domainToCompanyName(domain)) confidence += 0.1; // explicitly extracted

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
    parserName: "generic",
  };
}

export const genericParser = { name: "generic", domains: [], parse };
