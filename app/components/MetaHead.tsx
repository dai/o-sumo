import { createContext, useContext, useEffect, useState, type Dispatch, type PropsWithChildren, type SetStateAction } from 'react';
import { useLocation } from 'react-router-dom';
import { resolvePageMeta, type PageMeta } from '../lib/page-meta';
import { normalizeCanonicalPath } from '../lib/site-url';

type MetaAttribute = 'name' | 'property';
export type PageMetaOverride = Pick<PageMeta, 'title' | 'description'> & { pathname: string };
type PageMetaOverrideSetter = Dispatch<SetStateAction<PageMetaOverride | null>>;

const PageMetaOverrideContext = createContext<PageMetaOverrideSetter | null>(null);
type MetaFieldDefinition = {
  attribute: MetaAttribute;
  key: string;
  content: (meta: PageMeta) => string;
};

const META_FIELDS = [
  { attribute: 'name', key: 'description', content: (meta) => meta.description },
  { attribute: 'property', key: 'og:title', content: (meta) => meta.title },
  { attribute: 'property', key: 'og:description', content: (meta) => meta.description },
  { attribute: 'property', key: 'og:url', content: (meta) => meta.canonicalUrl },
  { attribute: 'property', key: 'og:image', content: (meta) => meta.imageUrl },
  { attribute: 'property', key: 'og:type', content: (meta) => meta.type },
  { attribute: 'property', key: 'og:site_name', content: () => 'o-sumo' },
  { attribute: 'property', key: 'og:image:width', content: () => '1629' },
  { attribute: 'property', key: 'og:image:height', content: () => '1007' },
  { attribute: 'name', key: 'twitter:card', content: () => 'summary_large_image' },
  { attribute: 'name', key: 'twitter:title', content: (meta) => meta.title },
  { attribute: 'name', key: 'twitter:description', content: (meta) => meta.description },
  { attribute: 'name', key: 'twitter:image', content: (meta) => meta.imageUrl },
] as const satisfies readonly MetaFieldDefinition[];

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
  }, [setOverride, override?.pathname, override?.title, override?.description]);
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
    document.title = meta.title;

    META_FIELDS.forEach(({ attribute, key, content }) => {
      reconcileMeta(attribute, key, content(meta));
    });
  }, [pathname, override]);

  return <PageMetaOverrideContext.Provider value={setOverride}>{children}</PageMetaOverrideContext.Provider>;
}
