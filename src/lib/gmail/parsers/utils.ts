import * as cheerio from "cheerio";
import type { GmailMessage } from "../types";

export function extractSenderEmail(from: string): string {
  const match = from.match(/<([^>]+)>/);
  return match ? match[1].toLowerCase() : from.toLowerCase();
}

export function extractSenderDomain(from: string): string {
  const email = extractSenderEmail(from);
  const parts = email.split("@");
  return parts.length > 1 ? parts[1] : "";
}

export function htmlToText(html: string): string {
  if (!html) return "";
  const $ = cheerio.load(html);
  // Remove style, script, and head tags
  $("style, script, head").remove();
  // Get text content
  return $.text().replace(/\s+/g, " ").trim();
}

export function getBodyText(message: GmailMessage): string {
  if (message.body) return message.body;
  if (message.htmlBody) return htmlToText(message.htmlBody);
  return "";
}

export function domainToCompanyName(domain: string): string {
  // Remove common TLDs and subdomains
  const name = domain
    .replace(/^(www|mail|e|email|noreply|no-reply|notifications?)\./i, "")
    .split(".")[0];
  // Capitalize first letter of each word
  return name
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function calculateConfidence(fields: {
  hasCompany: boolean;
  hasPosition: boolean;
  hasPlatformMatch: boolean;
  hasApplicationKeyword: boolean;
}): number {
  let confidence = 0;
  if (fields.hasCompany) confidence += 0.25;
  if (fields.hasPosition) confidence += 0.3;
  if (fields.hasPlatformMatch) confidence += 0.25;
  if (fields.hasApplicationKeyword) confidence += 0.2;
  return Math.min(confidence, 1);
}

// Common patterns for extracting position titles from email bodies
const POSITION_PATTERNS = [
  /(?:position|role|job)\s*(?:of|:|-|for)?\s*["']?([A-Z][A-Za-z\s/&,.-]{2,60})["']?/i,
  /(?:applied\s+(?:for|to)\s+(?:the\s+)?(?:position\s+(?:of\s+)?)?)?["']([A-Z][A-Za-z\s/&,.-]{2,60})["']/i,
  /(?:application\s+for\s+(?:the\s+)?(?:position\s+(?:of\s+)?)?)([A-Z][A-Za-z\s/&,.-]{2,60})/i,
  /(?:thank you for applying\s+(?:for\s+(?:the\s+)?)?(?:position\s+(?:of\s+)?)?)([A-Z][A-Za-z\s/&,.-]{2,60})/i,
];

export function extractPositionFromBody(text: string): string | null {
  for (const pattern of POSITION_PATTERNS) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const position = match[1].trim();
      // Filter out common false positives
      if (position.length > 3 && position.length < 80) {
        return position;
      }
    }
  }
  return null;
}

// Extract company name from email body
const COMPANY_PATTERNS = [
  /(?:at|with|from|join(?:ing)?)\s+(?:the\s+)?([A-Z][A-Za-z\s&.',-]{1,50}?)(?:\s*[.,!]|\s+(?:team|group|inc|corp|llc|ltd))/i,
  /(?:thank you for (?:your )?(?:interest|applying) (?:in|at|to|with)\s+)([A-Z][A-Za-z\s&.',-]{1,50})/i,
  /(?:on behalf of\s+)([A-Z][A-Za-z\s&.',-]{1,50})/i,
];

export function extractCompanyFromBody(text: string): string | null {
  for (const pattern of COMPANY_PATTERNS) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const company = match[1].trim();
      if (company.length > 1 && company.length < 60) {
        return company;
      }
    }
  }
  return null;
}

export function subjectContainsApplicationKeyword(subject: string): boolean {
  const keywords = [
    "application",
    "applied",
    "thank you for applying",
    "application received",
    "we received your application",
    "application confirmation",
    "your submission",
  ];
  const lowerSubject = subject.toLowerCase();
  return keywords.some((kw) => lowerSubject.includes(kw));
}
