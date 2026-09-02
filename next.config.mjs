/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',            // fully static: no server, no database
  images: { unoptimized: true },
  reactStrictMode: true,
}
export default nextConfig
