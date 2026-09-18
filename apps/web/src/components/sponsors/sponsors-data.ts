export interface Sponsor {
  name: string;
  logo: string;
  description: string;
  linkedinUrl: string;
  websiteUrl: string;
}

export const SPONSORS: Sponsor[] = [
  {
    name: "Damacloid",
    logo: "/images/damacloid.png",
    description:
      "Damacloid is a technology and digital transformation company specialising in AI, cloud, data analytics, and custom software solutions. Combining technological expertise with innovative thinking, Damacloid enables organisations to modernise operations, address complex challenges, and accelerate sustainable growth.",
    linkedinUrl: "https:linkedin.com/company/damacloid-technologies-pvt-ltd",
    websiteUrl: "https://damacloid.com",
  },
   {
     name: "Protiviti",
     logo: "/images/protiviti.png",
     description:
       "Protiviti is a global consulting firm delivering solutions to complex business challenges across technology, digital transformation, finance and risk, internal audit and operations. With a strong emphasis on innovation and strategic thinking, Protiviti enables organisations to navigate change, strengthen performance, and build long-term resilience.",
     linkedinUrl: "https://linkedin.com/company/protiviti",
     websiteUrl: "https://protiviti.com",
   },
];