import { createContext, useContext, useEffect, useState, type Dispatch, type PropsWithChildren, type SetStateAction } from 'react';
import { useLocation } from 'react-router-dom';
import { buildPageJsonLd, resolvePageMeta, type PageMeta } from '../lib/page-meta';
import { normalizeCanonicalPath } from '../lib/site-url';

type MetaAttribute = 'name' | 'property';
export type PageMetaOverride = Pick<PageMeta, 'title' | 'description'> & { pathname: string; socialUrl?: string };
type PageMetaOverrideSetter = Dispatch<SetStateAction<PageMetaOverride | null>>;

const PageMetaOverrideContext = createContext<PageMetaOverrideSetter | null>(null);
type MetaFieldDefinition = {
  attribute: MetaAttribute;
  key: string;
  content: (meta: PageMeta, socialUrl: string) => string;
};

const META_FIELDS = [
  { attribute: 'name', key: 'description', content: (meta) => meta.description },
  { attribute: 'property', key: 'og:title', content: (meta) => meta.title },
  { attribute: 'property', key: 'og:description', content: (meta) => meta.description },
  { attribute: 'property', key: 'og:url', content: (_meta, socialUrl) => socialUrl },
  { attribute: 'property', key: 'og:image', content: (meta) => meta.image.primary },
  { attribute: 'property', key: 'og:image:secure_url', content: (meta) => meta.image.primary },
  { attribute: 'property', key: 'og:image:width', content: (meta) => String(meta.image.width) },
  { attribute: 'property', key: 'og:image:height', content: (meta) => String(meta.image.height) },
  { attribute: 'property', key: 'og:image:alt', content: (meta) => meta.image.alt },
  { attribute: 'property', key: 'og:type', content: (meta) => meta.type },
  { attribute: 'property', key: 'og:site_name', content: () => 'o-sumo' },
  { attribute: 'property', key: 'og:locale', content: () => 'ja_JP' },
  { attribute: 'name', key: 'twitter:card', content: () => 'summary_large_image' },
  { attribute: 'name', key: 'twitter:title', content: (meta) => meta.title },
  { attribute: 'name', key: 'twitter:description', content: (meta) => meta.description },
  { attribute: 'name', key: 'twitter:image', content: (meta) => meta.image.primary },
  { attribute: 'name', key: 'twitter:image:alt', content: (meta) => meta.image.alt },
] as const satisfies readonly MetaFieldDefinition[];

const JSON_LD_ELEMENT_ID = 'page-jsonld';

function reconcileJsonLd(pathname: string, meta: PageMeta) {
  const existing = document.getElementById(JSON_LD_ELEMENT_ID);
  const element = existing instanceof HTMLScriptElement ? existing : document.createElement('script');
  element.id = JSON_LD_ELEMENT_ID;
  element.type = 'application/ld+json';
  element.textContent = JSON.stringify(buildPageJsonLd(pathname, meta));
  if (!element.isConnected) document.head.append(element);
}

function reconcileMeta(attribute: MetaAttribute, value: string, content: string) {
  const selector = `meta[${attribute}="${value}"]`;
  const elements = Array.from(document.head.querySelectorAll<HTMLMetaElement>(selector));
  const element = elements[0] ?? document.createElement('meta');

  element.setAttribute(attribute, value);
  element.content = content;
  if (!element.isConnected) document.head.append(element);
  elements.slice(1).forEach((duplicate) => duplicate.remove());
}

export function usePageMetaOverride(override: PageMetaOverride | null) {
  const setOverride = useContext(PageMetaOverrideContext);

  useEffect(() => {
    if (!setOverride) return undefined;
    setOverride(override);
    return () => setOverride(null);
  }, [setOverride, override?.pathname, override?.title, override?.description, override?.socialUrl]);
}

export default function MetaHead({ children }: PropsWithChildren) {
  const { pathname } = useLocation();
  const [override, setOverride] = useState<PageMetaOverride | null>(null);

  useEffect(() => {
    const matchingOverride = override
      && normalizeCanonicalPath(override.pathname) === normalizeCanonicalPath(pathname)
      ? override
      : null;
    const meta = { ...resolvePageMeta(pathname), ...matchingOverride };
    const socialUrl = matchingOverride?.socialUrl ?? meta.canonicalUrl;
    document.title = meta.title;

    META_FIELDS.forEach(({ attribute, key, content }) => {
      reconcileMeta(attribute, key, content(meta, socialUrl));
    });
    reconcileJsonLd(pathname, meta);
  }, [pathname, override]);

  return <PageMetaOverrideContext.Provider value={setOverride}>{children}</PageMetaOverrideContext.Provider>;
}
