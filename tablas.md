## Table `allies`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  Nullable |
| `name` | `text` |  |
| `slug` | `text` |  Unique |
| `responsible_name` | `text` |  Nullable |
| `email` | `text` |  Nullable |
| `phone` | `text` |  Nullable |
| `whatsapp` | `text` |  Nullable |
| `instagram` | `text` |  Nullable |
| `state` | `text` |  |
| `city` | `text` |  Nullable |
| `municipality` | `text` |  Nullable |
| `public_location` | `text` |  Nullable |
| `description` | `text` |  Nullable |
| `what_they_do` | `text` |  |
| `initial_photo_path` | `text` |  Nullable |
| `avatar_path` | `text` |  Nullable |
| `identity_document` | `text` |  Nullable |
| `public_name_allowed` | `bool` |  |
| `public_location_allowed` | `bool` |  |
| `public_instagram_allowed` | `bool` |  |
| `public_whatsapp_allowed` | `bool` |  |
| `status` | `text` |  |
| `admin_notes` | `text` |  Nullable |
| `approved_by` | `uuid` |  Nullable |
| `approved_at` | `timestamptz` |  Nullable |
| `rejected_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `category` | `text` |  |

## Table `user_allies`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `ally_id` | `uuid` |  |
| `ally_role` | `text` |  |
| `created_at` | `timestamptz` |  |

## Table `ally_activation_tokens`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `ally_id` | `uuid` |  |
| `token_hash` | `text` |  Unique |
| `expires_at` | `timestamptz` |  |
| `used_at` | `timestamptz` |  Nullable |
| `created_by_user_id` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `assigned_tasks`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `ally_id` | `uuid` |  |
| `title` | `text` |  |
| `description` | `text` |  Nullable |
| `expected_output` | `text` |  Nullable |
| `urgency` | `text` |  Nullable |
| `status` | `text` |  |
| `admin_notes` | `text` |  Nullable |
| `published_at` | `timestamptz` |  Nullable |
| `closed_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `aid_request_id` | `uuid` |  Nullable |
| `ally_notes` | `text` |  Nullable |
| `assigned_at` | `timestamptz` |  Nullable |
| `due_date` | `date` |  Nullable |
| `completed_at` | `timestamptz` |  Nullable |

## Table `ally_photos`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `ally_id` | `uuid` |  |
| `title` | `text` |  Nullable |
| `description` | `text` |  Nullable |
| `storage_path` | `text` |  |
| `status` | `text` |  |
| `uploaded_by` | `uuid` |  Nullable |
| `reviewed_by` | `uuid` |  Nullable |
| `reviewed_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `collaborator_offers`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `ally_id` | `uuid` |  Nullable |
| `need_id` | `uuid` |  Nullable |
| `donor_name` | `text` |  |
| `donor_contact` | `text` |  |
| `donor_email` | `text` |  Nullable |
| `donor_phone` | `text` |  Nullable |
| `help_type` | `text` |  |
| `description` | `text` |  |
| `quantity` | `text` |  Nullable |
| `availability` | `text` |  Nullable |
| `location` | `text` |  Nullable |
| `status` | `text` |  |
| `admin_notes` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `collaborator_id` | `uuid` |  Nullable |
| `aid_request_id` | `uuid` |  Nullable |

## Table `sewing_patterns`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `title` | `text` |  |
| `description` | `text` |  Nullable |
| `difficulty` | `text` |  Nullable |
| `category` | `text` |  Nullable |
| `subgroup` | `text` |  Nullable |
| `file_path` | `text` |  |
| `file_size_bytes` | `int8` |  Nullable |
| `image_path` | `text` |  Nullable |
| `status` | `text` |  |
| `created_by_user_id` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `cartuchera_donations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `donor_name` | `text` |  |
| `donor_email` | `text` |  |
| `donor_phone` | `text` |  Nullable |
| `help_type` | `text` |  |
| `description` | `text` |  |
| `quantity` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `ally_volunteer_assignments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `ally_id` | `uuid` |  Nullable |
| `name` | `text` |  |
| `role` | `text` |  Nullable |
| `phone` | `text` |  Nullable |
| `instagram` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `volunteer_id` | `uuid` |  Nullable |
| `status` | `text` |  |
| `assigned_at` | `timestamptz` |  |
| `notes` | `text` |  Nullable |
| `updated_at` | `timestamptz` |  |

## Table `audit_events`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `actor_id` | `uuid` |  Nullable |
| `actor_role` | `text` |  |
| `actor_email` | `text` |  Nullable |
| `context_type` | `text` |  |
| `context_id` | `uuid` |  Nullable |
| `entity_type` | `text` |  |
| `entity_id` | `uuid` |  Nullable |
| `action` | `text` |  |
| `old_data` | `jsonb` |  Nullable |
| `new_data` | `jsonb` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `volunteers`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `email` | `text` |  Nullable |
| `phone` | `text` |  Nullable |
| `instagram` | `text` |  Nullable |
| `skills` | `text` |  Nullable |
| `availability` | `text` |  Nullable |
| `state` | `text` |  Nullable |
| `city` | `text` |  Nullable |
| `notes` | `text` |  Nullable |
| `status` | `text` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `collaborators`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `type` | `text` |  |
| `contact_name` | `text` |  Nullable |
| `email` | `text` |  Nullable |
| `phone` | `text` |  Nullable |
| `location` | `text` |  Nullable |
| `notes` | `text` |  Nullable |
| `status` | `text` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `aid_requesters`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `type` | `text` |  |
| `contact_name` | `text` |  Nullable |
| `email` | `text` |  Nullable |
| `phone` | `text` |  Nullable |
| `location` | `text` |  Nullable |
| `notes` | `text` |  Nullable |
| `status` | `text` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `aid_requests`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `requester_id` | `uuid` |  Nullable |
| `title` | `text` |  |
| `description` | `text` |  Nullable |
| `requested_items` | `text` |  Nullable |
| `urgency` | `text` |  Nullable |
| `status` | `text` |  |
| `admin_notes` | `text` |  Nullable |
| `created_by_user_id` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `raw_materials`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `category` | `text` |  Nullable |
| `unit` | `text` |  Nullable |
| `description` | `text` |  Nullable |
| `stock_quantity` | `numeric` |  Nullable |
| `notes` | `text` |  Nullable |
| `status` | `text` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `ally_raw_material_assignments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `ally_id` | `uuid` |  |
| `raw_material_id` | `uuid` |  Nullable |
| `name_snapshot` | `text` |  |
| `quantity` | `numeric` |  Nullable |
| `unit` | `text` |  Nullable |
| `status` | `text` |  |
| `assigned_at` | `timestamptz` |  |
| `delivered_at` | `timestamptz` |  Nullable |
| `notes` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `ally_deliveries`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `ally_id` | `uuid` |  |
| `task_id` | `uuid` |  Nullable |
| `title` | `text` |  |
| `description` | `text` |  Nullable |
| `quantity` | `text` |  Nullable |
| `status` | `text` |  |
| `delivered_at` | `timestamptz` |  Nullable |
| `received_by` | `text` |  Nullable |
| `notes` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `message_threads`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `ally_id` | `uuid` |  Nullable |
| `requester_id` | `uuid` | Nullable; referencia `aid_requesters(id)` |
| `subject` | `text` |  |
| `status` | `text` |  |
| `created_by_user_id` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

Cada hilo debe tener exactamente uno de `ally_id` o `requester_id`.

## Table `message_thread_participants`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `thread_id` | `uuid` |  |
| `user_id` | `uuid` |  Nullable |
| `ally_id` | `uuid` |  Nullable |
| `participant_role` | `text` |  |
| `last_read_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `messages`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `thread_id` | `uuid` |  |
| `sender_user_id` | `uuid` |  Nullable |
| `sender_role` | `text` |  |
| `body` | `text` |  |
| `created_at` | `timestamptz` |  |

## RLS Policies

### `allies`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Public can register allies` | INSERT | anon, authenticated | PERMISSIVE | — | `(status = 'pendiente'::text)` |
| `Admins can manage allies` | ALL | authenticated | PERMISSIVE | `(((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)` | `(((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)` |
| `Public can read active allies` | SELECT | anon, authenticated | PERMISSIVE | `((status = 'activo'::text) AND (public_name_allowed = true))` | — |
| `Allies can read own ally` | SELECT | authenticated | PERMISSIVE | `(( SELECT auth.uid() AS uid) = user_id)` | — |
| `Allies can update own ally` | UPDATE | authenticated | PERMISSIVE | `(( SELECT auth.uid() AS uid) = user_id)` | `(( SELECT auth.uid() AS uid) = user_id)` |

### `ally_photos`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Public can read approved photos` | SELECT | anon, authenticated | PERMISSIVE | `((status = 'aprobada'::text) AND (EXISTS ( SELECT 1    FROM allies w   WHERE ((w.id = ally_photos.ally_id) AND (w.status = 'activo'::text)))))` | — |
| `Admins can manage photos` | ALL | authenticated | PERMISSIVE | `(((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)` | `(((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)` |
| `Allies can manage own photos` | ALL | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM allies w   WHERE ((w.id = ally_photos.ally_id) AND (w.user_id = ( SELECT auth.uid() AS uid)))))` | `(EXISTS ( SELECT 1    FROM allies w   WHERE ((w.id = ally_photos.ally_id) AND (w.user_id = ( SELECT auth.uid() AS uid)))))` |

### `sewing_patterns`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Public can read published patterns` | SELECT | anon, authenticated | PERMISSIVE | `(status = 'publicado'::text)` | — |
| `Admins can manage patterns` | ALL | authenticated | PERMISSIVE | `(((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)` | `(((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)` |

### `assigned_tasks`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allies can manage own assigned tasks` | ALL | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM allies w   WHERE ((w.id = assigned_tasks.ally_id) AND (w.user_id = ( SELECT auth.uid() AS uid)))))` | `(EXISTS ( SELECT 1    FROM allies w   WHERE ((w.id = assigned_tasks.ally_id) AND (w.user_id = ( SELECT auth.uid() AS uid)))))` |
| `Admins can manage assigned tasks` | ALL | authenticated | PERMISSIVE | `(((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)` | `(((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)` |
| `Public can read published assigned tasks` | SELECT | anon, authenticated | PERMISSIVE | `((status = 'publicada'::text) AND (EXISTS ( SELECT 1    FROM allies w   WHERE ((w.id = assigned_tasks.ally_id) AND (w.status = 'activo'::text)))))` | — |

### `ally_volunteer_assignments`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allies can read own volunteer assignments` | SELECT | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM allies w   WHERE ((w.id = ally_volunteer_assignments.ally_id) AND (w.user_id = ( SELECT auth.uid() AS uid)))))` | — |
| `Admins can manage volunteers` | ALL | authenticated | PERMISSIVE | `(((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)` | `(((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)` |

### `audit_events`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Authenticated can create audit events` | INSERT | authenticated | PERMISSIVE | — | `(( SELECT auth.uid() AS uid) = actor_id)` |
| `Admins can read audit events` | SELECT | authenticated | PERMISSIVE | `(((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)` | — |

### `collaborator_offers`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Public can create collaborator offers` | INSERT | anon, authenticated | PERMISSIVE | — | `(status = 'recibida'::text)` |
| `Admins can manage collaborator offers` | ALL | authenticated | PERMISSIVE | `(((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)` | `(((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)` |

### `cartuchera_donations`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Public can create valid cartuchera donations` | INSERT | anon, authenticated | PERMISSIVE | — | `((length(TRIM(BOTH FROM donor_name)) > 0) AND (POSITION(('@'::text) IN (donor_email)) > 1) AND (length(TRIM(BOTH FROM help_type)) > 0) AND (length(TRIM(BOTH FROM description)) > 0))` |
| `Admins can read cartuchera donations` | SELECT | authenticated | PERMISSIVE | `(((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)` | — |

### `user_allies`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Admins can manage user allies` | ALL | authenticated | PERMISSIVE | `(((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)` | `(((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)` |

### `ally_raw_material_assignments`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allies can read own raw material assignments` | SELECT | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM allies a   WHERE ((a.id = ally_raw_material_assignments.ally_id) AND (a.user_id = ( SELECT auth.uid() AS uid)))))` | — |
| `Admins can manage raw material assignments` | ALL | authenticated | PERMISSIVE | `(((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)` | `(((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)` |

### `ally_activation_tokens`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Admins can manage activation tokens` | ALL | authenticated | PERMISSIVE | `(((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)` | `(((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)` |

### `ally_deliveries`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allies can read own deliveries` | SELECT | authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM allies a   WHERE ((a.id = ally_deliveries.ally_id) AND (a.user_id = ( SELECT auth.uid() AS uid)))))` | — |
| `Admins can manage ally deliveries` | ALL | authenticated | PERMISSIVE | `(((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)` | `(((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)` |

### `volunteers`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Admins can manage all` | ALL | authenticated | PERMISSIVE | `(((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)` | `(((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)` |

### `collaborators`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Admins can manage all` | ALL | authenticated | PERMISSIVE | `(((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)` | `(((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)` |

### `aid_requesters`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Admins can manage all` | ALL | authenticated | PERMISSIVE | `(((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)` | `(((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)` |

### `aid_requests`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Admins can manage all` | ALL | authenticated | PERMISSIVE | `(((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)` | `(((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)` |

### `raw_materials`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Admins can manage all` | ALL | authenticated | PERMISSIVE | `(((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)` | `(((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)` |

### `message_threads`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Users can read own message threads` | SELECT | authenticated | PERMISSIVE | Admin o participante aliado/solicitante autenticado | — |
| `Admins can create message threads` | INSERT | authenticated | PERMISSIVE | — | Rol `admin` |
| `Admins can update message threads` | UPDATE | authenticated | PERMISSIVE | Rol `admin` | Rol `admin` |
| `Admins can delete message threads` | DELETE | authenticated | PERMISSIVE | Rol `admin` | — |

### `message_thread_participants`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Users can read own message participants` | SELECT | authenticated | PERMISSIVE | Admin o participante autenticado | — |
| `Users can update own message participants` | UPDATE | authenticated | PERMISSIVE | Admin o participante autenticado | Admin o participante autenticado |
| `Admins can insert message participants` | INSERT | authenticated | PERMISSIVE | — | Rol `admin` |
| `Admins can delete message participants` | DELETE | authenticated | PERMISSIVE | Rol `admin` | — |

### `messages`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Users can read own messages` | SELECT | authenticated | PERMISSIVE | Admin o participante autenticado | — |
| `Users can send own messages` | INSERT | authenticated | PERMISSIVE | — | Admin o aliado/solicitante participante en hilo abierto |
| `Admins can update messages` | UPDATE | authenticated | PERMISSIVE | Rol `admin` | Rol `admin` |
| `Admins can delete messages` | DELETE | authenticated | PERMISSIVE | Rol `admin` | — |
