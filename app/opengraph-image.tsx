import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'
export const alt = 'growly.gg'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div tw="flex flex-col w-full h-full items-center justify-center bg-white">
        <div tw="flex flex-col md:flex-row w-full py-12 px-4 md:items-center justify-between p-8">
          <h2 tw="flex flex-col text-4xl font-bold tracking-tight text-left">growly.gg</h2>
        </div>
      </div>
    ),
    { ...size }
  )
}
