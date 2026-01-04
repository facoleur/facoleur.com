import { allBlogs } from "contentlayer/generated";
import type { MetadataRoute } from "next";

const BASE_URL = "https://facoleur.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/free-audit`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const blogEntries: MetadataRoute.Sitemap = allBlogs
    .filter((post) => !post.noindex)
    .map((post) => {
      const url = post.url.startsWith("/") ? post.url : `/${post.url}`;
      return {
        url: `${BASE_URL}${url}`,
        lastModified: post.publishedAt ? new Date(post.publishedAt) : now,
        changeFrequency: "monthly",
        priority: 0.6,
      };
    });

  return [...staticEntries, ...blogEntries];
}
