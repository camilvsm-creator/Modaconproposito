export type InitiativeListKind = "checklist" | "donation-cards";

export type InitiativeListGroup = {
  label: string;
  items: string[];
};

export type InitiativeList = {
  title: string;
  kind?: InitiativeListKind;
  groups?: InitiativeListGroup[];
  items?: string[];
};

export type InitiativeHowToHelp = {
  icon: string;
  title: string;
  description: string;
};

export type InitiativeStep = {
  title: string;
  description: string;
};

export type InitiativeHelpType = {
  value: string;
  label: string;
};

export type InitiativeHelpForm = {
  helpTypes: InitiativeHelpType[];
};

export type InitiativeImage = {
  src: string;
  alt: string;
};

export type Initiative = {
  slug: string;
  name: string;
  tagline: string;
  emoji: string;
  description: string[];
  images: InitiativeImage[];
  lists?: InitiativeList[];
  steps?: InitiativeStep[];
  helpForm?: InitiativeHelpForm;
  howToHelp: InitiativeHowToHelp[];
  closing?: string;
  cta: { label: string; href: string };
  accent: "light" | "dark";
  active: boolean;
};

export const INITIATIVES: Initiative[] = [
  {
    slug: "adopta-una-cartuchera",
    name: "Adopta una cartuchera",
    tagline: "Tu Cartera, Mi Refugio",
    emoji: "🧵",
    description: [
      "Inspirada en una iniciativa nacida en Chile, Tu Cartera, Mi Refugio busca brindar un gesto de cuidado y dignidad a mujeres afectadas por la emergencia. A través de un bolso preparado con cariño, entregamos un kit con ropa interior nueva, productos de higiene personal, artículos de cuidado personal y una carta escrita a mano con un mensaje de apoyo.",
      "Creemos que, además de cubrir necesidades básicas, también es importante acompañar, cuidar y recordar que nadie está sola.",
    ],
    images: [
      {
        src: "/voluntariado-promoda/img-9892.webp",
        alt: "Cartucheras de la iniciativa terminadas",
      },
      {
        src: "/voluntariado-promoda/deafc734-d229-4b3a-87f3-0da81d8c089a.webp",
        alt: "Detalle de una cartuchera confeccionada",
      },
      {
        src: "/voluntariado-promoda/img-9626.webp",
        alt: "Productos textiles listos para ser distribuidos",
      },
      {
        src: "/voluntariado-promoda/img-9079.webp",
        alt: "Voluntarias sosteniendo productos textiles preparados para entregar",
      },
    ],
    lists: [
      {
        title: "¿Qué lleva la cartuchera?",
        kind: "checklist",
        items: [
          "Ropa interior nueva",
          "Maquillaje y labiales nuevos",
          "Productos de higiene personal",
          "Una carta escrita a mano",
        ],
      },
      {
        title: "¿Qué puedes donar?",
        kind: "donation-cards",
        groups: [
          {
            label: "Neceseres",
            items: [
              "Tela: Vinil espejo estampado",
              "Agujas número 14 punta de bola",
              "Cierre de chaqueta de 40cm color rosa",
            ],
          },
          {
            label: "Pantis o boxers",
            items: [
              "Sesgo elástico tamaño mediano (blanco o rosa)",
              "Elástica ancha para boxer",
              "Telas: franela pijamera, microdurazno est, microdurazno heavy",
            ],
          },
        ],
      },
    ],
    howToHelp: [
      {
        icon: "🧵",
        title: "Insumos / Materiales",
        description:
          "Telas, hilos, elásticos, cierres, agujas y todo lo necesario para la confección de los kits.",
      },
      {
        icon: "💰",
        title: "Aporte económico",
        description:
          "Tu aporte se utiliza para comprar insumos y cubrir los costos de producción de cada kit.",
      },
      {
        icon: "🤝",
        title: "Voluntariado",
        description:
          "Súmate como voluntario para la confección de los kits, la organización de insumos o la logística de entrega.",
      },
    ],
    helpForm: {
      helpTypes: [
        { value: "insumos", label: "Insumos / Materiales" },
        { value: "economica", label: "Aporte económico" },
        { value: "voluntario", label: "Voluntario en confección" },
        { value: "higiene", label: "Higiene y cuidado personal" },
        { value: "otro", label: "Otro" },
      ],
    },
    cta: { label: "Quiero ayudar", href: "#form-adopta-una-cartuchera" },
    accent: "light",
    active: true,
  },
  {
    slug: "hilos-conectados",
    name: "Hilos Conectados",
    tagline: "Tu cartera, mi refugio (Versión Niñas)",
    emoji: "🧶",
    description: [
      "Hoy esa tradición que nos unía con nuestras mejores amigas se convierte en un lazo de fuerza nacional. Nos emociona muchísimo presentarles la extensión de la iniciativa: Tu cartera, mi refugio (Versión Niñas). 💖👧",
      "Sabemos que el miedo y la incertidumbre tras el terremoto golpean con fuerza a las más pequeñas en los refugios. Por eso nace Hilos Conectados, una iniciativa para recordarles que no están solas, usando el lenguaje universal de la niñez: las friendship bracelets.",
    ],
    images: [
      {
        src: "/voluntariado-promoda/img-0106.webp",
        alt: "Voluntaria trabajando en una máquina de coser",
      },
      {
        src: "/voluntariado-promoda/img-8705.webp",
        alt: "Productos textiles terminados sobre una mesa de trabajo",
      },
      {
        src: "/voluntariado-promoda/img-9505.webp",
        alt: "Paquetes de ayuda textil preparados para entregar",
      },
    ],
    steps: [
      {
        title: "Tejemos en pares",
        description:
          "Creamos dos pulseras exactamente iguales, una para cada mitad de un mismo lazo.",
      },
      {
        title: "Tú compras una",
        description:
          "Al adquirir tu pulsera, financias el material de ambas y apoyas directamente el fondo de nuestro voluntariado en el terreno.",
      },
      {
        title: "Ella recibe la otra",
        description:
          "La pulsera gemela viaja directo al refugio con una nota que recuerda que, en algún rincón del país, alguien lleva su otra mitad y piensa en ella.",
      },
    ],
    helpForm: {
      helpTypes: [
        { value: "pulsera", label: "Adquirir mi pulsera gemela" },
        { value: "materiales", label: "Donación de materiales (hilos, cuentas)" },
        { value: "tejido", label: "Tardes de tejido" },
        { value: "otro", label: "Otro" },
      ],
    },
    howToHelp: [
      {
        icon: "🛍️",
        title: "Adquiere tu pulsera gemela",
        description: "Escríbenos un mensaje directo (DM) para comprar la tuya.",
      },
      {
        icon: "🧶",
        title: "Donación de materiales",
        description: "Hilos o cuentas de letras para tejer las pulseras.",
      },
      {
        icon: "✋",
        title: "Tardes de tejido",
        description: "Suma tus manos para tejer junto a nuestro voluntariado.",
      },
    ],
    closing:
      "Una pulsera en tu muñeca es un voluntario en el terreno y un abrazo real para una niña que hoy nos necesita. Hagamos que el hilo de la empatía sea más fuerte que cualquier réplica. 💪❤️",
    cta: { label: "Quiero ayudar", href: "#form-hilos-conectados" },
    accent: "dark",
    active: true,
  },
];

export const ACTIVE_INITIATIVES = INITIATIVES.filter((i) => i.active);
