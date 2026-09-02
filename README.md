# growly.gg

Subham's blog and about-me. Next.js 15 with `output: 'export'`: the whole site is rendered to static files at build time and served by nginx. There is no server runtime and no database.

## Develop

```bash
bun install
bun run dev        # http://localhost:3000
bun run build      # static site in ./out
```

Posts are MDX files in `app/blog/posts/`. OG images (`/opengraph-image`, `/blog/<slug>/opengraph-image`), `rss.xml`, `sitemap.xml` and `robots.txt` are generated at build time.

## Deploy

Every push to `main` builds `ghcr.io/growlyx/website:latest` (multi-arch) via `.github/workflows/build-image.yml`. The DormLab cluster runs `deploy/k8s.yaml`; Keel polls GHCR and rolls the Deployment when the image changes. Public traffic arrives through the cluster's Cloudflare Tunnel and Envoy Gateway; `www.growly.gg` redirects to `growly.gg` in nginx.

First-time apply: `kubectl apply -f deploy/k8s.yaml` (see github.com/dormlab/cluster for the cluster itself).
