export const REMOTE_EVALUATION_STATUSES = ["draft", "submitted", "cancelled"] as const;

export const EVIDENCE_QUALITIES = ["sufficient", "partial", "insufficient"] as const;

export const MISSING_EVIDENCE_ITEMS = [
  "facade_full",
  "damage_close",
  "damage_far",
  "columns",
  "beams",
  "stairs",
  "roof_or_slab",
  "floor_or_foundation",
  "exterior_ground",
  "walkthrough_video",
  "other",
] as const;

export const PROPERTY_TYPES_OBSERVED = [
  "house",
  "apartment",
  "multifamily_building",
  "commercial",
  "school_or_community",
  "other",
  "undetermined",
] as const;

export const APPROXIMATE_FLOORS = ["one", "two", "three_to_five", "more_than_five", "undetermined"] as const;

export const AFFECTED_AREAS = [
  "ground_floor",
  "intermediate_floor",
  "top_floor",
  "facade",
  "stairs",
  "common_area",
  "interior_walls",
  "exterior_walls",
  "roof_or_slab",
  "terrain",
  "multiple_areas",
  "undetermined",
] as const;

export const AFFECTED_ELEMENTS = [
  "walls",
  "columns",
  "beams",
  "slab_or_roof",
  "stairs",
  "facade",
  "floor",
  "foundation_or_ground",
  "doors_or_windows",
  "finishes",
  "electrical_installation",
  "gas_installation",
  "water_installation",
  "undetermined",
] as const;

export const VISIBLE_DAMAGES = [
  "hairline_cracks",
  "diagonal_cracks",
  "wide_cracks",
  "material_detachment",
  "visible_deformation",
  "apparent_tilt",
  "wall_column_separation",
  "partial_wall_collapse",
  "partial_collapse",
  "total_collapse",
  "moisture_or_leak",
  "ground_cracks",
  "settlement",
  "undetermined",
] as const;

export const ESTIMATED_CRACK_WIDTHS = [
  "less_than_1mm",
  "one_to_3mm",
  "three_to_10mm",
  "greater_than_10mm",
  "not_estimable_from_photos",
  "not_applicable",
] as const;

export const VISIBLE_RISK_SIGNALS = [
  "important_diagonal_cracks",
  "cracked_columns",
  "exposed_rebar",
  "damaged_beams",
  "cracked_or_fallen_slab",
  "apparent_building_tilt",
  "sunken_or_lifted_floor",
  "damaged_stairs",
  "doors_windows_jammed_after_sismo",
  "recurrent_material_fall",
  "reported_progressive_damage",
  "gas_or_electrical_risk",
  "no_severe_visible_signs",
  "undetermined",
] as const;

export const TERRAIN_CONDITIONS = [
  "no_visible_ground_damage",
  "ground_cracks",
  "settlement",
  "landslide",
  "unstable_slope",
  "possible_liquefaction",
  "undetermined",
] as const;

export const DAMAGE_EVOLUTIONS = ["stabilized", "progressive", "undetermined"] as const;

export const VISIBLE_RISK_LEVELS = ["low", "medium", "high", "critical", "undetermined"] as const;

export const RECOMMENDATION_TYPES = [
  "observe_and_document_changes",
  "avoid_repairs_without_technical_review",
  "restrict_access_to_affected_areas",
  "avoid_entry_preventively",
  "request_priority_onsite_inspection",
  "contact_authorities_or_civil_protection",
  "request_more_evidence_before_orientation",
] as const;

export const ONSITE_URGENCIES = ["immediate_24h", "high_72h", "medium_one_week", "low_follow_up", "not_determinable"] as const;
