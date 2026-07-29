/** A JSON-LD structured-data object (a `@context`/`@type` graph node). */
export type JsonLdData = Record<string, unknown>;

/**
 * Renders a JSON-LD `<script>` for structured data. Safe to render in server components.
 *
 * @remarks
 * Content is JSON-serialized (not executable JS); the site CSP already permits
 * `script-src 'self' 'unsafe-inline'`, which covers `application/ld+json` blocks.
 */
export function JsonLd({ data }: { data: JsonLdData | JsonLdData[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
