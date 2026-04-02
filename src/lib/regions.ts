export type RegionCode = 'TZ' | 'KE' | 'ZM';

export interface Region {
  code: RegionCode;
  name: string;
  locale: string;
  currency: string;
  language: string;
  flag: string;
}

export const REGIONS: Record<RegionCode, Region> = {
  TZ: { code: 'TZ', name: 'Tanzania', locale: 'sw-TZ', currency: 'TZS', language: 'sw', flag: '🇹🇿' },
  KE: { code: 'KE', name: 'Kenya', locale: 'en-KE', currency: 'KES', language: 'en', flag: '🇰🇪' },
  ZM: { code: 'ZM', name: 'Zambia', locale: 'en-ZM', currency: 'ZMW', language: 'zm', flag: '🇿🇲' },
};

export const getStoredRegion = (): Region => {
  if (typeof window === 'undefined') return REGIONS.TZ;
  const code = localStorage.getItem('vertex_region') as RegionCode;
  return REGIONS[code] || REGIONS.TZ;
};

export const setRegion = (code: RegionCode) => {
  if (typeof window === 'undefined') return;
  const region = REGIONS[code];
  if (region) {
    localStorage.setItem('vertex_region', code);
    window.location.reload();
  }
};
