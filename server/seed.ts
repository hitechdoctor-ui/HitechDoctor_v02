import { db } from './db';
import { products } from '../shared/schema';

async function seed() {
  const existingProducts = await db.select().from(products);
  if (existingProducts.length === 0) {
    console.log("Seeding products...");
    await db.insert(products).values([
      {
        name: "Αλλαγή Οθόνης iPhone 13 Pro",
        description: "Αντικατάσταση σπασμένης οθόνης με γνήσια ανταλλακτικά.",
        price: "150.00",
        category: "repair",
        imageUrl: "https://images.unsplash.com/photo-1512054502232-10a0a035d672?auto=format&fit=crop&q=80&w=800"
      },
      {
        name: "Αλλαγή Μπαταρίας Samsung Galaxy S22",
        description: "Νέα μπαταρία για να κρατάει το κινητό σας όλη μέρα.",
        price: "60.00",
        category: "repair",
        imageUrl: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=800"
      },
      {
        name: "Tempered Glass iPhone 14",
        description: "Προστατευτικό τζάμι οθόνης υψηλής αντοχής.",
        price: "15.00",
        category: "accessory",
        imageUrl: "https://images.unsplash.com/photo-1601784551446-20c9e07cd8d3?auto=format&fit=crop&q=80&w=800"
      },
      {
        name: "IT Support - Απομακρυσμένη Υποστήριξη",
        description: "Επίλυση προβλημάτων λογισμικού, αφαίρεση ιών και ρυθμίσεις υπολογιστή εξ αποστάσεως.",
        price: "40.00",
        category: "service",
        imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800"
      }
    ]);
    console.log("Products seeded.");
  } else {
    console.log("Products already exist.");
  }
}

seed().catch(console.error).finally(() => process.exit(0));
