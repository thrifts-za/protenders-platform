/**
 * Province Data for Landing Pages
 * SEO-optimized content for each South African province
 */

export interface ProvinceData {
  id: string;
  slug: string;
  name: string;
  fullName: string;
  capital: string;
  description: string;
  overview: string;
  majorDepartments: string[];
  keyIndustries: string[];
  statistics: {
    population: string;
    gdpContribution: string;
    majorCities: string[];
  };
  tenderInsights: string;
  successTip: string;
}

export const provinces: ProvinceData[] = [
  {
    id: "gauteng",
    slug: "gauteng",
    name: "Gauteng",
    fullName: "Gauteng Province",
    capital: "Johannesburg",
    description:
      "Find government tenders and procurement opportunities in Gauteng, South Africa's economic hub. Search active Gauteng tenders from provincial departments, municipalities, and state-owned enterprises.",
    overview:
      "Gauteng is South Africa's economic powerhouse, contributing approximately 34% to the national GDP. As the smallest province by land area but the most populous, Gauteng hosts the country's financial center and numerous government departments. The province offers the highest volume of tender opportunities across all sectors, from infrastructure and construction to IT services and consulting.",
    majorDepartments: [
      "Gauteng Department of Health",
      "Gauteng Department of Education",
      "Gauteng Department of Infrastructure Development",
      "Gauteng Department of Roads and Transport",
      "City of Johannesburg Metropolitan Municipality",
      "City of Tshwane Metropolitan Municipality",
      "City of Ekurhuleni Metropolitan Municipality",
      "Gauteng Provincial Treasury",
      "Gauteng Department of Social Development",
    ],
    keyIndustries: [
      "Information Technology",
      "Construction & Infrastructure",
      "Healthcare Services",
      "Professional Services & Consulting",
      "Security Services",
      "Facilities Management",
      "Transport & Logistics",
      "Education Services",
    ],
    statistics: {
      population: "15.8 million (2021)",
      gdpContribution: "34% of South African GDP",
      majorCities: ["Johannesburg", "Pretoria", "Ekurhuleni", "Midrand", "Sandton"],
    },
    tenderInsights:
      "Gauteng publishes the highest number of tenders in South Africa, with particular focus on infrastructure development, healthcare expansion, and digital transformation. The province's three metropolitan municipalities (Johannesburg, Tshwane, Ekurhuleni) each run independent procurement processes. Construction tenders often require CIDB grading, while IT tenders may require specific certifications. B-BBEE compliance is strongly emphasized in scoring.",
    successTip:
      "Due to high competition in Gauteng, focus on niche specializations and ensure your company profile highlights relevant experience with similar government projects. Metro tenders typically have shorter response times than provincial tenders.",
  },
  {
    id: "western-cape",
    slug: "western-cape",
    name: "Western Cape",
    fullName: "Western Cape Province",
    capital: "Cape Town",
    description:
      "Search government tenders in Western Cape, South Africa's tourism and agricultural hub. Find active tenders from City of Cape Town, provincial departments, and Western Cape municipalities.",
    overview:
      "The Western Cape is South Africa's second-largest provincial economy, contributing approximately 14% to the national GDP. Known for its advanced infrastructure, tourism industry, and agricultural sector, the province is a leader in good governance and service delivery. The Western Cape offers substantial tender opportunities in tourism infrastructure, renewable energy, water management, and digital services.",
    majorDepartments: [
      "Western Cape Provincial Treasury",
      "Western Cape Department of Health",
      "Western Cape Department of Education",
      "Western Cape Department of Transport and Public Works",
      "City of Cape Town Metropolitan Municipality",
      "Western Cape Department of Agriculture",
      "Western Cape Department of Environmental Affairs",
      "Department of the Premier",
    ],
    keyIndustries: [
      "Tourism & Hospitality",
      "Agriculture & Agro-processing",
      "Renewable Energy",
      "Information Technology",
      "Construction & Property Development",
      "Healthcare Services",
      "Water Management & Infrastructure",
      "Creative Industries",
    ],
    statistics: {
      population: "7.0 million (2021)",
      gdpContribution: "14% of South African GDP",
      majorCities: ["Cape Town", "Stellenbosch", "Paarl", "George", "Worcester"],
    },
    tenderInsights:
      "The Western Cape is known for transparent procurement processes and strong emphasis on value for money. The province actively publishes tenders on the official e-Tender portal. Tourism and renewable energy sectors see consistent tender activity. The City of Cape Town runs one of the most sophisticated municipal procurement systems in Africa. Environmental sustainability is often a key evaluation criterion.",
    successTip:
      "Western Cape tenders often emphasize innovation and sustainability. Highlight green credentials, energy-efficient solutions, and previous experience with sustainable projects. Response times are strictly enforced.",
  },
  {
    id: "kwazulu-natal",
    slug: "kwazulu-natal",
    name: "KwaZulu-Natal",
    fullName: "KwaZulu-Natal Province",
    capital: "Pietermaritzburg",
    description:
      "Find KwaZulu-Natal government tenders and procurement opportunities. Search active tenders from eThekwini Municipality (Durban), provincial departments, and KZN government entities.",
    overview:
      "KwaZulu-Natal is South Africa's third-largest provincial economy, contributing approximately 16% to national GDP. The province is home to Africa's busiest port (Durban) and has a diverse economy spanning manufacturing, agriculture, and tourism. KZN offers significant tender opportunities in logistics, port infrastructure, rural development, and healthcare services.",
    majorDepartments: [
      "KZN Department of Health",
      "KZN Department of Education",
      "KZN Department of Transport",
      "KZN Department of Public Works",
      "eThekwini Metropolitan Municipality (Durban)",
      "KZN Department of Agriculture and Rural Development",
      "KZN Provincial Treasury",
      "KZN Department of Cooperative Governance",
    ],
    keyIndustries: [
      "Logistics & Transportation",
      "Manufacturing",
      "Agriculture",
      "Tourism & Hospitality",
      "Construction & Infrastructure",
      "Healthcare Services",
      "Port Operations",
      "Retail & Distribution",
    ],
    statistics: {
      population: "11.5 million (2021)",
      gdpContribution: "16% of South African GDP",
      majorCities: ["Durban", "Pietermaritzburg", "Newcastle", "Richards Bay", "Ladysmith"],
    },
    tenderInsights:
      "KwaZulu-Natal's tender landscape is heavily influenced by Durban's port operations and the province's manufacturing sector. Infrastructure development, particularly road construction and rural electrification, features prominently. eThekwini Municipality is one of the largest tender issuers. Health and education departments have substantial budgets for infrastructure and services.",
    successTip:
      "For logistics and transport tenders, emphasize experience with port operations or supply chain management. Rural development tenders often have specific community upliftment requirements. Local content and job creation are heavily weighted.",
  },
  {
    id: "eastern-cape",
    slug: "eastern-cape",
    name: "Eastern Cape",
    fullName: "Eastern Cape Province",
    capital: "Bhisho",
    description:
      "Search Eastern Cape government tenders and procurement opportunities. Find active tenders from provincial departments, Buffalo City, Nelson Mandela Bay, and EC municipalities.",
    overview:
      "The Eastern Cape contributes approximately 8% to South Africa's GDP. Known for its automotive industry (Port Elizabeth/Gqeberha), rural communities, and growing renewable energy sector, the province offers diverse tender opportunities. Infrastructure development and rural upliftment are key focus areas, with substantial budgets allocated to roads, schools, and healthcare facilities.",
    majorDepartments: [
      "Eastern Cape Department of Health",
      "Eastern Cape Department of Education",
      "Eastern Cape Department of Roads and Public Works",
      "Eastern Cape Provincial Treasury",
      "Buffalo City Metropolitan Municipality",
      "Nelson Mandela Bay Metropolitan Municipality",
      "Eastern Cape Department of Rural Development",
      "Eastern Cape Department of Transport",
    ],
    keyIndustries: [
      "Automotive Manufacturing",
      "Agriculture & Livestock",
      "Construction & Infrastructure",
      "Renewable Energy (Wind)",
      "Tourism",
      "Forestry",
      "Healthcare Services",
      "Education Services",
    ],
    statistics: {
      population: "6.7 million (2021)",
      gdpContribution: "8% of South African GDP",
      majorCities: ["Gqeberha (Port Elizabeth)", "East London", "Mthatha", "Bhisho", "Graaff-Reinet"],
    },
    tenderInsights:
      "Eastern Cape tenders often focus on rural infrastructure development, school building programs, and healthcare facility upgrades. The automotive industry around Gqeberha generates specialized tenders. Wind energy projects have increased tender activity in renewable energy. Road construction and maintenance is a consistent tender category due to the province's geographic spread.",
    successTip:
      "For infrastructure tenders, understanding rural context and logistics is crucial. Local economic development (LED) and community participation are important evaluation criteria. SMME development is emphasized in most tenders.",
  },
  {
    id: "limpopo",
    slug: "limpopo",
    name: "Limpopo",
    fullName: "Limpopo Province",
    capital: "Polokwane",
    description:
      "Find Limpopo government tenders and procurement opportunities. Search active tenders from provincial departments, municipalities, and Limpopo government entities.",
    overview:
      "Limpopo contributes approximately 7% to South Africa's GDP. Known for mining, agriculture, and tourism (including Kruger National Park), the province has significant infrastructure development needs. Limpopo offers tender opportunities in rural development, mining support services, agriculture, and cross-border trade facilitation.",
    majorDepartments: [
      "Limpopo Department of Health",
      "Limpopo Department of Education",
      "Limpopo Department of Public Works",
      "Limpopo Provincial Treasury",
      "Limpopo Department of Agriculture",
      "Limpopo Department of Transport",
      "Polokwane Municipality",
      "Limpopo Department of Economic Development",
    ],
    keyIndustries: [
      "Mining & Mining Services",
      "Agriculture (Citrus, Vegetables)",
      "Tourism & Game Reserves",
      "Construction & Infrastructure",
      "Healthcare Services",
      "Education Services",
      "Forestry",
      "Cross-Border Trade",
    ],
    statistics: {
      population: "5.9 million (2021)",
      gdpContribution: "7% of South African GDP",
      majorCities: ["Polokwane", "Thohoyandou", "Tzaneen", "Lephalale", "Musina"],
    },
    tenderInsights:
      "Limpopo tenders frequently involve rural infrastructure, school facilities, and healthcare clinic construction or renovation. Mining support services see regular tender activity. Agricultural services and irrigation projects are common. The province has substantial road maintenance budgets. Border post infrastructure near Zimbabwe and Botswana generates specialized tenders.",
    successTip:
      "Experience with rural projects and remote site management is valuable. Many tenders emphasize local labor and SMME development. Understanding the province's mining and agricultural context helps in proposal development.",
  },
  {
    id: "mpumalanga",
    slug: "mpumalanga",
    name: "Mpumalanga",
    fullName: "Mpumalanga Province",
    capital: "Mbombela (Nelspruit)",
    description:
      "Search Mpumalanga government tenders and procurement opportunities. Find active tenders from provincial departments, municipalities, and Mpumalanga government entities.",
    overview:
      "Mpumalanga contributes approximately 8% to South Africa's GDP. The province is crucial for energy production (coal), forestry, and tourism (including Kruger National Park). Tender opportunities span mining support, energy infrastructure, tourism development, and agricultural services. Mpumalanga's strategic location bordering Mozambique and eSwatini also drives cross-border trade tenders.",
    majorDepartments: [
      "Mpumalanga Department of Health",
      "Mpumalanga Department of Education",
      "Mpumalanga Department of Public Works",
      "Mpumalanga Provincial Treasury",
      "Mpumalanga Department of Agriculture",
      "Mbombela (Nelspruit) Local Municipality",
      "Mpumalanga Department of Economic Development",
      "Mpumalanga Tourism Authority",
    ],
    keyIndustries: [
      "Coal Mining & Energy",
      "Forestry & Paper Production",
      "Tourism & Hospitality",
      "Agriculture (Subtropical Fruits)",
      "Construction & Infrastructure",
      "Healthcare Services",
      "Manufacturing",
      "Cross-Border Trade",
    ],
    statistics: {
      population: "4.7 million (2021)",
      gdpContribution: "8% of South African GDP",
      majorCities: ["Mbombela (Nelspruit)", "Witbank (eMalahleni)", "Secunda", "Middelburg", "Ermelo"],
    },
    tenderInsights:
      "Mpumalanga's tender landscape reflects its mining and energy focus, with tenders for power station support, coal logistics, and energy infrastructure. Forestry-related tenders are common. Tourism infrastructure around Kruger National Park generates hospitality and construction opportunities. Road maintenance is prioritized due to heavy mining vehicle traffic. Border infrastructure tenders support trade with Mozambique.",
    successTip:
      "Mining and energy sector experience is advantageous. Environmental management is increasingly important in tender evaluation. Understanding forestry regulations helps for related tenders.",
  },
  {
    id: "north-west",
    slug: "north-west",
    name: "North West",
    fullName: "North West Province",
    capital: "Mahikeng",
    description:
      "Find North West Province government tenders and procurement opportunities. Search active tenders from provincial departments, municipalities, and North West government entities.",
    overview:
      "The North West Province contributes approximately 6% to South Africa's GDP. Known for platinum mining, agriculture (maize and sunflowers), and tourism (Sun City, Pilanesberg), the province offers tender opportunities in mining support services, agricultural infrastructure, and rural development. Healthcare and education infrastructure development also feature prominently.",
    majorDepartments: [
      "North West Department of Health",
      "North West Department of Education",
      "North West Department of Public Works",
      "North West Provincial Treasury",
      "North West Department of Agriculture",
      "North West Department of Transport",
      "Rustenburg Local Municipality",
      "North West Department of Rural Development",
    ],
    keyIndustries: [
      "Platinum Mining",
      "Agriculture (Maize, Sunflowers, Livestock)",
      "Tourism & Hospitality",
      "Construction & Infrastructure",
      "Healthcare Services",
      "Mining Support Services",
      "Manufacturing",
      "Education Services",
    ],
    statistics: {
      population: "4.1 million (2021)",
      gdpContribution: "6% of South African GDP",
      majorCities: ["Mahikeng", "Rustenburg", "Potchefstroom", "Klerksdorp", "Brits"],
    },
    tenderInsights:
      "North West tenders often relate to mining areas, particularly around Rustenburg's platinum belt. Agricultural services and infrastructure see regular tender activity. Rural health clinic construction and school building programs are prioritized. Road maintenance in mining areas is a consistent tender category. Tourism infrastructure near Sun City occasionally generates opportunities.",
    successTip:
      "Mining sector knowledge is beneficial for support service tenders. Rural project experience is valuable given the province's geographic spread. Local economic development and SMME empowerment are evaluation priorities.",
  },
  {
    id: "free-state",
    slug: "free-state",
    name: "Free State",
    fullName: "Free State Province",
    capital: "Bloemfontein",
    description:
      "Search Free State government tenders and procurement opportunities. Find active tenders from provincial departments, municipalities, and Free State government entities.",
    overview:
      "The Free State contributes approximately 5% to South Africa's GDP. Known as the country's breadbasket due to extensive agricultural production, and home to gold mining in the north, the province offers tender opportunities in agricultural support services, mining, infrastructure development, and healthcare. Bloemfontein, as the judicial capital, also has government administrative infrastructure needs.",
    majorDepartments: [
      "Free State Department of Health",
      "Free State Department of Education",
      "Free State Department of Public Works",
      "Free State Provincial Treasury",
      "Free State Department of Agriculture",
      "Mangaung Metropolitan Municipality",
      "Free State Department of Police, Roads and Transport",
      "Free State Department of Cooperative Governance",
    ],
    keyIndustries: [
      "Agriculture (Maize, Wheat, Sunflowers)",
      "Gold Mining",
      "Construction & Infrastructure",
      "Healthcare Services",
      "Education Services",
      "Tourism",
      "Manufacturing (Food Processing)",
      "Logistics",
    ],
    statistics: {
      population: "2.9 million (2021)",
      gdpContribution: "5% of South African GDP",
      majorCities: ["Bloemfontein", "Welkom", "Bethlehem", "Kroonstad", "Sasolburg"],
    },
    tenderInsights:
      "Free State tenders emphasize agricultural services, irrigation systems, and rural infrastructure. Mining-related tenders in the goldfields around Welkom are common. Healthcare and education infrastructure receive substantial budgets. Road maintenance across the province's extensive agricultural areas is prioritized. Mangaung Metro has independent procurement for municipal services.",
    successTip:
      "Agricultural sector knowledge enhances competitiveness for related tenders. Understanding rural logistics is valuable given the province's agricultural spread. Mining experience helps for goldfield-related opportunities.",
  },
  {
    id: "northern-cape",
    slug: "northern-cape",
    name: "Northern Cape",
    fullName: "Northern Cape Province",
    capital: "Kimberley",
    description:
      "Find Northern Cape government tenders and procurement opportunities. Search active tenders from provincial departments, municipalities, and Northern Cape government entities.",
    overview:
      "The Northern Cape contributes approximately 2% to South Africa's GDP but is the largest province by land area. Known for diamond mining (historic Kimberley), renewable energy (solar farms), and agriculture along the Orange River, the province offers unique tender opportunities. Infrastructure development across vast distances and renewable energy projects are key focus areas.",
    majorDepartments: [
      "Northern Cape Department of Health",
      "Northern Cape Department of Education",
      "Northern Cape Department of Public Works",
      "Northern Cape Provincial Treasury",
      "Northern Cape Department of Agriculture",
      "Sol Plaatje Municipality (Kimberley)",
      "Northern Cape Department of Transport",
      "Northern Cape Department of Economic Development",
    ],
    keyIndustries: [
      "Diamond & Mineral Mining",
      "Renewable Energy (Solar)",
      "Agriculture (Grapes, Wine, Livestock)",
      "Construction & Infrastructure",
      "Tourism (Kalahari, Astronomy)",
      "Healthcare Services",
      "Education Services",
      "Telecommunications",
    ],
    statistics: {
      population: "1.3 million (2021)",
      gdpContribution: "2% of South African GDP",
      majorCities: ["Kimberley", "Upington", "Springbok", "De Aar", "Kathu"],
    },
    tenderInsights:
      "Northern Cape tenders often involve remote locations and specialized logistics. Solar energy projects generate infrastructure and services tenders. Mining support services around Kathu's iron ore mines are common. Agricultural infrastructure along the Orange River sees regular activity. Telecommunications and connectivity projects target rural areas. Road maintenance across vast distances is a priority.",
    successTip:
      "Experience with remote site management and logistics is crucial. Renewable energy credentials are valuable for solar farm tenders. Understanding of arid climate conditions helps for construction and agricultural tenders.",
  },
];

// Helper functions
export const getProvinceBySlug = (slug: string) =>
  provinces.find((province) => province.slug === slug);

export const getProvinceById = (id: string) =>
  provinces.find((province) => province.id === id);

export const getAllProvinceSlugs = () => provinces.map((province) => province.slug);

export const getAllProvinceNames = () => provinces.map((province) => province.name);
