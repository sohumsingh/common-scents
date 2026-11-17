import type { MetadataRoute } from "next";
import { listOccasions, listProducts } from "@/lib/catalogue/service";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, occasions] = await Promise.all([listProducts(), listOccasions()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${site.url}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/shop`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site.url}/contact`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site.url}/info/delivery`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${site.url}/info/returns`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${site.url}/info/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${site.url}/info/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const collectionRoutes: MetadataRoute.Sitemap = occasions.map((occasion) => ({
    url: `${site.url}/collections/${occasion.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${site.url}/shop/${product.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...collectionRoutes, ...productRoutes];
}
