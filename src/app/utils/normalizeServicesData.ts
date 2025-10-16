// utils/normalizeServicesData.ts
import { ServiceItem, WebsiteData } from '@/types/WebsiteTypes';

interface RawServiceResponse {
  services_hero: {
    services: {
      services_hero: {
        headline: string;
        subheadline: string;
      };
    };
  };
  service_details: {
    services: {
      service_details: {
        service_name: Record<string, string>;
        headline: Record<string, string>;
        subheadline: Record<string, string>;
        service_description: Record<string, string>;
        [key: string]: any; // for "what's_included" and "who_it's_for"
      };
    };
  };
}

export const normalizeServicesData = (apiResponse: RawServiceResponse): WebsiteData['services'] => {
  const serviceDetails = apiResponse.service_details.services.service_details;
  const items: ServiceItem[] = [];

  Object.keys(serviceDetails.service_name).forEach(key => {
    const whatsIncluded: string[] = [];
    const whoItsFor = serviceDetails[`who_it's_for_${key}`] ?? '';

    // collect all "what's_included" entries for this service
    Object.keys(serviceDetails)
      .filter(k => k.startsWith(`what's_included_${key}_`))
      .forEach(k => {
        whatsIncluded.push(serviceDetails[k]);
      });

    items.push({
      serviceName: serviceDetails.service_name[key] ?? '',
      headline: serviceDetails.headline[key] ?? '',
      subheadline: serviceDetails.subheadline[key] ?? '',
      serviceDescription: serviceDetails.service_description[key] ?? '',
      whosItFor: whoItsFor,
      showWhosItFor: true,
      whatsIncluded,
      showWhatsIncluded: true,
      visible: true,
    });
  });

  return {
    visible: true,
    items,
  };
};
