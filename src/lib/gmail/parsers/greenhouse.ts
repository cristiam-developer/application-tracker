import type { GmailMessage } from "../types";
import type { ParseResult } from "../types";
import {
  getBodyText,
  extractSenderEmail,
  extractPositionFromBody,
  extractCompanyFromBody,
} from "./utils";

const DOMAINS = ["greenhouse.io", "greenhouse-mail.io"];

function parse(message: GmailMessage): ParseResult | null {
  const body = getBodyText(message);
  const subject = message.subject;

  let companyName: string | null = null;
  let positionTitle: string | null = null;

  // Greenhouse emails typically come as:
  // "Application for [Position] at [Company]"
  // "Thank you for applying to [Company]"
  // From: "Name at Company <noreply@greenhouse.io>"
  const subjectMatch = subject.match(
    /application for\s+(.+?)\s+at\s+(.+)/i
  );
  if (subjectMatch) {
    positionTitle = subjectMatch[1].trim();
    companyName = subjectMatch[2].trim();
  }

  // Try "Thank you for applying" pattern
  const thankYouMatch = subject.match(
    /thank you for (?:applying|your (?:interest|application))\s*(?:to|at|with)?\s*(.+)/i
  );
  if (thankYouMatch && !companyName) {
    companyName = thankYouMatch[1].trim();
  }

  // Extract from "From" header: "Recruiting at Company"
  const fromMatch = message.from.match(/(.+?)\s+at\s+(.+?)\s*</i);
  if (fromMatch && !companyName) {
    companyName = fromMatch[2].trim();
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
      platform: "greenhouse",
      status: "applied",
      applicationDate: new Date(Number(message.internalDate)),
      url: null,
      contactEmail: extractSenderEmail(message.from),
    },
    confidence: Math.min(confidence, 1),
    parserName: "greenhouse",
  };
}

export const greenhouseParser = { name: "greenhouse", domains: DOMAINS, parse };
