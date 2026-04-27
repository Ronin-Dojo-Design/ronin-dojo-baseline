# JETTY React + API Examples

## React page

```tsx
// JETTY: ContentAtomPage loads one canonical content atom and renders the correct site-specific experience so the same teaching truth can power multiple brands without duplication.
// LESSON: Canonical content should stay independent from brand presentation.
// WIRING: Route /content/[slug] -> useContentAtomQuery -> SiteContentRenderer.
// HEALTH: 🟢 9.2/10 | Strong separation of truth and presentation.

export function ContentAtomPage({ slug, siteKey }: { slug: string; siteKey: SiteKey }) {
  const { data, isLoading } = useContentAtomQuery({ slug, siteKey });
  if (isLoading) return <LoadingCard />;
  if (!data) return <NotFoundState />;
  return <SiteContentRenderer atom={data} siteKey={siteKey} />;
}
```

## React renderer switch

```tsx
// JETTY: SiteContentRenderer selects the right visual renderer for a site so one shared record can feel native on each brand.
// LESSON: Site switching belongs in a thin orchestration layer, not inside every child component.
// WIRING: ContentAtomPage -> SiteContentRenderer -> BlogArticleRenderer / TechniqueLessonRenderer / TournamentPromoRenderer.
// HEALTH: 🟢 9.0/10 | Clear responsibility boundary.

const renderers = {
  "blackbeltlegacy.local": BlogArticleRenderer,
  "tuffbuffs.local": TrainingMotivationRenderer,
  "wekaf-usa.local": TournamentPromoRenderer,
  "ronindojodesign.local": SystemDocRenderer,
} satisfies Record<SiteKey, React.ComponentType<{ atom: ContentAtom }>>;

export function SiteContentRenderer({ atom, siteKey }: { atom: ContentAtom; siteKey: SiteKey }) {
  const Renderer = renderers[siteKey] ?? BlogArticleRenderer;
  return <Renderer atom={atom} />;
}
```

## React hook

```tsx
// JETTY: useContentAtomQuery fetches canonical content and site-specific variants so pages stay thin and data access stays reusable.
// LESSON: Hooks should own fetching and transformation, not the page component.
// WIRING: ContentAtomPage -> useContentAtomQuery -> GraphQL or REST content hub.
// HEALTH: 🟢 9.1/10 | Reusable, cache-friendly, easy to test.

export function useContentAtomQuery(params: { slug: string; siteKey: string }) {
  return useQuery({
    queryKey: ["content-atom", params.slug, params.siteKey],
    queryFn: async () => fetchContentAtom(params),
  });
}
```

## GraphQL example

```graphql
query ContentAtomForSite($slug: ID!, $site: String!) {
  contentAtom(id: $slug, idType: SLUG) {
    canonicalId
    title
    hook
    teachingObjective
    relatedTechniques {
      nodes {
        title
        slug
      }
    }
    distributionVariants(where: { siteTarget: $site }) {
      nodes {
        channel
        publicTitle
        renderedCopy
        cta
      }
    }
  }
}
```

## REST example

```ts
export async function fetchContentAtom({ slug, siteKey }: { slug: string; siteKey: string }) {
  const res = await fetch(`/wp-json/ronin/v1/content-atoms/${slug}?site=${siteKey}`);
  if (!res.ok) throw new Error("Failed to load content atom");
  return res.json();
}
```

## Pod JETTY example

```text
JETTY: ContentAtomPod stores canonical editorial content so one truth can feed blogs, reels, curriculum pages, and short-form promos.
LESSON: Store the shared truth once and let variants adapt it for each channel.
WIRING: Obsidian content atom -> ContentAtomPod -> GraphQL/REST -> React renderers.
HEALTH: 🟢 9.0/10 | Strong if exposure stays deliberate and private fields stay private.
```

## REST controller JETTY example

```php
// JETTY: ContentAtomController receives content publication API requests so React apps can fetch one stable editorial shape across sites.
// LESSON: Controllers should shape requests and responses, not own editorial business logic.
// WIRING: /wp-json/ronin/v1/content-atoms/* -> ContentAtomService.
// HEALTH: 🟢 9.1/10 | Good if field permissions and caching are explicit.
```
