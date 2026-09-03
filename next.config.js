/** @type {import('next').NextConfig} */

let supabaseHostname = null;

try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    supabaseHostname = new URL(
      process.env.NEXT_PUBLIC_SUPABASE_URL
    ).hostname;
  }
} catch {
  // Ignore malformed env values; omit Supabase pattern if invalid.
}

const remotePatterns = [
  {
    protocol: "https",
    hostname: "images.unsplash.com",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "images.pexels.com",
    pathname: "/**",
  },
];

if (supabaseHostname) {
  remotePatterns.push({
    protocol: "https",
    hostname: supabaseHostname,
    pathname: "/storage/v1/object/public/**",
  });
}

const nextConfig = {
  images: {
    remotePatterns,
  },
};

module.exports = nextConfig;