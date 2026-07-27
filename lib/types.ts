import type { ALLY_CATEGORIES, URGENCY_LEVELS } from "@/lib/constants";

export type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
};

export type UrgencyLevel = (typeof URGENCY_LEVELS)[number];
export type AllyCategory = (typeof ALLY_CATEGORIES)[number];

export type Ally = {
  id: string;
  user_id: string | null;
  category: AllyCategory | string;
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

export type AllyListItem = Pick<
  Ally,
  "id" | "user_id" | "category" | "name" | "responsible_name" | "city" | "state" | "status" | "created_at"
>;

export type AidRequester = {
  id: string;
  user_id: string | null;
  name: string;
  type: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type MessageSenderRole = "admin" | "aliado" | "solicitante";

export type Message = {
  id: string;
  thread_id: string;
  sender_user_id: string | null;
  sender_role: MessageSenderRole | string;
  body: string;
  created_at: string;
};

export type MessageParticipant = {
  id: string;
  thread_id: string;
  user_id: string | null;
  ally_id: string | null;
  participant_role: MessageSenderRole | string;
  last_read_at: string | null;
  created_at: string;
};

export type MessageThread = {
  id: string;
  ally_id: string | null;
  requester_id: string | null;
  subject: string;
  status: "open" | "closed" | string;
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type MessageThreadListItem = MessageThread & {
  ally?: Pick<Ally, "id" | "name" | "slug"> | null;
  requester?: Pick<AidRequester, "id" | "name" | "type" | "user_id"> | null;
  latest_message?: Message | null;
  current_participant?: MessageParticipant | null;
  is_unread: boolean;
};

export type MessageThreadDetail = MessageThread & {
  ally?: Pick<Ally, "id" | "name" | "slug"> | null;
  requester?: Pick<AidRequester, "id" | "name" | "type" | "contact_name" | "user_id"> | null;
  participants: MessageParticipant[];
};

export type AidRequest = {
  id: string;
  requester_id: string | null;
  title: string;
  description: string | null;
  requested_items: string | null;
  urgency: string | null;
  status: string;
  admin_notes: string | null;
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type AidRequesterActivationToken = {
  id: string;
  requester_id: string;
  token_hash: string;
  expires_at: string;
  used_at: string | null;
  created_by_user_id: string | null;
  created_at: string;
};

export type AssignedTask = {
  id: string;
  ally_id: string;
  aid_request_id: string | null;
  title: string;
  description: string | null;
  expected_output: string | null;
  requested_items: string | null;
  urgency: string | null;
  status: string;
  admin_notes: string | null;
  ally_notes: string | null;
  assigned_at: string | null;
  due_date: string | null;
  completed_at: string | null;
  published_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AssignedTaskWithAllyName = AssignedTask & {
  ally?: {
    id: string;
    name: string;
    slug?: string;
    status?: string;
  } | null;
  workshop_id?: string | null;
  workshop?: {
    id: string;
    name: string;
    slug?: string;
    status?: string;
  } | null;
};

export type AllyPhoto = {
  id: string;
  ally_id: string;
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

export type CollaboratorOffer = {
  id: string;
  ally_id: string | null;
  collaborator_id: string | null;
  aid_request_id: string | null;
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

export type CollaboratorOfferWithRelations = CollaboratorOffer & {
  ally?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  task?: {
    id: string;
    title: string;
  } | null;
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

export type Collaborator = {
  id: string;
  name: string;
  type: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  notes: string | null;
  status: string;
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

export type AllyActivationToken = {
  id: string;
  ally_id: string;
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

export type AllyVolunteerAssignment = {
  id: string;
  ally_id: string | null;
  volunteer_id: string | null;
  name: string;
  role: string | null;
  phone: string | null;
  instagram: string | null;
  status: string;
  assigned_at: string;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type AllyVolunteerAssignmentWithRelations = AllyVolunteerAssignment & {
  ally?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  volunteer?: Volunteer | null;
};

export type Volunteer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  instagram: string | null;
  skills: string | null;
  availability: string | null;
  state: string | null;
  city: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type RawMaterial = {
  id: string;
  ally_id: string | null;
  name: string;
  category: string | null;
  unit: string | null;
  description: string | null;
  stock_quantity: number | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  ally?: Pick<Ally, "id" | "name" | "slug"> | null;
};

export type RawMaterialMovement = {
  id: string;
  raw_material_id: string;
  related_task_id: string | null;
  related_assignment_id: string | null;
  movement_type: string;
  quantity_change: number;
  balance_after: number | null;
  notes: string | null;
  created_by_user_id: string | null;
  created_at: string;
};

export type AllyRawMaterialAssignment = {
  id: string;
  ally_id: string;
  raw_material_id: string | null;
  task_id: string | null;
  name_snapshot: string;
  quantity: number | null;
  used_quantity: number | null;
  unit: string | null;
  status: string;
  assigned_at: string;
  delivered_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AllyDelivery = {
  id: string;
  ally_id: string;
  task_id: string | null;
  title: string;
  description: string | null;
  quantity: string | null;
  status: string;
  scheduled_for: string | null;
  delivered_at: string | null;
  received_at: string | null;
  received_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskIncident = {
  id: string;
  task_id: string;
  created_by_user_id: string | null;
  created_by_role: string;
  description: string;
  status: string;
  resolution_notes: string | null;
  resolved_by_user_id: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskMaterialAssignment = AllyRawMaterialAssignment & {
  raw_material?: Pick<RawMaterial, "id" | "name" | "unit" | "stock_quantity" | "status"> | null;
  ally?: Pick<Ally, "id" | "name" | "slug"> | null;
  task?: Pick<AssignedTask, "id" | "title" | "status" | "due_date"> | null;
};

export type DeliveryWithRelations = AllyDelivery & {
  ally?: Pick<Ally, "id" | "name" | "slug"> | null;
  task?: Pick<AssignedTask, "id" | "title" | "status" | "due_date"> | null;
};

export type RequesterDeliveryWithRelations = DeliveryWithRelations & {
  task: Pick<AssignedTask, "id" | "title" | "status" | "due_date"> & { aid_request_id: string | null };
  request: Pick<AidRequest, "id" | "title">;
};

export type DeliveryDetail = Omit<DeliveryWithRelations, "task"> & {
  task?: (NonNullable<DeliveryWithRelations["task"]> & {
    aid_request_id: string | null;
    request?: Pick<AidRequest, "id" | "title" | "requester_id"> | null;
  }) | null;
};

export type AidRequestWithRelations = AidRequest & {
  requester?: Pick<AidRequester, "id" | "name" | "type" | "contact_name" | "email" | "user_id"> | null;
  tasks?: Array<Pick<AssignedTask, "id" | "title" | "status" | "due_date" | "created_at"> & {
    ally?: Pick<Ally, "id" | "name" | "slug"> | null;
    deliveries?: DeliveryWithRelations[];
  }>;
};

export type AssignedTaskBoardItem = AssignedTaskWithAllyName & {
  material_assignments?: TaskMaterialAssignment[];
  deliveries?: DeliveryWithRelations[];
  incidents?: TaskIncident[];
};

export type RawMaterialMovementWithRelations = RawMaterialMovement & {
  raw_material?: Pick<RawMaterial, "id" | "name" | "unit" | "status"> | null;
  task?: Pick<AssignedTask, "id" | "title" | "status"> | null;
  assignment?: Pick<AllyRawMaterialAssignment, "id" | "name_snapshot" | "ally_id"> | null;
};

export type AppContext =
  | { type: "platform" }
  | { type: "aliado"; workshopId: string };

export type LinkedWorkshop = {
  id: string;
  name: string;
  slug: string;
  avatar_path: string | null;
};

export type Workshop = Ally;
export type WorkshopListItem = AllyListItem;
export type WorkshopNeed = AssignedTask;
export type WorkshopNeedWithWorkshopName = AssignedTaskWithAllyName;
export type WorkshopPhoto = AllyPhoto;
export type WorkshopHelpOffer = CollaboratorOffer;
export type WorkshopHelpOfferWithRelations = CollaboratorOfferWithRelations;
export type WorkshopActivationToken = AllyActivationToken;
export type WorkshopVolunteer = AllyVolunteerAssignment;
