# growly.gg

Subham's blog and about-me. Next.js 15 with `output: 'export'`: the whole site is rendered to static files at build time and served by GitHub Pages. There is no server runtime and no database.

## Develop

```bash
bun install
bun run dev        # http://localhost:3000
bun run build      # static site in ./out
```

Posts are MDX files in `app/blog/posts/`. OG images (`/opengraph-image`, `/blog/<slug>/opengraph-image`), `rss.xml`, `sitemap.xml` and `robots.txt` are generated at build time.

## Deploy

Every push to `main` builds the site and publishes `./out` to GitHub Pages via `.github/workflows/pages.yml`. `public/CNAME` pins the custom domain (`growly.gg`); `www.growly.gg` is redirected to the apex by Pages. Next writes the OG images as extensionless files, so the workflow renames them to `.png` and rewrites the `<meta>` tags before upload.

DNS (Cloudflare, DNS-only / grey cloud): `A growly.gg -> 185.199.108.153 / 109.153 / 110.153 / 111.153`, `CNAME www -> growlyx.github.io`.
