import "dotenv/config";
import { db } from "../server/db.js";
import { products } from "../shared/schema.js";
import { eq } from "drizzle-orm";

const SLUG = "samsung-galaxy-a16-4gb-128gb-black";
const images = [
  "/images/samsung-galaxy-a16/black-01.jpg",
  "/images/samsung-galaxy-a16/black-03.jpg",
  "/images/samsung-galaxy-a16/black-02.jpg",
  "/images/samsung-galaxy-a16/black-04.jpg",
];

async function main() {
  const [row] = await db.select().from(products).where(eq(products.slug, SLUG)).limit(1);
  if (!row) {
    console.error("Product not found:", SLUG);
    process.exit(1);
  }

  await db
    .update(products)
    .set({
      price: "175.00",
      imageUrl: images[0],
      images,
      hidePriceComparison: true,
      color: "Black",
      ram: "4GB",
      storage: "128GB",
    })
    .where(eq(products.id, row.id));

  console.log(`Updated id=${row.id} → €175 with ${images.length} local images`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
