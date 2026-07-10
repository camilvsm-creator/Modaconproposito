import type {
  PromodaDashboardStats,
  ActividadReciente,
  NecesidadUrgente,
  ProduccionAdmin,
  VoluntarioAdmin,
  MaterialConsolidado,
  EntregaAdmin,
  Aliado,
  Anuncio,
  ProgresoProducto,
  NecesidadCritica,
} from "@/lib/types";

// ---- Dashboard ----

export const mockDashboardStats: PromodaDashboardStats = {
  totalTalleres: 24,
  talleresActivos: 18,
  totalVoluntarios: 47,
  necesidadesAbiertas: 12,
  produccionesActivas: 9,
  entregasRealizadas: 34,
};

// ---- Actividad reciente ----

export const mockActividadReciente: ActividadReciente[] = [
  { id: "a1", tipo: "nuevo_taller", taller: "Costuras Caracas", descripcion: "Nuevo taller registrado en la plataforma", fecha: "2026-07-08 09:30" },
  { id: "a2", tipo: "necesidad_publicada", taller: "Sinors Atelier", descripcion: "Publicó necesidad: Tela blanca para sábanas", fecha: "2026-07-08 08:15" },
  { id: "a3", tipo: "produccion_finalizada", taller: "Tejidos Maracaibo", descripcion: "Finalizó producción de 50 toallas", fecha: "2026-07-07 17:45" },
  { id: "a4", tipo: "nuevo_voluntario", taller: "Sinors Atelier", descripcion: "Nuevo voluntario asignado: María González", fecha: "2026-07-07 15:20" },
  { id: "a5", tipo: "material_recibido", taller: "Costuras Caracas", descripcion: "Recibieron 100 metros de tela blanca", fecha: "2026-07-07 14:00" },
  { id: "a6", tipo: "nuevo_taller", taller: "Modistería Valencia", descripcion: "Nuevo taller registrado en la plataforma", fecha: "2026-07-06 11:10" },
  { id: "a7", tipo: "necesidad_publicada", taller: "Tejidos Maracaibo", descripcion: "Publicó necesidad: Hilo de coser industrial", fecha: "2026-07-06 10:30" },
  { id: "a8", tipo: "produccion_finalizada", taller: "Sinors Atelier", descripcion: "Finalizó producción de 30 uniformes", fecha: "2026-07-05 16:00" },
];

// ---- Necesidades urgentes ----

export const mockNecesidadesUrgentes: NecesidadUrgente[] = [
  { id: "nu1", taller: "Sinors Atelier", tallerId: "w1", categoria: "Materiales", descripcion: "Tela blanca para producción de sábanas", fechaPublicacion: "2026-07-05", prioridad: "alta" },
  { id: "nu2", taller: "Costuras Caracas", tallerId: "w2", categoria: "Materiales", descripcion: "Elástico para ropa interior", fechaPublicacion: "2026-07-04", prioridad: "alta" },
  { id: "nu3", taller: "Tejidos Maracaibo", tallerId: "w3", categoria: "Voluntarios", descripcion: "Se necesitan 2 costureras adicionales", fechaPublicacion: "2026-07-06", prioridad: "alta" },
  { id: "nu4", taller: "Modistería Valencia", tallerId: "w4", categoria: "Logística", descripcion: "Transporte para entrega de pedidos", fechaPublicacion: "2026-07-03", prioridad: "media" },
  { id: "nu5", taller: "Sinors Atelier", tallerId: "w1", categoria: "Materiales", descripcion: "Hilo blanco cono industrial", fechaPublicacion: "2026-07-02", prioridad: "alta" },
];

// ---- Talleres extendidos ----

export const mockTalleresExtendidos = [
  { id: "w1", name: "Sinors Atelier", responsibleName: "María Contreras", status: "activo", especialidades: "Costura, Corte, Bordado", produccionesActivas: 3, voluntariosAsignados: 5, necesidadesAbiertas: 2, ciudad: "Caracas", estado: "Distrito Capital" },
  { id: "w2", name: "Costuras Caracas", responsibleName: "Carlos Pérez", status: "activo", especialidades: "Confección, Diseño", produccionesActivas: 2, voluntariosAsignados: 3, necesidadesAbiertas: 1, ciudad: "Caracas", estado: "Distrito Capital" },
  { id: "w3", name: "Tejidos Maracaibo", responsibleName: "Ana Rodríguez", status: "activo", especialidades: "Tejido, Bordado", produccionesActivas: 1, voluntariosAsignados: 4, necesidadesAbiertas: 1, ciudad: "Maracaibo", estado: "Zulia" },
  { id: "w4", name: "Modistería Valencia", responsibleName: "Luis Mendoza", status: "activo", especialidades: "Modistería, Arreglos", produccionesActivas: 2, voluntariosAsignados: 2, necesidadesAbiertas: 1, ciudad: "Valencia", estado: "Carabobo" },
  { id: "w5", name: "Confecciones Barquisimeto", responsibleName: "Diana Torres", status: "pendiente", especialidades: "Costura industrial", produccionesActivas: 0, voluntariosAsignados: 0, necesidadesAbiertas: 0, ciudad: "Barquisimeto", estado: "Lara" },
  { id: "w6", name: "Taller de Costura El Tigre", responsibleName: "José Ramírez", status: "pausado", especialidades: "Corte, Confección", produccionesActivas: 1, voluntariosAsignados: 1, necesidadesAbiertas: 1, ciudad: "El Tigre", estado: "Anzoátegui" },
  { id: "w7", name: "Costura Creativa Maturín", responsibleName: "Sofía Hernández", status: "aprobado_pendiente_activacion", especialidades: "Diseño, Bordado", produccionesActivas: 0, voluntariosAsignados: 0, necesidadesAbiertas: 0, ciudad: "Maturín", estado: "Monagas" },
  { id: "w8", name: "Tejidos y Puntadas", responsibleName: "Pedro Gil", status: "rechazado", especialidades: "Tejido", produccionesActivas: 0, voluntariosAsignados: 0, necesidadesAbiertas: 0, ciudad: "Caracas", estado: "Distrito Capital" },
];

// ---- Producciones ----

export const mockProduccionesAdmin: ProduccionAdmin[] = [
  { id: "p1", producto: "Sábanas individuales", taller: "Sinors Atelier", tallerId: "w1", cantidadSolicitada: 100, cantidadProducida: 45, fechaLimite: "2026-08-15", estado: "en_produccion" },
  { id: "p2", producto: "Ropa interior", taller: "Costuras Caracas", tallerId: "w2", cantidadSolicitada: 200, cantidadProducida: 80, fechaLimite: "2026-09-01", estado: "en_produccion" },
  { id: "p3", producto: "Toallas de baño", taller: "Tejidos Maracaibo", tallerId: "w3", cantidadSolicitada: 50, cantidadProducida: 50, fechaLimite: "2026-07-20", estado: "finalizado" },
  { id: "p4", producto: "Mascarillas", taller: "Sinors Atelier", tallerId: "w1", cantidadSolicitada: 500, cantidadProducida: 500, fechaLimite: "2026-06-30", estado: "entregado" },
  { id: "p5", producto: "Uniformes escolares", taller: "Modistería Valencia", tallerId: "w4", cantidadSolicitada: 60, cantidadProducida: 20, fechaLimite: "2026-09-15", estado: "en_produccion" },
  { id: "p6", producto: "Sábanas matrimoniales", taller: "Costuras Caracas", tallerId: "w2", cantidadSolicitada: 30, cantidadProducida: 0, fechaLimite: "2026-08-30", estado: "pendiente" },
  { id: "p7", producto: "Paños de cocina", taller: "Modistería Valencia", tallerId: "w4", cantidadSolicitada: 100, cantidadProducida: 40, fechaLimite: "2026-08-01", estado: "en_produccion" },
  { id: "p8", producto: "Toallas de mano", taller: "Tejidos Maracaibo", tallerId: "w3", cantidadSolicitada: 80, cantidadProducida: 80, fechaLimite: "2026-07-10", estado: "finalizado" },
];

export const mockProductos = ["Sábanas individuales", "Ropa interior", "Toallas de baño", "Mascarillas", "Uniformes escolares", "Sábanas matrimoniales", "Paños de cocina", "Toallas de mano"];
export const mockTalleresNombres = ["Sinors Atelier", "Costuras Caracas", "Tejidos Maracaibo", "Modistería Valencia"];
export const mockEstadosProduccion = ["pendiente", "en_produccion", "finalizado", "entregado"] as const;

// ---- Voluntarios ----

export const mockVoluntariosAdmin: VoluntarioAdmin[] = [
  { id: "v1", nombre: "María González", especialidad: "Costurera", ciudad: "Caracas", disponibilidad: "20h/semana", tallerAsignado: "Sinors Atelier", tallerId: "w1", estado: "confirmado" },
  { id: "v2", nombre: "Carlos Sánchez", especialidad: "Corte", ciudad: "Caracas", disponibilidad: "15h/semana", tallerAsignado: "Costuras Caracas", tallerId: "w2", estado: "confirmado" },
  { id: "v3", nombre: "Ana Lucía Pérez", especialidad: "Bordadora", ciudad: "Maracaibo", disponibilidad: "25h/semana", tallerAsignado: "Tejidos Maracaibo", tallerId: "w3", estado: "confirmado" },
  { id: "v4", nombre: "Luis Fernández", especialidad: "Diseñador textil", ciudad: "Valencia", disponibilidad: "10h/semana", tallerAsignado: "Modistería Valencia", tallerId: "w4", estado: "confirmado" },
  { id: "v5", nombre: "Rosa Medina", especialidad: "Costurera", ciudad: "Caracas", disponibilidad: "30h/semana", tallerAsignado: "Sinors Atelier", tallerId: "w1", estado: "confirmado" },
  { id: "v6", nombre: "Pedro Rojas", especialidad: "Logística", ciudad: "Caracas", disponibilidad: "variable", tallerAsignado: "Costuras Caracas", tallerId: "w2", estado: "pendiente" },
  { id: "v7", nombre: "Diana Torres", especialidad: "Costurera", ciudad: "Barquisimeto", disponibilidad: "20h/semana", tallerAsignado: null, tallerId: null, estado: "pendiente" },
  { id: "v8", nombre: "José Martínez", especialidad: "Corte y confección", ciudad: "Maracaibo", disponibilidad: "15h/semana", tallerAsignado: null, tallerId: null, estado: "pendiente" },
  { id: "v9", nombre: "Sofía Ramírez", especialidad: "Tejedora", ciudad: "Valencia", disponibilidad: "10h/semana", tallerAsignado: "Tejidos Maracaibo", tallerId: "w3", estado: "finalizado" },
  { id: "v10", nombre: "Andrea López", especialidad: "Costurera", ciudad: "Caracas", disponibilidad: "25h/semana", tallerAsignado: "Sinors Atelier", tallerId: "w1", estado: "confirmado" },
];

export const mockEspecialidades = ["Costurera", "Corte", "Bordadora", "Diseñador textil", "Logística", "Corte y confección", "Tejedora", "Patronista"];

// ---- Materiales consolidados ----

export const mockMaterialesConsolidados: MaterialConsolidado[] = [
  { id: "m1", nombre: "Tela blanca", talleresSolicitantes: 5, cantidadRequerida: 250, unidad: "metros" },
  { id: "m2", nombre: "Hilo blanco", talleresSolicitantes: 3, cantidadRequerida: 38, unidad: "conos" },
  { id: "m3", nombre: "Elástico", talleresSolicitantes: 4, cantidadRequerida: 120, unidad: "metros" },
  { id: "m4", nombre: "Cierres", talleresSolicitantes: 2, cantidadRequerida: 300, unidad: "unidades" },
  { id: "m5", nombre: "Tela de algodón", talleresSolicitantes: 3, cantidadRequerida: 180, unidad: "metros" },
  { id: "m6", nombre: "Hilo de colores", talleresSolicitantes: 2, cantidadRequerida: 15, unidad: "conos" },
  { id: "m7", nombre: "Botones", talleresSolicitantes: 2, cantidadRequerida: 500, unidad: "unidades" },
  { id: "m8", nombre: "Tela para forro", talleresSolicitantes: 1, cantidadRequerida: 50, unidad: "metros" },
];

// ---- Entregas ----

export const mockEntregasAdmin: EntregaAdmin[] = [
  { id: "e1", fecha: "2026-07-08", taller: "Sinors Atelier", tallerId: "w1", producto: "Mascarillas", cantidad: 500, destino: "Hospital Universitario de Caracas", estado: "entregado" },
  { id: "e2", fecha: "2026-07-07", taller: "Tejidos Maracaibo", tallerId: "w3", producto: "Toallas de baño", cantidad: 50, destino: "Albergue San José", estado: "entregado" },
  { id: "e3", fecha: "2026-07-06", taller: "Costuras Caracas", tallerId: "w2", producto: "Ropa interior", cantidad: 80, destino: "Centro de acopio Sur", estado: "en_ruta" },
  { id: "e4", fecha: "2026-07-05", taller: "Tejidos Maracaibo", tallerId: "w3", producto: "Toallas de mano", cantidad: 80, destino: "Albergue San José", estado: "pendiente" },
  { id: "e5", fecha: "2026-07-04", taller: "Sinors Atelier", tallerId: "w1", producto: "Sábanas individuales", cantidad: 20, destino: "Refugio El Valle", estado: "en_ruta" },
];

export const mockDestinos = ["Hospital Universitario de Caracas", "Albergue San José", "Centro de acopio Sur", "Refugio El Valle", "Ambulatorio popular El Silencio"];

// ---- Aliados ----

export const mockAliados: Aliado[] = [
  { id: "al1", nombre: "Textiles Venezolanos C.A.", tipo: "empresa", tipoAyuda: "Donación de telas e insumos", historialColaboraciones: 8, talleresApoyados: 5, ultimaColaboracion: "2026-07-01" },
  { id: "al2", nombre: "Fundación Ayuda Solidaria", tipo: "ong", tipoAyuda: "Financiamiento de materiales", historialColaboraciones: 12, talleresApoyados: 7, ultimaColaboracion: "2026-06-28" },
  { id: "al3", nombre: "Gobernación de Carabobo", tipo: "gobierno", tipoAyuda: "Logística y transporte", historialColaboraciones: 4, talleresApoyados: 3, ultimaColaboracion: "2026-06-15" },
  { id: "al4", nombre: "Hilos del Sur", tipo: "empresa", tipoAyuda: "Donación de hilos y accesorios", historialColaboraciones: 6, talleresApoyados: 4, ultimaColaboracion: "2026-07-05" },
  { id: "al5", nombre: "Cáritas Venezuela", tipo: "ong", tipoAyuda: "Distribución de productos terminados", historialColaboraciones: 15, talleresApoyados: 8, ultimaColaboracion: "2026-07-02" },
  { id: "al6", nombre: "Juan Pérez (donante particular)", tipo: "particular", tipoAyuda: "Donación de máquinas de coser", historialColaboraciones: 2, talleresApoyados: 2, ultimaColaboracion: "2026-06-20" },
];

// ---- Anuncios/Mensajes ----

export const mockAnuncios: Anuncio[] = [
  { id: "an1", titulo: "Nueva campaña de sábanas", contenido: "Iniciamos campaña para producir 500 sábanas. Los talleres interesados confirmar disponibilidad.", destinatarios: "todos", fecha: "2026-07-07", leidos: 12, total: 18 },
  { id: "an2", titulo: "Recordatorio: reporte semanal", contenido: "Favor enviar su reporte de producción antes del viernes.", destinatarios: "todos", fecha: "2026-07-06", leidos: 15, total: 18 },
  { id: "an3", titulo: "Material disponible", contenido: "Tenemos tela blanca disponible para retirar en el centro de acopio.", destinatarios: "taller_especifico", tallerEspecifico: "Sinors Atelier", fecha: "2026-07-05", leidos: 1, total: 1 },
];

// ---- Vista Nacional ----

export const mockProgresoProductos: ProgresoProducto[] = [
  { producto: "Ropa interior", porcentaje: 65, talleresActivos: 4, totalRequerido: 500, totalProducido: 325 },
  { producto: "Sábanas", porcentaje: 42, talleresActivos: 3, totalRequerido: 230, totalProducido: 97 },
  { producto: "Toallas", porcentaje: 82, talleresActivos: 2, totalRequerido: 210, totalProducido: 172 },
  { producto: "Paños", porcentaje: 30, talleresActivos: 2, totalRequerido: 200, totalProducido: 60 },
  { producto: "Mascarillas", porcentaje: 100, talleresActivos: 3, totalRequerido: 1500, totalProducido: 1500 },
  { producto: "Uniformes", porcentaje: 25, talleresActivos: 2, totalRequerido: 120, totalProducido: 30 },
];

export const mockNecesidadesCriticas: NecesidadCritica[] = [
  { recurso: "Tela blanca", tipo: "material", talleresQueLoNecesitan: 5, cantidadRequerida: "250 metros" },
  { recurso: "Elástico", tipo: "material", talleresQueLoNecesitan: 4, cantidadRequerida: "120 metros" },
  { recurso: "Hilo blanco", tipo: "material", talleresQueLoNecesitan: 3, cantidadRequerida: "38 conos" },
  { recurso: "Voluntarios de costura", tipo: "voluntario", talleresQueLoNecesitan: 6, cantidadRequerida: "8 personas" },
];

// ---- Configuración ----

export const mockCategoriasNecesidades = ["Materiales", "Voluntarios", "Logística", "Otro"];

export const mockTiposProducto = [
  "Sábanas individuales",
  "Sábanas matrimoniales",
  "Ropa interior",
  "Toallas de baño",
  "Toallas de mano",
  "Paños de cocina",
  "Mascarillas",
  "Uniformes escolares",
  "Batas médicas",
  "Gorros quirúrgicos",
];

export const mockEstadosTaller = [
  "pendiente",
  "approved_pending_activation",
  "activo",
  "pausado",
  "rechazado",
];

export const mockEstadosNecesidad = ["pendiente", "publicada", "cubierta", "cerrada"];
