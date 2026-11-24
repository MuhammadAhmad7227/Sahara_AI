/**
 * Sahara AI — shared domain types.
 *
 * These interfaces mirror the planned FastAPI/Pydantic schemas described in the
 * FYP proposal (services, requirements, procedure steps, sources, drafts,
 * analyses, welfare rules, offices, lawyers, audit logs). The frontend consumes
 * them only through the service layer (`src/services/api/*`), so replacing the
 * mock transport with real HTTP does not require UI changes.
 */

export type Language = 'en' | 'ur' | 'pa';

export type Role = 'guest' | 'citizen' | 'admin';

/** Lifecycle of a knowledge-base record, as defined by the review workflow. */
export type ReviewStatus = 'draft' | 'pending_review' | 'approved' | 'published' | 'archived' | 'rejected';

/** How confident we are that a record reflects the official source. */
export type VerificationStatus = 'verified' | 'pending_verification' | 'outdated' | 'demo';

export type Jurisdiction = 'Punjab' | 'Federal' | 'Sindh' | 'Khyber Pakhtunkhwa' | 'Balochistan';

export type ServiceCategory =
  | 'identity'
  | 'certificates'
  | 'utilities'
  | 'police'
  | 'health'
  | 'education'
  | 'land'
  | 'welfare'
  | 'municipal'
  | 'legal';

export interface SourceRecord {
  id: string;
  title: string;
  /** Publisher of the official page or document, e.g. "District Administration". */
  publisher: string;
  /**
   * Official URL. `null` means no URL has been confirmed yet — the UI must never
   * fabricate one; it shows "URL not recorded" instead.
   */
  url: string | null;
  /** ISO date the source was last checked by a reviewer. */
  checkedAt: string | null;
  reviewer: string | null;
  status: ReviewStatus;
  notes?: string;
}

export interface Requirement {
  id: string;
  title: string;
  details: string;
  mandatory: boolean;
  /** Ordering inside the checklist. */
  position: number;
}

export interface ProcedureStep {
  id: string;
  stepNumber: number;
  title: string;
  instruction: string;
  location?: string;
  estimatedDuration?: string;
}

export interface ServiceFee {
  /**
   * Verified fee. `null` means the fee has not been confirmed — the UI shows the
   * "not currently verified" message rather than guessing.
   */
  amount: number | null;
  currency: 'PKR';
  note?: string;
}

export interface Service {
  id: string;
  slug: string;
  name: string;
  /** Localised names are optional; the UI falls back to `name`. */
  nameUr?: string;
  department: string;
  jurisdiction: Jurisdiction;
  district?: string;
  category: ServiceCategory;
  shortDescription: string;
  description: string;
  requirements: Requirement[];
  procedure: ProcedureStep[];
  fee: ServiceFee;
  processingTime?: string | null;
  sources: SourceRecord[];
  status: ReviewStatus;
  verification: VerificationStatus;
  lastVerifiedAt: string | null;
  reviewDueAt?: string | null;
  popular?: boolean;
  tags: string[];
  updatedAt: string;
}

export interface ServiceListQuery {
  search?: string;
  category?: ServiceCategory | 'all';
  department?: string | 'all';
  jurisdiction?: Jurisdiction | 'all';
  page?: number;
  pageSize?: number;
  sort?: 'relevance' | 'name' | 'recently_verified';
  popularOnly?: boolean;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/* ------------------------------------------------------------------------- */
/* Assistant                                                                  */
/* ------------------------------------------------------------------------- */

export type AssistantIntent =
  | 'service_information'
  | 'complaint'
  | 'welfare'
  | 'scam'
  | 'general_civic'
  | 'out_of_scope';

export interface AssistantSourceRef {
  serviceId: string;
  serviceName: string;
  department: string;
  sourceTitle: string;
  publisher: string;
  url: string | null;
  lastVerifiedAt: string | null;
}

export interface AssistantAnswer {
  id: string;
  /** The explanation text. Rendered as AI explanation, never as verified fact. */
  answer: string;
  language: Language;
  intent: AssistantIntent;
  /** Sources actually used to ground this answer. Empty when nothing reliable was found. */
  sources: AssistantSourceRef[];
  /** True when retrieval found no reliable record and the assistant said so. */
  noReliableRecord: boolean;
  /** Number of reviewed records the retriever considered. */
  retrievedRecordCount: number;
  /** Always true for the current implementation — surfaced in the UI. */
  generatedBy: 'mock-demo' | 'api';
  disclaimer?: string;
  createdAt: string;
}

export interface AssistantAskRequest {
  question: string;
  language: Language;
  conversationId?: string;
}

export interface AssistantFeedback {
  messageId: string;
  helpful: boolean;
  comment?: string;
}

/* ------------------------------------------------------------------------- */
/* Applications & complaints                                                  */
/* ------------------------------------------------------------------------- */

export type ApplicationCategory = 'application' | 'complaint';

export type ApplicationTypeId =
  | 'police-application'
  | 'electricity-complaint'
  | 'water-complaint'
  | 'district-request'
  | 'education-request'
  | 'general-request';

export interface ApplicationFieldDef {
  key: string;
  label: string;
  placeholder?: string;
  type: 'text' | 'textarea' | 'date' | 'tel' | 'email' | 'select';
  required: boolean;
  help?: string;
  options?: string[];
  maxLength?: number;
}

export interface ApplicationTemplate {
  id: ApplicationTypeId;
  name: string;
  category: ApplicationCategory;
  department: string;
  description: string;
  /** Which service record (if any) grounds this template. */
  serviceId?: string;
  fields: ApplicationFieldDef[];
  /** Ordered body sections used by the draft generator. */
  bodySections: { key: string; heading: string; fromFields: string[] }[];
  salutation: string;
  closing: string;
}

export type DraftStatus = 'draft' | 'finalized' | 'saved';

export interface ApplicationDraft {
  id: string;
  templateId: ApplicationTypeId;
  templateName: string;
  category: ApplicationCategory;
  department: string;
  /** Raw user inputs keyed by field name. */
  inputs: Record<string, string>;
  /** Rendered draft body, editable by the citizen before export. */
  body: string;
  status: DraftStatus;
  createdAt: string;
  updatedAt: string;
  ownerId: string | null;
  /** Demo flag: drafts are stored locally until the backend is connected. */
  storage: 'local-demo';
}

export interface GenerateApplicationRequest {
  templateId: ApplicationTypeId;
  inputs: Record<string, string>;
}

/* ------------------------------------------------------------------------- */
/* Readiness                                                                  */
/* ------------------------------------------------------------------------- */

export type ReadinessItemState = 'complete' | 'missing' | 'needs_review';

export interface ReadinessItem {
  requirementId: string;
  title: string;
  details: string;
  mandatory: boolean;
  state: ReadinessItemState;
}

export interface ReadinessReport {
  serviceId: string;
  serviceName: string;
  items: ReadinessItem[];
  generatedAt: string;
  summary: {
    total: number;
    complete: number;
    missing: number;
    needsReview: number;
    mandatoryMissing: number;
  };
  /** Fixed, non-overclaiming summary sentence generated by the checker. */
  statement: string;
}

/* ------------------------------------------------------------------------- */
/* Scam analysis                                                              */
/* ------------------------------------------------------------------------- */

export type ScamRiskLevel = 'low_concern' | 'needs_caution' | 'high_concern';

export interface ScamIndicator {
  id: string;
  label: string;
  explanation: string;
  severity: 'low' | 'medium' | 'high';
  /** Exact excerpt that triggered the indicator, when available. */
  evidence?: string;
}

export interface ScamAnalysis {
  id: string;
  inputText: string;
  riskLevel: ScamRiskLevel;
  indicators: ScamIndicator[];
  explanation: string;
  safetyAdvice: string[];
  engine: 'rule-based-local' | 'api';
  createdAt: string;
  disclaimer: string;
}

/* ------------------------------------------------------------------------- */
/* Documents                                                                  */
/* ------------------------------------------------------------------------- */

export interface DocumentReviewFlag {
  id: string;
  label: string;
  detail: string;
  level: 'info' | 'review';
}

export interface DocumentAnalysis {
  id: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  extractedText: string | null;
  summary: string | null;
  flags: DocumentReviewFlag[];
  processedBy: 'local-heuristic' | 'api';
  createdAt: string;
  disclaimer: string;
}

/* ------------------------------------------------------------------------- */
/* Welfare                                                                    */
/* ------------------------------------------------------------------------- */

export type IncomeBand = 'under_25k' | '25k_50k' | '50k_100k' | 'over_100k' | 'prefer_not_to_say';

export interface WelfareScheme {
  id: string;
  name: string;
  provider: string;
  description: string;
  eligibilitySummary: string;
  districts: string[] | 'all';
  householdSizeMin?: number;
  householdSizeMax?: number;
  incomeBands: IncomeBand[];
  requiredDocuments: string[];
  officialSource: {
    publisher: string;
    url: string | null;
    lastVerifiedAt: string | null;
  };
  verification: VerificationStatus;
  status: ReviewStatus;
}

export interface WelfareMatch {
  scheme: WelfareScheme;
  matchedCriteria: string[];
  unmatchedCriteria: string[];
  /** Deliberately conservative phrasing; never "you are eligible". */
  matchStatement: string;
}

export interface WelfareCheckRequest {
  district: string;
  householdSize: number;
  incomeBand: IncomeBand;
}

/* ------------------------------------------------------------------------- */
/* Emergency & offices                                                        */
/* ------------------------------------------------------------------------- */

export interface EmergencyContact {
  id: string;
  name: string;
  category: 'police' | 'rescue' | 'ambulance' | 'fire' | 'cybercrime' | 'other';
  number: string | null;
  description: string;
  available: string;
  district?: string;
  source: {
    publisher: string;
    url: string | null;
    lastVerifiedAt: string | null;
  };
  /** Demo entries are rendered with an explicit "Pending verification" badge. */
  verification: VerificationStatus;
}

export interface PublicOffice {
  id: string;
  name: string;
  category: 'nadra' | 'police' | 'hospital' | 'court' | 'facilitation' | 'municipal';
  district: string;
  city: string;
  address: string | null;
  phone: string | null;
  openingInfo: string | null;
  coordinates?: { lat: number; lng: number };
  source: {
    publisher: string;
    url: string | null;
    lastVerifiedAt: string | null;
  };
  verification: VerificationStatus;
}

/* ------------------------------------------------------------------------- */
/* Legal awareness & lawyers                                                  */
/* ------------------------------------------------------------------------- */

export interface LegalArticle {
  id: string;
  slug: string;
  title: string;
  category: 'rights' | 'family' | 'property' | 'employment' | 'criminal' | 'consumer' | 'civic';
  summary: string;
  body: string[];
  relatedServiceIds: string[];
  source: {
    publisher: string;
    url: string | null;
    lastVerifiedAt: string | null;
  };
  verification: VerificationStatus;
}

export interface Lawyer {
  id: string;
  name: string;
  city: string;
  specializations: string[];
  experienceYears: number | null;
  contactNote: string | null;
  verificationStatus: 'listed' | 'unverified' | 'verified';
  profileSummary: string;
}

/* ------------------------------------------------------------------------- */
/* Auth & users                                                               */
/* ------------------------------------------------------------------------- */

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  preferredLanguage: Language;
  district: string | null;
  createdAt: string;
  /** Demo sessions are mock-flagged so the UI never implies real authentication. */
  sessionType: 'mock-demo' | 'api';
}

export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  preferredLanguage: Language;
}

export interface AuthResult {
  user: UserProfile;
  token: string;
  expiresAt: string;
}

/* ------------------------------------------------------------------------- */
/* Feedback & admin                                                           */
/* ------------------------------------------------------------------------- */

export interface FeedbackSubmission {
  id: string;
  subject: string;
  category: 'service_correction' | 'bug' | 'suggestion' | 'accessibility' | 'other';
  message: string;
  email?: string;
  relatedServiceId?: string;
  createdAt: string;
  status: 'received' | 'reviewing' | 'resolved';
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  actorRole: Role;
  action: string;
  entityType: 'service' | 'requirement' | 'procedure' | 'source' | 'welfare' | 'emergency' | 'office' | 'lawyer' | 'user' | 'settings';
  entityId: string;
  entityLabel: string;
  timestamp: string;
  previousValue?: string;
  newValue?: string;
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'active' | 'suspended' | 'invited';
  preferredLanguage: Language;
  joinedAt: string;
  lastActiveAt: string;
}

export interface DashboardStats {
  publishedServices: number;
  pendingReviews: number;
  sourcesAwaitingReview: number;
  openFeedback: number;
  activeUsers: number;
  staleRecords: number;
}

/* ------------------------------------------------------------------------- */
/* API envelope                                                               */
/* ------------------------------------------------------------------------- */

/**
 * Error shape returned by the planned FastAPI layer. The frontend maps it to a
 * friendly message using `src/services/api/errors.ts`.
 */
export interface ApiErrorBody {
  detail: string;
  code?: string;
  fieldErrors?: Record<string, string>;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;
  readonly fieldErrors: Record<string, string> | undefined;

  constructor(status: number, message: string, code?: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

/** Uniform result envelope used by the mock transport and the future HTTP client. */
export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };
