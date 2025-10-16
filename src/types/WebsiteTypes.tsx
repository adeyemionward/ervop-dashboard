export type MenuItem = {
  title: string;
  visible: boolean;
};

export type TeamMember = {
  name: string;
  role: string;
  image: string;
};

export interface AboutSection {
  visible: boolean;
  heroVisible?: boolean;
  heroHeadline?: string;
  heroSubheadline?: string;
  heroImage?: string;

  storyVisible?: boolean;
  storyHeadline?: string;
  storyDescription?: string;
  storyImage?: string;
  yoe?: string;
  customersServed?: string;

  missionVisionVisible?: boolean;
  mission?: string;
  vision?: string;

  teamVisible?: boolean;
  team?: TeamMember[];

  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

export type FaqItem = {
  question: string;
  answer: string;
}

export type ProcessStep = {
  title: string;
  description: string;
};

// export type PortfolioItem = {
//   image?: File | string; // File when uploading, string when already uploaded
//   title: string;
//   description: string;
//   category: string;
// };

export type PortfolioItem = {
  image?: File | undefined; // allow undefined for new items
  title: string;
  description: string;
  category: string;
};

export type ReviewItem = {
  customer_name: string;
  comment: string;
  star_rating: number;
};


export type ServiceItem = {
  serviceName: string;
  headline: string;
  subheadline: string;
  serviceDescription: string;
  whosItFor?: string;
  showWhosItFor?: boolean;      // NEW toggle flag
  whatsIncluded?: string[];
  showWhatsIncluded?: boolean;  // NEW toggle flag
  icon?: string;
  visible?: boolean;
};



export interface WebsiteData {
  header: {
    visible: boolean;
    title: string;
    logo: string;
    menuItems: {
      home: MenuItem;
      about: MenuItem;
      faq: MenuItem;
      shop: MenuItem;
      services: MenuItem;
      portfolio: MenuItem;
      contact?: MenuItem;
    };
  };

  
branding: {
    visible: boolean;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
  };

  hero: {
    visible: boolean;
    tagline: string;
    headline: string;
    subheadline: string;
    ctaText: string;
    ctaText2: string;
    images: string[];
  };

  about: AboutSection;

  home: {
    visible: boolean;
    hero: {
      visible: boolean;
      tagline: string;
      headline: string;
      subheadline: string;
      ctaText: string;
      ctaText2: string;
      images: string[];
    };
    processes: {
      visible: boolean;
      title: string;
      steps: ProcessStep[];
    };
    whyUs: {
      visible: boolean;
      title: string;
      points: { title: string; description: string }[];
    };
    services: {
      visible: boolean;
      title: string;
      summary: string;
    };
    about: {
      visible: boolean;
      title: string;
      summary: string;
    };
  };

  faq: {
    visible: boolean;
    items: FaqItem[];
  };

  services: {
    visible: boolean;
    items: ServiceItem[];
  };


   contact: {
    visible: boolean;
    email: string;
    phone: string;
    address: string;
  };

  portfolio: {
    visible: boolean;
    items: PortfolioItem[];
  };

 reviews: {
    visible: boolean;
    items: ReviewItem[];
  };

}
