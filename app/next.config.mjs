/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Шрифты и рендеры отдаём со своего контура: §13 и обещание держать
  // персональные данные и трафик в РФ. Внешних CDN в продукте нет.
  images: { unoptimized: true },
};
export default nextConfig;
