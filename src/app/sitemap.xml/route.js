import { allPosts } from "@/content/blogPost";

export async function GET() {
  const baseUrl = "https://bookabash.com"; // Replace with your actual domain
  const posts = allPosts;

  const urls = posts.map((post) => {
    return `
      <url>
        <loc>${baseUrl}/blog/${post.slug}</loc>
        <lastmod>${new Date(post.date).toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
      </url>`;
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${baseUrl}</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      ${urls.join("")}
    </urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
