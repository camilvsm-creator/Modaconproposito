import type {
  AID_TYPES,
  CONTACT_REQUEST_TYPES,
  DAMAGE_LEVELS,
  DAMAGE_TYPES,
  INSPECTION_PROPERTY_TYPES,
  INSPECTOR_INSPECTION_SOURCE_TYPES,
  INSPECTOR_APPLICATION_DOCUMENT_TYPES,
  INSPECTOR_APPLICATION_STATUSES,
  INSPECTOR_EXPERIENCE_RANGES,
  INSPECTOR_PROFESSIONS,
  INSPECTION_STATUSES,
  HABITABILITY_STATUSES,
  NEEDS,
  PROPERTY_TYPES,
  PROPERTY_USES,
  REPORT_TYPES,
  REPORT_STATUSES,
  REPORTER_RELATIONSHIPS,
  URGENCY_LEVELS,
  VERIFICATION_LEVELS,
} from "@/lib/constants";

import type {
  AFFECTED_AREAS,
  AFFECTED_ELEMENTS,
  APPROXIMATE_FLOORS,
  DAMAGE_EVOLUTIONS,
  EVIDENCE_QUALITIES,
  ESTIMATED_CRACK_WIDTHS,
  MISSING_EVIDENCE_ITEMS,
  ONSITE_URGENCIES,
  PROPERTY_TYPES_OBSERVED,
  RECOMMENDATION_TYPES,
  REMOTE_EVALUATION_STATUSES,
  TERRAIN_CONDITIONS,
  VISIBLE_DAMAGES,
  VISIBLE_RISK_LEVELS,
  VISIBLE_RISK_SIGNALS,
} from "@/lib/remote-evaluation-options";

export type RemoteEvaluationStatus = (typeof REMOTE_EVALUATION_STATUSES)[number];
export type EvidenceQuality = (typeof EVIDENCE_QUALITIES)[number];
export type MissingEvidenceItem = (typeof MISSING_EVIDENCE_ITEMS)[number];
export type PropertyTypeObserved = (typeof PROPERTY_TYPES_OBSERVED)[number];
export type ApproximateFloors = (typeof APPROXIMATE_FLOORS)[number];
export type AffectedArea = (typeof AFFECTED_AREAS)[number];
export type AffectedElement = (typeof AFFECTED_ELEMENTS)[number];
export type VisibleDamage = (typeof VISIBLE_DAMAGES)[number];
export type EstimatedCrackWidth = (typeof ESTIMATED_CRACK_WIDTHS)[number];
export type VisibleRiskSignal = (typeof VISIBLE_RISK_SIGNALS)[number];
export type TerrainCondition = (typeof TERRAIN_CONDITIONS)[number];
export type DamageEvolution = (typeof DAMAGE_EVOLUTIONS)[number];
export type VisibleRiskLevel = (typeof VISIBLE_RISK_LEVELS)[number];
export type RecommendationType = (typeof RECOMMENDATION_TYPES)[number];
export type OnsiteInspectionUrgency = (typeof ONSITE_URGENCIES)[number];

export type ReporterRelationship = (typeof REPORTER_RELATIONSHIPS)[number];
export type PropertyType = (typeof PROPERTY_TYPES)[number];
export type PropertyUse = (typeof PROPERTY_USES)[number];
export type DamageLevel = (typeof DAMAGE_LEVELS)[number];
export type DamageType = (typeof DAMAGE_TYPES)[number];
export type NeedType = (typeof NEEDS)[number];
export type ReportType = (typeof REPORT_TYPES)[number];
export type UrgencyLevel = (typeof URGENCY_LEVELS)[number];
export type AidType = (typeof AID_TYPES)[number];
export type ReportStatus = (typeof REPORT_STATUSES)[number];
export type VerificationLevel = (typeof VERIFICATION_LEVELS)[number];
export type PublicationNameMode = "anonymous" | "partial" | "full";
export type ContactRequestType = (typeof CONTACT_REQUEST_TYPES)[number];
export type InspectionPropertyType = (typeof INSPECTION_PROPERTY_TYPES)[number];
export type InspectorInspectionSourceType = (typeof INSPECTOR_INSPECTION_SOURCE_TYPES)[number];
export type InspectionStatus = (typeof INSPECTION_STATUSES)[number];
export type HabitabilityStatus = (typeof HABITABILITY_STATUSES)[number];
export type InspectorProfession = (typeof INSPECTOR_PROFESSIONS)[number];
export type InspectorExperienceRange = (typeof INSPECTOR_EXPERIENCE_RANGES)[number];
export type InspectorApplicationStatus = (typeof INSPECTOR_APPLICATION_STATUSES)[number];
export type InspectorApplicationDocumentType = (typeof INSPECTOR_APPLICATION_DOCUMENT_TYPES)[number];

export type DashboardStats = {
  reportsReceived: number;
  publicCases: number;
  reportsPending: number;
  reportsPublished: number;
  reportsVerified: number;
  affectedCities: number;
  activeNeeds: number;
};

export type InspectionVolunteer = {
  id: string;
  nombre: string;
  casa_estudio: string;
  anio_egreso: string;
  ubicacion: string;
  numero_contacto: string;
  created_at: string;
};

export type InspectionRequest = {
  id: string;
  request_code: string;
  status: InspectionStatus;
  full_name: string;
  phone: string | null;
  email: string | null;
  property_type: InspectionPropertyType;
  state: string | null;
  city: string | null;
  municipality: string | null;
  parish: string | null;
  sector: string | null;
  address_reference: string;
  building_name: string | null;
  floor_or_unit: string | null;
  damage_summary: string;
  occupancy_status: string | null;
  has_immediate_risk: boolean;
  consent_private_data: boolean;
  organization: string | null;
  lat: number | null;
  lng: number | null;
  created_by_user_id: string | null;
  source_report_id: string | null;
  source_case_id: string | null;
  origin: "public_form" | "community_report" | "inspector_intake";
  source_type: InspectorInspectionSourceType | null;
  source_reference: string | null;
  source_notes: string | null;
  assigned_inspector_user_id: string | null;
  external_reference_url: string | null;
  external_reference_notes: string | null;
  result_summary: string | null;
  result_sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export type InspectionRequestPhoto = {
  id: string;
  request_id: string;
  storage_path: string;
  original_path?: string | null;
  thumb_path?: string | null;
  medium_path?: string | null;
  large_path?: string | null;
  processing_status?: PhotoProcessingStatus;
  processing_error?: string | null;
  processed_at?: string | null;
  media_type: "image" | "video";
  is_sensitive: boolean;
  created_at: string;
  signed_url?: string | null;
  processing?: boolean;
};

export type InspectionNote = {
  id: string;
  request_id: string;
  author_user_id: string | null;
  author_name: string | null;
  note: string;
  created_at: string;
};

export type InspectionAssessment = {
  id: string;
  request_id: string;
  inspector_user_id: string | null;
  inspector_name: string | null;
  risk_level: string | null;
  habitability: HabitabilityStatus | null;
  dictamen: string | null;
  report_body: string | null;
  recommendations: string | null;
  requires_in_person_visit: boolean;
  is_final: boolean;
  created_at: string;
  updated_at: string;
};

export type DamageReport = {
  id: string;
  public_code: string;
  case_id: string | null;
  title: string;
  description: string;
  public_summary: string | null;
  reporter_name: string | null;
  reporter_relationship: string | null;
  reporter_phone: string | null;
  reporter_email: string | null;
  report_type: string;
  urgency: UrgencyLevel;
  state: string;
  city: string;
  municipality: string | null;
  parish: string | null;
  sector: string | null;
  building_name: string | null;
  floor_or_unit: string | null;
  address_reference: string | null;
  needs_inspection: boolean;
  hide_exact_address: boolean;
  lat: number | null;
  lng: number | null;
  property_type: string;
  property_use: string | null;
  damage_level: string;
  damage_types: string[];
  affected_people_count: number;
  children_count: number;
  elderly_count: number;
  disabled_people_count: number;
  pets_count: number;
  has_injured_people: boolean;
  has_people_at_risk: boolean;
  emergency_notes: string | null;
  needs: string[];
  incident_date: string | null;
  incident_time: string | null;
  publication_name_mode: PublicationNameMode;
  consent_publish_public_summary: boolean;
  consent_share_private_data: boolean;
  consent_public_contact?: boolean;
  status: ReportStatus;
  verification_level: VerificationLevel;
  admin_notes: string | null;
  duplicate_of: string | null;
  source_type: string | null;
  source_url: string | null;
  source_author: string | null;
  source_external_id: string | null;
  source_attribution: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminReportRow = DamageReport & {
  photo_count: number;
  has_contact_info: boolean;
  inspection_request_id: string | null;
  inspection_status: string | null;
  inspection_assigned: boolean;
};

export type PhotoProcessingStatus = "pending" | "processing" | "ready" | "failed";

export type DamageReportPhoto = {
  id: string;
  report_id: string;
  storage_path: string | null;
  original_path?: string | null;
  public_path?: string | null;
  thumb_path?: string | null;
  medium_path?: string | null;
  large_path?: string | null;
  processing_status?: PhotoProcessingStatus;
  processing_error?: string | null;
  processed_at?: string | null;
  public_url: string | null;
  thumb_url?: string | null;
  is_sensitive: boolean;
  created_at: string;
  processing?: boolean;
};

export type CaseNeed = {
  id: string;
  case_id: string;
  need_type: string;
  description: string | null;
  quantity: string | null;
  urgency: UrgencyLevel;
  status: "pending" | "partially_covered" | "covered" | "cancelled";
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type PublicCase = {
  id: string;
  public_code: string;
  title: string;
  public_summary: string;
  report_type: string;
  public_contact_name: string | null;
  public_contact_phone: string | null;
  state: string;
  city: string | null;
  municipality: string | null;
  parish: string | null;
  sector_public: string | null;
  location_reference_public: string | null;
  location_precision: string;
  property_type: string;
  property_use: string | null;
  damage_level: string;
  damage_types: string[];
  urgency: UrgencyLevel;
  status: "open" | "partially_attended" | "closed" | "cancelled";
  verification_level: VerificationLevel;
  affected_people_count: number;
  has_injured_people: boolean;
  has_people_at_risk: boolean;
  report_count: number;
  created_from_report_id: string | null;
  closed_at: string | null;
  needs_inspection: boolean;
  inspection_status: HabitabilityStatus | null;
  inspected_at: string | null;
  inspected_by: string | null;
  source_attribution: string | null;
  source_url: string | null;
  lat: string | null;
  lng: string | null;
  created_at: string;
  updated_at: string;
  needs?: CaseNeed[];
  photos?: DamageReportPhoto[];
};

export type MapCase = {
  id: string;
  title: string;
  damage_level: string;
  city: string | null;
  state: string;
  lat: number;
  lng: number;
  urgency: UrgencyLevel;
  status: "open" | "partially_attended" | "closed" | "cancelled";
  verification_level: VerificationLevel;
  affected_people_count: number;
  needs_inspection: boolean;
  inspection_status: HabitabilityStatus | null;
  updated_at: string;
};

export type PublicReport = Pick<
  DamageReport,
  | "id"
  | "public_code"
  | "title"
  | "public_summary"
  | "report_type"
  | "urgency"
  | "state"
  | "city"
  | "municipality"
  | "parish"
  | "sector"
  | "property_type"
  | "damage_level"
  | "damage_types"
  | "affected_people_count"
  | "children_count"
  | "elderly_count"
  | "disabled_people_count"
  | "pets_count"
  | "has_injured_people"
  | "has_people_at_risk"
  | "emergency_notes"
  | "needs"
  | "incident_date"
  | "publication_name_mode"
  | "verification_level"
  | "status"
  | "created_at"
> & {
  reporter_name?: string | null;
  photos?: DamageReportPhoto[];
};

export type AidOffer = {
  id: string;
  name: string;
  aid_types: string[];
  location_text: string | null;
  contact: string | null;
  description: string | null;
  availability: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
};

export type InspectorApplication = {
  id: string;
  status: InspectorApplicationStatus;
  full_name: string;
  email: string;
  whatsapp: string;
  profession: InspectorProfession;
  profession_other: string | null;
  license_number: string;
  identity_number: string | null;
  practice_country: string;
  years_experience: InspectorExperienceRange;
  organization_name: string;
  verification_url: string;
  requires_additional_verification: boolean;
  review_notes: string | null;
  approved_by_user_id: string | null;
  linked_auth_user_id: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  activated_at: string | null;
  created_at: string;
  updated_at: string;
};

export type InspectorApplicationDocument = {
  id: string;
  application_id: string;
  document_type: InspectorApplicationDocumentType;
  storage_path: string;
  created_at: string;
};

export type InspectorActivationToken = {
  id: string;
  application_id: string;
  token_hash: string;
  expires_at: string;
  used_at: string | null;
  created_by_user_id: string | null;
  created_at: string;
};

export type PublicAidOffer = {
  id: string;
  name: string;
  aid_types: string[];
  location_text: string | null;
  description: string | null;
  availability: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
};

export type ReportContact = {
  id: string;
  report_id: string | null;
  request_type: ContactRequestType;
  name: string;
  contact: string;
  message: string;
  status: string;
  created_at: string;
};

export type AdminGroupingCandidateCase = {
  id: string;
  public_code: string;
  title: string;
  state: string;
  city: string | null;
  status: string;
  report_count: number;
};

export type AdminGroupingCandidateReport = {
  id: string;
  public_code: string;
  title: string;
  building_name: string | null;
};

export type AdminGroupingCandidate = {
  id: string;
  canonical_case_id: string;
  candidate_case_id: string;
  canonical_report_ids: string[];
  candidate_report_ids: string[];
  normalized_match_name: string;
  state: string;
  city: string | null;
  match_reason: string;
  match_score: number;
  status: "pending" | "approved" | "rejected" | "superseded";
  notes: string | null;
  evidence: Record<string, unknown> | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  canonical_case: AdminGroupingCandidateCase | null;
  candidate_case: AdminGroupingCandidateCase | null;
  canonical_reports: AdminGroupingCandidateReport[];
  candidate_reports: AdminGroupingCandidateReport[];
};

export type NeedSummary = {
  need: string;
  reportCount: number;
  criticalCount: number;
  zones: string[];
};

export type CitySummary = {
  city: string;
  state: string;
  count: number;
};

export type HomeZoneData = {
  cities: CitySummary[];
};

export type AdminStats = {
  pendingReports: number;
  criticalReports: number;
  peopleAtRiskReports: number;
  photosPendingReview: number;
  possibleDuplicates: number;
  pendingAidOffers: number;
  approvedToday: number;
  resolvedReports: number;
};

export type RemoteEvaluation = {
  id: string;
  inspection_request_id: string;
  evaluator_id: string;
  status: RemoteEvaluationStatus;
  evidence_quality: EvidenceQuality;
  missing_evidence_requested: MissingEvidenceItem[] | null;
  property_type_observed: PropertyTypeObserved | null;
  approximate_floors: ApproximateFloors | null;
  affected_area: AffectedArea[] | null;
  affected_elements: AffectedElement[] | null;
  visible_damages: VisibleDamage[] | null;
  estimated_crack_width: EstimatedCrackWidth | null;
  visible_risk_signals: VisibleRiskSignal[] | null;
  terrain_condition: TerrainCondition | null;
  damage_evolution: DamageEvolution | null;
  visible_risk_level: VisibleRiskLevel | null;
  recommendation_type: RecommendationType | null;
  onsite_inspection_urgency: OnsiteInspectionUrgency | null;
  technical_description: string | null;
  internal_notes: string | null;
  limitations_accepted: boolean;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type InspectionReport = {
  id: string;
  inspection_request_id: string;
  remote_evaluation_id: string | null;
  report_number: string;
  title: string;
  report_type: "remote_preliminary_observation";
  summary: string | null;
  visible_risk_level: VisibleRiskLevel | null;
  recommendation_type: RecommendationType | null;
  onsite_inspection_urgency: OnsiteInspectionUrgency | null;
  html_content: string | null;
  pdf_path: string | null;
  generated_by_user_id: string;
  generated_at: string;
  sent_to_applicant_at: string | null;
  created_at: string;
  updated_at: string;
};

export type InspectionEvidenceRequest = {
  id: string;
  inspection_request_id: string;
  requested_by_user_id: string;
  requested_items: MissingEvidenceItem[];
  message: string;
  status: "pending" | "partially_received" | "received" | "cancelled";
  sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PreliminaryReportPreviewResult = {
  html: string;
  summary: string;
  warnings: string[];
  blockingError: string | null;
};

export type ReportEvidenceItem = {
  id: string;
  source: "inspection_request_photo" | "damage_report_photo";
  mediaType: "image" | "video";
  url?: string | null;
  signedUrl?: string | null;
  storagePath?: string | null;
  originalName?: string | null;
  caption?: string | null;
  createdAt?: string | null;
  label: string;
};

export type ObservedElementRow = {
  element: string;
  observation: string;
  source: "Evidencia visual" | "Reportado por solicitante" | "No visible";
  certainty: string;
};

export type PreliminaryReportViewModel = {
  title: string;
  reportNumber: string;
  requestCode: string;
  issuedAtLabel: string;
  applicantName: string;
  locationGeneral: string;
  evaluatorName: string;
  propertyTypeLabel: string;
  floorsLabel: string;
  informationSourceLabel: string;
  baseInformation: {
    photoCount: number;
    videoCount: number;
    hasDescription: boolean;
    hasInheritedEvidence: boolean;
    evidenceQualityLabel: string;
  };
  evidenceSummaryText: string;
  generalObservationsText: string;
  observedRows: ObservedElementRow[];
  generalDamages: string[];
  visualAlertSignals: string[];
  reportedAlertSignals: string[];
  undeterminedAlertSignals: string[];
  visibleRiskLevelLabel: string;
  visibleRiskLevelText: string;
  onsitePriorityLabel: string;
  onsitePriorityText: string;
  recommendationLabel: string;
  recommendationText: string;
  evidenceUsedRows: string[];
  scopeText: string;
  closingText: string;
  warnings: string[];
};

export type DuplicateCandidateReport = {
  id: string;
  public_code: string;
  title: string;
  building_name: string | null;
  state: string;
  city: string;
  reporter_name: string | null;
  reporter_phone: string | null;
  lat: number | null;
  lng: number | null;
  damage_level: string;
  status: string;
  created_at: string;
};

export type Workshop = {
  id: string;
  user_id: string | null;
  name: string;
  slug: string;
  responsible_name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  state: string;
  city: string | null;
  municipality: string | null;
  public_location: string | null;
  description: string | null;
  what_they_do: string;
  initial_photo_path: string | null;
  avatar_path: string | null;
  identity_document: string | null;
  public_name_allowed: boolean;
  public_location_allowed: boolean;
  public_instagram_allowed: boolean;
  public_whatsapp_allowed: boolean;
  status: string;
  admin_notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkshopListItem = Pick<
  Workshop,
  "id" | "user_id" | "name" | "responsible_name" | "city" | "state" | "status" | "created_at"
>;

export type WorkshopNeedWithWorkshopName = WorkshopNeed & {
  workshop?: {
    id: string;
    name: string;
    slug?: string;
    status?: string;
  } | null;
};

export type WorkshopHelpOfferWithRelations = WorkshopHelpOffer & {
  workshop?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  need?: {
    id: string;
    title: string;
  } | null;
};

export type WorkshopNeed = {
  id: string;
  workshop_id: string;
  title: string;
  description: string | null;
  requested_items: string | null;
  urgency: string | null;
  status: string;
  admin_notes: string | null;
  published_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkshopPhoto = {
  id: string;
  workshop_id: string;
  title: string | null;
  description: string | null;
  storage_path: string;
  status: string;
  uploaded_by: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkshopHelpOffer = {
  id: string;
  workshop_id: string | null;
  need_id: string | null;
  donor_name: string;
  donor_contact: string;
  donor_email: string | null;
  donor_phone: string | null;
  help_type: string;
  description: string;
  quantity: string | null;
  availability: string | null;
  location: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CartucheraDonation = {
  id: string;
  donor_name: string;
  donor_email: string;
  donor_phone: string | null;
  help_type: string;
  description: string;
  quantity: string | null;
  created_at: string;
};

export type WorkshopActivationToken = {
  id: string;
  workshop_id: string;
  token_hash: string;
  expires_at: string;
  used_at: string | null;
  created_by_user_id: string | null;
  created_at: string;
};

export type SewingPattern = {
  id: string;
  title: string;
  description: string | null;
  difficulty: string | null;
  category: string | null;
  subgroup: string | null;
  file_path: string;
  file_size_bytes: number | null;
  image_path: string | null;
  status: string;
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type DuplicateCandidate = {
  id: string;
  report_id: string;
  original_report_id: string;
  group_id: string;
  match_type: "same_building_city" | "same_phone" | "similar_title" | "nearby_coords";
  match_score: number;
  match_evidence: Record<string, unknown> | null;
  status: "pending" | "approved" | "rejected";
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  report: DuplicateCandidateReport | null;
  original_report: DuplicateCandidateReport | null;
};
