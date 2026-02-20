import type { EmailParser } from "../types";
import { linkedinParser } from "./linkedin";
import { indeedParser } from "./indeed";
import { greenhouseParser } from "./greenhouse";
import { leverParser } from "./lever";
import { workdayParser } from "./workday";
import { icimsParser } from "./icims";
import { genericParser } from "./generic";

const platformParsers: EmailParser[] = [
  linkedinParser,
  indeedParser,
  greenhouseParser,
  leverParser,
  workdayParser,
  icimsParser,
];

// Build domain → parser lookup
const domainMap = new Map<string, EmailParser>();
for (const parser of platformParsers) {
  for (const domain of parser.domains) {
    domainMap.set(domain, parser);
  }
}

export { domainMap, genericParser, platformParsers };
