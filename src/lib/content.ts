import site from "@/data/site.json";
import pages from "@/data/pages.json";
import categories from "@/data/categories.json";
import brands from "@/data/brands.json";
import stats from "@/data/stats.json";
import products from "@/data/products.json";

export type Category = (typeof categories)[number];

export { site, pages, categories, brands, stats, products };
