export type GmailMessage = {
  id: string;
  threadId: string;
  historyId: string;
  internalDate: string;
  subject: string;
  from: string;
  to: string;
  body: string;
  htmlBody: string;
};

export type ParsedApplication = {
  companyName: string;
  positionTitle: string;
  platform: string;
  status: string;
  applicationDate: Date;
  url: string | null;
  contactEmail: string | null;
};

export type ParseResult = {
  parsed: ParsedApplication;
  confidence: number;
  parserName: string;
};

export type EmailParser = {
  name: string;
  domains: string[];
  parse: (message: GmailMessage) => ParseResult | null;
};

export type SyncResult = {
  totalProcessed: number;
  autoImported: number;
  pendingReview: number;
  skippedDuplicates: number;
  errors: number;
};

export type PendingReview = {
  key: string;
  messageId: string;
  subject: string;
  from: string;
  receivedAt: string;
  parsed: ParsedApplication;
  confidence: number;
  parserName: string;
};
