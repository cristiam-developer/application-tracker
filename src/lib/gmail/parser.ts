import type { GmailMessage, ParseResult } from "./types";
import { domainMap, genericParser } from "./parsers";
import { extractSenderDomain } from "./parsers/utils";

export function parseEmail(message: GmailMessage): ParseResult | null {
  const domain = extractSenderDomain(message.from);

  // Check for exact domain match
  const platformParser = domainMap.get(domain);
  if (platformParser) {
    const result = platformParser.parse(message);
    if (result) return result;
  }

  // Check for partial domain match (e.g., "e.linkedin.com" matches "linkedin.com")
  for (const [parserDomain, parser] of domainMap) {
    if (domain.endsWith(`.${parserDomain}`) || parserDomain.endsWith(`.${domain}`)) {
      const result = parser.parse(message);
      if (result) return result;
    }
  }

  // Fallback to generic parser
  return genericParser.parse(message);
}
