export interface Province {
  name: string;
  slug: string;
  description: string;
  population: number;
  capital: string;
  overview?: string;
  keyIndustries?: string[];
  majorDepartments?: string[];
  tenderInsights?: string;
  successTip?: string;
  statistics?: {
    population: string;
    gdp: string;
    tenders: string;
    majorCities?: string[];
  };
}

export const provinces: Province[] = [
  {
    name: "Gauteng",
    slug: "gauteng",
    description: "Economic hub of South Africa with Johannesburg and Pretoria",
    population: 15878130,
    capital: "Johannesburg"
  },
  {
    name: "Western Cape",
    slug: "western-cape",
    description: "Coastal province known for Cape Town and wine regions",
    population: 7197665,
    capital: "Cape Town"
  },
  {
    name: "KwaZulu-Natal",
    slug: "kwazulu-natal",
    description: "Coastal province with Durban and traditional Zulu heritage",
    population: 11521896,
    capital: "Pietermaritzburg"
  },
  {
    name: "Eastern Cape",
    slug: "eastern-cape",
    description: "Known for its wildlife reserves and coastal beauty",
    population: 6740606,
    capital: "Bhisho"
  },
  {
    name: "Limpopo",
    slug: "limpopo",
    description: "Northern province rich in minerals and wildlife",
    population: 5974857,
    capital: "Polokwane"
  },
  {
    name: "Mpumalanga",
    slug: "mpumalanga",
    description: "Home to the Kruger National Park and mining activities",
    population: 4738651,
    capital: "Mbombela"
  },
  {
    name: "North West",
    slug: "north-west",
    description: "Known for its platinum mines and sunflower fields",
    population: 4067939,
    capital: "Mahikeng"
  },
  {
    name: "Free State",
    slug: "free-state",
    description: "Agricultural heartland of South Africa",
    population: 2898487,
    capital: "Bloemfontein"
  },
  {
    name: "Northern Cape",
    slug: "northern-cape",
    description: "Largest province known for its deserts and minerals",
    population: 1276319,
    capital: "Kimberley"
  }
];

export function getProvinceBySlug(slug: string): Province | undefined {
  return provinces.find(province => province.slug === slug);
}

export function getAllProvinceSlugs(): string[] {
  return provinces.map(province => province.slug);
}