import { ImageResponse } from 'next/og'
import { getBlogPosts } from 'app/blog/utils'

export const dynamic = 'force-static'
export const alt = 'Blog post'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const title = getBlogPosts().find((p) => p.slug === slug)?.metadata.title ?? 'growly.gg'
  return new ImageResponse(
    (
      <div tw="flex flex-col w-full h-full items-center justify-center bg-white">
        <div tw="flex flex-col md:flex-row w-full py-12 px-4 md:items-center justify-between p-8">
          <h2 tw="flex flex-col text-4xl font-bold tracking-tight text-left">{title}</h2>
        </div>
      </div>
    ),
    { ...size }
  )
}
