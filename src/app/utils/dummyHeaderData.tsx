// dummyHeaderData.ts
import { WebsiteData } from '@/types/WebsiteTypes';
import { normalizeHeaderData } from '@/app/utils/normalizeHeaderData';

export const dummyHeaderData: WebsiteData['header'] = normalizeHeaderData({
  visible: true,
  title: 'My Brand',
  logo: '',
  menuItems: {
    home: { visible: true, title: 'Home' },
    about: { visible: true, title: 'About' },
    faq: { visible: true, title: 'FAQ' },
    shop: { visible: true, title: 'Shop' },
    services: { visible: true, title: 'Services' },
    portfolio: { visible: true, title: 'Portfolio' },
    contact: { visible: true, title: 'Contact' },
  },
  theme: {
    primaryColor: '#1D4ED8',
    secondaryColor: '#9333EA',
  },
  seo: {
    metaTitle: 'My Brand',
    metaDescription: 'This is a description of my brand.',
    metaKeywords: 'brand, services, portfolio',
  },
});
