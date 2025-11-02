import { useEffect } from 'react';
import type { BrandAssets, SeoMetadata } from '@shared/types';
export function useDynamicAssets(brandAssets?: BrandAssets, seoMetadata?: SeoMetadata) {
  useEffect(() => {
    if (seoMetadata?.siteTitle) {
      document.title = seoMetadata.siteTitle;
    }
    if (brandAssets?.faviconUrl) {
      const favicon = document.getElementById('favicon') as HTMLLinkElement | null;
      if (favicon && favicon.href !== brandAssets.faviconUrl) {
        favicon.href = brandAssets.faviconUrl;
      }
    }
  }, [brandAssets, seoMetadata]);
}