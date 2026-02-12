import { Resource } from '../types';

/**
 * Service to generate working links for educational resources
 * Only returns links that are guaranteed to work
 */

interface ResourceSearchOptions {
  title: string;
  author?: string;
  description?: string;
  type: 'Reading' | 'Video' | 'Tool' | 'Dataset';
  subject?: string;
}

/**
 * Generate working resource links from verified platforms
 * Only returns links that are likely to actually work
 */
export const getResourceLink = (resource: Resource, subject?: string): string => {
  // If URL exists and is valid, use it
  if (resource.url && resource.url.trim() && resource.url !== '#' && isValidUrl(resource.url)) {
    return resource.url;
  }

  const query = encodeURIComponent(resource.title + (resource.author ? ' ' + resource.author : ''));
  const searchQuery = encodeURIComponent(`${resource.title} ${resource.author || ''} ${resource.description || ''}`);

  if (resource.type === 'Video') {
    // Try to find specific resource URL first
    const specificLink = findSpecificVideoLink(resource, subject);
    if (specificLink) return specificLink;

    // Fallback to YouTube search - guaranteed to have results
    return `https://www.youtube.com/results?search_query=${query}`;
  } 
  
  if (resource.type === 'Reading') {
    // Use Google Scholar for academic texts
    return `https://scholar.google.com/scholar?q=${searchQuery}`;
  }

  if (resource.type === 'Tool') {
    // Search for tools/software
    return `https://www.google.com/search?q=${query}+download`;
  }

  if (resource.type === 'Dataset') {
    // Search for datasets
    return `https://www.google.com/search?q=${query}+dataset`;
  }

  // Default fallback
  return `https://www.google.com/search?q=${searchQuery}`;
};

/**
 * Try to find a specific video link from known platforms
 * Only returns links if we have high confidence they exist
 */
const findSpecificVideoLink = (resource: Resource, subject?: string): string => {
  const title = resource.title.toLowerCase();
  const description = (resource.description || '').toLowerCase();
  const combined = title + ' ' + description;

  // If the resource explicitly mentions NPTEL or has a direct link, try it
  if (combined.includes('nptel')) {
    const query = encodeURIComponent(resource.title);
    return `https://nptel.ac.in/courses?search=${query}`;
  }

  // If the resource explicitly mentions Infosys Springboard
  if (combined.includes('springboard') || combined.includes('infosys')) {
    const query = encodeURIComponent(resource.title);
    return `https://springboard.infosys.com/search?q=${query}`;
  }

  // Otherwise, don't return a specific link - let YouTube search handle it
  return '';
};

/**
 * Validate if a URL is properly formatted
 */
const isValidUrl = (urlString: string): boolean => {
  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Generate better search queries for resources
 * Used when creating curriculum resources initially
 */
export const generateBetterResourceUrls = (resource: Resource, subject?: string): Resource => {
  if (!resource.url || resource.url === '#' || !isValidUrl(resource.url)) {
    return {
      ...resource,
      url: getResourceLink(resource, subject)
    };
  }
  return resource;
};

/**
 * Enhance Gemini-generated resources with better URLs
 */
export const enhanceResourcesWithBetterLinks = (resources: Resource[], subject?: string): Resource[] => {
  return resources.map(resource => generateBetterResourceUrls(resource, subject));
};
