import { createClient } from "@supabase/supabase-js";

// ── Data from Excel ──

interface WorkshopRow {
  name: string;
  type: "ACADEMIA" | "TALLER";
  instagram: string;
  location: string;
  phone: string;
  state: string;
  city: string;
}

interface VolunteerRow {
  name: string;
  instagram: string;
  role: string;
  phone: string;
  workshopName: string;
}

const STATE_MAP: Record<string, string> = {
  CARACAS: "Distrito Capital",
  ANZOATEGUI: "Anzoátegui",
  MERIDAA: "Mérida",
};

function cleanPhone(p: string): string {
  if (!p) return "";
  return p.replace(/\.0$/, "").replace(/\s+/g, "").trim();
}

function extractCity(location: string): string {
  const loc = location.trim();
  if (/Caracas/i.test(loc)) return "Caracas";
  if (/Guayana|San Felix/i.test(loc)) return "Ciudad Guayana";
  if (/Lecher[ií]a/i.test(loc)) return "Lechería";
  if (/Pampatar/i.test(loc)) return "Lechería";
  if (/cumanagoto|coumanagoto/i.test(loc)) return "Lechería";
  if (/gaviotas/i.test(loc)) return "Lechería";
  if (/Plaza Mayor/i.test(loc)) return "Lechería";
  if(/Barcelona/i.test(loc)) return "Barcelona";
  if (/Boyaca/i.test(loc)) return "Barcelona";
  if (/El Tigre/i.test(loc)) return "El Tigre";
  if (/Roca Tarpeya|Los Simbolos|Circulo Militar|Proceres|Bosque|Chacaio|Medina/i.test(loc)) return "Caracas";
  return "";
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim() || "taller";
}

// ── Hardcoded parsed data (from Excel) ──

const RAW_DATA: { sheet: string; name: string; type: string; instagram: string; location: string; phone: string; vName: string; vInstagram: string; vRole: string; vPhone: string }[] = [
  // CARACAS
  { sheet: "CARACAS", name: "Emprofesional", type: "ACADEMIA", instagram: "emprofesional.ve", location: "Av. principal del Bosque- Caracas, al lado del Centro Expreso Chacaio", phone: "4120150838", vName: "Zara Guillèn", vInstagram: "zaracomolatienda", vRole: "PATRONISTA DIGITAL", vPhone: "4125490800" },
  { sheet: "CARACAS", name: "Academia Chamileon", type: "ACADEMIA", instagram: "chamileon.academia", location: "Circulo Militar Los Proceres", phone: "4120150838", vName: "Diagni Márquez", vInstagram: "diagni_elegance", vRole: "COSTURERA", vPhone: "4122026788" },
  { sheet: "CARACAS", name: "Eliery Guarepe Alitier", type: "TALLER", instagram: "Elieryguarepealitier", location: "Av. Presidente  Medina. Caracas.", phone: "4123407847", vName: "María de los Ángeles Piñero", vInstagram: "mariaapinero", vRole: "DISEÑADOR DE MODA", vPhone: "4141155101" },
  { sheet: "CARACAS", name: "Taller Dailys", type: "TALLER", instagram: "dailys.ve", location: "Ciudad Guayana San Felix. Av. Centurion la bombita", phone: "04249281645 / 04128794804", vName: "Maylen Rivas", vInstagram: "may_intimate.clothes", vRole: "COSTURERA", vPhone: "4242988766" },
  { sheet: "CARACAS", name: "Kinyi Store", type: "TALLER", instagram: "kinyistore", location: "Roca Tarpeya", phone: "4241809415", vName: "Manuel Sosa", vInstagram: "movil2005", vRole: "LOGISTICA", vPhone: "4145867552" },
  { sheet: "CARACAS", name: "Oswaldo Teran", type: "TALLER", instagram: "oswaldo_teran_depablos", location: "Los Simbolos", phone: "4243617085", vName: "Johana Rojas", vInstagram: "haditamodista", vRole: "COSTURERA", vPhone: "4264031261" },
  // CARACAS extra volunteers (no workshop)
  { sheet: "CARACAS", name: "", type: "", instagram: "", location: "", phone: "", vName: "Fabiola Gutierrez", vInstagram: "angeles_1301", vRole: "LOGISTICA", vPhone: "4142801514" },
  { sheet: "CARACAS", name: "", type: "", instagram: "", location: "", phone: "", vName: "Anli Peña", vInstagram: "elrinconcitodean_", vRole: "COSTURERA", vPhone: "4265301819" },
  { sheet: "CARACAS", name: "", type: "", instagram: "", location: "", phone: "", vName: "Oswaldo Terán", vInstagram: "oswaldo_teran_depablos", vRole: "COSTURERO", vPhone: "4243617085" },
  { sheet: "CARACAS", name: "", type: "", instagram: "", location: "", phone: "", vName: "Carlos Briceño", vInstagram: "", vRole: "LOGISTICA", vPhone: "4162691110" },
  { sheet: "CARACAS", name: "", type: "", instagram: "", location: "", phone: "", vName: "Valentina Rivero", vInstagram: "", vRole: "LOGISTICA", vPhone: "4141255222" },
  { sheet: "CARACAS", name: "", type: "", instagram: "", location: "", phone: "", vName: "Martha Mina", vInstagram: "", vRole: "COSTURERA", vPhone: "4241175311" },
  { sheet: "CARACAS", name: "", type: "", instagram: "", location: "", phone: "", vName: "Crisalida Lemus", vInstagram: "Lemus Creaciones", vRole: "COSTURERA", vPhone: "4148011624" },
  { sheet: "CARACAS", name: "", type: "", instagram: "", location: "", phone: "", vName: "Maida Chaparro", vInstagram: "sublimacionsd7_", vRole: "COSTURERA", vPhone: "4142427812" },
  { sheet: "CARACAS", name: "", type: "", instagram: "", location: "", phone: "", vName: "Adriana Belizario", vInstagram: "adrianabeli", vRole: "LOGISTICA", vPhone: "" },
  { sheet: "CARACAS", name: "", type: "", instagram: "", location: "", phone: "", vName: "dubhe Peaspan", vInstagram: "dubheselene", vRole: "COSTURERA", vPhone: "4241713956" },
  // ANZOATEGUI
  { sheet: "ANZOATEGUI", name: "PROMODA", type: "ACADEMIA", instagram: "promoda.ven", location: "CC. Plaza Mayor", phone: "4222600032", vName: "Carmen Rodríguez", vInstagram: "carmenmariar.seguros", vRole: "COSTURERA", vPhone: "4147859975" },
  { sheet: "ANZOATEGUI", name: "TC TEXTILES 21", type: "TALLER", instagram: "Jctextile21", location: "Calle brisas del mar, sector corea 1bna. Cerca de la Av. cumanagoto", phone: "4228011181", vName: "Paola Alfonzo", vInstagram: "Paola_iar", vRole: "COSTURERA", vPhone: "4120372217" },
  { sheet: "ANZOATEGUI", name: "Doral Print", type: "TALLER", instagram: "doralprintve", location: "Av.coumanagoto", phone: "04248621749", vName: "Andreina Acosta", vInstagram: "creacionescaad", vRole: "COSTURERA", vPhone: "4121157227" },
  { sheet: "ANZOATEGUI", name: "Vou atelier", type: "TALLER", instagram: "vouatelier", location: "Lecheria Calle Pampatar", phone: "4148394345", vName: "Andreina Marcano", vInstagram: "morenaruffiantonieta", vRole: "COSTURERA", vPhone: "4128687535" },
  { sheet: "ANZOATEGUI", name: "Cotton Peritas", type: "TALLER", instagram: "cottonperitas", location: "Av Río conjunto residencial las gaviotas", phone: "4129443941", vName: "Nataly Vasquez", vInstagram: "natalymilagvb", vRole: "COSTURERA", vPhone: "4147948288" },
  { sheet: "ANZOATEGUI", name: "Ani Creaciones", type: "TALLER", instagram: "anicreaciones", location: "", phone: "4128763316", vName: "Gabriela Valera", vInstagram: "gabrielavalera_", vRole: "VOLUNTARIA", vPhone: "" },
  { sheet: "ANZOATEGUI", name: "III KAWAY", type: "TALLER", instagram: "lllkaway", location: "BOYACA IV BARCELONA", phone: "4125759450", vName: "Daniela Liendo", vInstagram: "cozy_lenceria", vRole: "COSTURERA", vPhone: "4248505902" },
  { sheet: "ANZOATEGUI", name: "Cocuyo Kids", type: "TALLER", instagram: "cocuyokids ccyuniformes", location: "Casco Central de Lecheria", phone: "4145836011", vName: "Maria Fuentes", vInstagram: "galustoore", vRole: "COSTURERA", vPhone: "4123530443" },
  { sheet: "ANZOATEGUI", name: "Eliery Guarepe Atelier", type: "TALLER", instagram: "moradisimaa", location: "El Tigre", phone: "4248007990", vName: "Ana Malave", vInstagram: "anamalav", vRole: "COSTURERA", vPhone: "4248916289" },
  { sheet: "ANZOATEGUI", name: "Alky Moradisima", type: "TALLER", instagram: "", location: "", phone: "", vName: "Anabel Peña", vInstagram: "anabelcpl", vRole: "VOLUNTARIA", vPhone: "4243329249" },
  { sheet: "ANZOATEGUI", name: "", type: "", instagram: "", location: "", phone: "", vName: "Yurina Coronado", vInstagram: "yurinacoronado", vRole: "VOLUNTARIA", vPhone: "4149956687" },
  // MERIDAA
  { sheet: "MERIDAA", name: "Mariely Costura Pro", type: "ACADEMIA", instagram: "Marielycosturapro", location: "", phone: "", vName: "Zara Guillèn", vInstagram: "zaracomolatienda", vRole: "PATRONISTA DIGITAL", vPhone: "4125490800" },
  // MERIDAA volunteers (same as Caracas - handled by dedup)
];

// ── Parse ──

const workshopsMap = new Map<string, WorkshopRow>();
const volunteers: VolunteerRow[] = [];

for (const row of RAW_DATA) {
  if (row.name) {
    const key = row.name.trim().toLowerCase();
    if (!workshopsMap.has(key)) {
      workshopsMap.set(key, {
        name: row.name.trim(),
        type: row.type === "ACADEMIA" ? "ACADEMIA" : "TALLER",
        instagram: row.instagram.trim(),
        location: row.location.trim(),
        phone: cleanPhone(row.phone),
        state: STATE_MAP[row.sheet] ?? "",
        city: extractCity(row.location),
      });
    }
  }
  if (row.vName) {
    volunteers.push({
      name: row.vName.trim(),
      instagram: row.vInstagram.trim(),
      role: row.vRole.trim(),
      phone: cleanPhone(row.vPhone),
      workshopName: row.name.trim(),
    });
  }
}

const workshops = Array.from(workshopsMap.values());

// ── Main ──

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("Missing env vars. Run with: node --env-file=.env scripts/import-talleres.ts");
    process.exit(1);
  }

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Check existing slugs
  const existingSlugs = new Set<string>();
  const { data: existingWorkshops } = await admin.from("allies").select("slug");
  if (existingWorkshops) {
    for (const w of existingWorkshops) existingSlugs.add(w.slug);
  }

  function makeUniqueSlug(name: string): string {
    let base = generateSlug(name);
    let slug = base;
    let c = 1;
    while (existingSlugs.has(slug)) {
      slug = `${base}-${c}`;
      c++;
    }
    existingSlugs.add(slug);
    return slug;
  }

  // ── Insert workshops ──
  const workshopIds = new Map<string, string>();
  console.log(`\nInsertando ${workshops.length} talleres...\n`);

  for (const w of workshops) {
    const slug = makeUniqueSlug(w.name);
    const { data, error } = await admin
      .from("allies")
      .insert({
        name: w.name,
        slug,
        state: w.state,
        city: w.city || null,
        public_location: w.location || null,
        phone: w.phone || null,
        whatsapp: w.phone || null,
        instagram: w.instagram || null,
        what_they_do: w.type,
        status: "activo",
        public_name_allowed: true,
        public_location_allowed: true,
        public_instagram_allowed: true,
        public_whatsapp_allowed: true,
      })
      .select("id")
      .single();

    if (error) {
      console.error(`  ERROR: ${w.name} → ${error.message}`);
    } else {
      workshopIds.set(w.name.trim().toLowerCase(), data.id);
      console.log(`  OK: ${w.name} (${slug})`);
    }
  }

  // ── Insert volunteers (deduplicate by phone) ──
  const seenPhones = new Set<string>();
  let insertedVolunteers = 0;

  console.log(`\nInsertando voluntarios (${volunteers.length} total, deduplicando por teléfono)...\n`);

  for (const v of volunteers) {
    if (!v.phone) {
      // Insert anyway if has name but no phone (rare)
      if (!v.name) continue;
    } else if (seenPhones.has(v.phone)) {
      continue; // duplicate by phone
    }
    if (v.phone) seenPhones.add(v.phone);

    const workshopId = v.workshopName
      ? workshopIds.get(v.workshopName.trim().toLowerCase()) ?? null
      : null;

    const { error } = await admin.from("ally_volunteer_assignments").insert({
      ally_id: workshopId,
      name: v.name,
      role: v.role || null,
      phone: v.phone || null,
      instagram: v.instagram || null,
    });

    if (error) {
      console.error(`  ERROR volunteer: ${v.name} → ${error.message}`);
    } else {
      insertedVolunteers++;
      console.log(`  OK: ${v.name} (${v.role}) ${v.workshopName ? "→ " + v.workshopName : "→ sin taller"}`);
    }
  }

  console.log(`\n─── Resumen ───`);
  console.log(`Talleres insertados: ${workshopIds.size}/${workshops.length}`);
  console.log(`Voluntarios insertados: ${insertedVolunteers} (deduplicados por teléfono)`);
}

main().catch(console.error);
