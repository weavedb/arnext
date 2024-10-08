/** @type {import('next').NextConfig} */
const isArweave = process.env.NEXT_PUBLIC_DEPLOY_TARGET === "arweave"
let env = {}
for (const k in process.env) {
  if (/^NEXT_PUBLIC_/.test(k)) env[k] = process.env[k]
}
const nextConfig = {
  reactStrictMode: true,
  ...(isArweave ? { output: "export", publicRuntimeConfig: env } : {}),
  images: { unoptimized: isArweave },
}

export default nextConfig
