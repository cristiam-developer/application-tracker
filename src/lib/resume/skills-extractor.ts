import {
  getAllSkills,
  SHORT_TERMS,
  ABBREVIATION_MAP,
  JOB_TITLE_PATTERNS,
} from "./taxonomy";

export interface ExtractionResult {
  skills: string[];
  jobTitles: string[];
}

/**
 * Extract skills and job titles from resume text using word-boundary matching.
 * Short terms (R, C, Go, etc.) use stricter context checks to avoid false positives.
 */
export function extractSkillsFromText(text: string): ExtractionResult {
  const normalizedText = text.replace(/\s+/g, " ");
  const allSkills = getAllSkills();
  const foundSkills = new Set<string>();

  for (const skill of allSkills) {
    if (SHORT_TERMS.has(skill)) {
      // Stricter matching for short terms: require word boundaries and
      // common programming contexts
      const strictPattern = new RegExp(
        `(?:^|[\\s,;|/()\\[\\]])${escapeRegex(skill)}(?=[\\s,;|/()\\[\\]]|$)`,
        "g"
      );
      if (strictPattern.test(normalizedText)) {
        // Additional context check for very short terms (1-2 chars)
        if (skill.length <= 2) {
          const contextPattern = new RegExp(
            `(?:language|programming|experience|proficient|skilled|knowledge|worked with|using|develop|built with|tech stack)[^.]{0,50}\\b${escapeRegex(skill)}\\b|\\b${escapeRegex(skill)}\\b[^.]{0,50}(?:programming|development|language|experience|project)`,
            "i"
          );
          if (contextPattern.test(normalizedText)) {
            foundSkills.add(skill);
          }
        } else {
          foundSkills.add(skill);
        }
      }
    } else {
      // Standard word-boundary matching for longer terms
      const pattern = new RegExp(`\\b${escapeRegex(skill)}\\b`, "i");
      if (pattern.test(normalizedText)) {
        foundSkills.add(skill);
      }
    }
  }

  // Expand abbreviations found in text
  for (const [abbrev, fullForm] of Object.entries(ABBREVIATION_MAP)) {
    const pattern = new RegExp(
      `(?:^|[\\s,;|/()\\[\\]])${escapeRegex(abbrev)}(?=[\\s,;|/()\\[\\]]|$)`,
      "g"
    );
    if (pattern.test(normalizedText)) {
      // Add the full form if we haven't already found it
      if (!foundSkills.has(fullForm)) {
        // Only add expansions for terms that aren't too generic
        const isGeneric = ["Database", "Application Programming Interface"].includes(fullForm);
        if (!isGeneric) {
          foundSkills.add(fullForm);
        }
      }
    }
  }

  // Extract job titles
  const foundTitles = new Set<string>();
  for (const pattern of JOB_TITLE_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;
    while ((match = regex.exec(normalizedText)) !== null) {
      foundTitles.add(match[0].trim());
    }
  }

  return {
    skills: Array.from(foundSkills).sort(),
    jobTitles: Array.from(foundTitles),
  };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
