/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tell Next.js not to bundle these Node.js-only packages for the server bundle
  // (they will be required at runtime from node_modules instead)
  serverExternalPackages: [
    "pg",
    "@prisma/adapter-pg",
    "@aws-sdk/client-bedrock-runtime",
    "@aws-sdk/client-s3",
    "@aws-sdk/client-polly",
    "@aws-sdk/s3-request-presigner",
    "bcryptjs",
  ],
};

export default nextConfig;
