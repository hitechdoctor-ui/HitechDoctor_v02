import type { Product } from "./store-context"

export interface Category {
  id: string
  name: string
  icon: string
  count: number
}

export const categories: Category[] = [
  { id: "smartphones", name: "Smartphones", icon: "📱", count: 48 },
  { id: "laptops", name: "Laptops", icon: "💻", count: 32 },
  { id: "tablets", name: "Tablets", icon: "📟", count: 18 },
  { id: "accessories", name: "Accessories", icon: "🎧", count: 64 },
  { id: "wearables", name: "Wearables", icon: "⌚", count: 22 },
  { id: "gaming", name: "Gaming", icon: "🎮", count: 15 },
]

export const products: Product[] = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    price: 1199,
    originalPrice: 1399,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop",
    rating: 4.9,
    reviews: 2341,
    category: "smartphones",
    isFeatured: true,
  },
  {
    id: 2,
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    price: 1099,
    originalPrice: 1299,
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop",
    rating: 4.8,
    reviews: 1876,
    category: "smartphones",
    isFeatured: true,
  },
  {
    id: 3,
    name: "MacBook Pro 14\" M3",
    brand: "Apple",
    price: 1999,
    originalPrice: 2199,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
    rating: 4.9,
    reviews: 987,
    category: "laptops",
    isFeatured: true,
  },
  {
    id: 4,
    name: "AirPods Pro 2nd Gen",
    brand: "Apple",
    price: 249,
    originalPrice: 299,
    image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop",
    rating: 4.7,
    reviews: 3210,
    category: "accessories",
    isFeatured: true,
  },
  {
    id: 5,
    name: "iPad Pro 12.9\" M2",
    brand: "Apple",
    price: 1099,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",
    rating: 4.8,
    reviews: 654,
    category: "tablets",
    isNew: true,
  },
  {
    id: 6,
    name: "Sony WH-1000XM5",
    brand: "Sony",
    price: 349,
    originalPrice: 399,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    rating: 4.8,
    reviews: 1432,
    category: "accessories",
    isNew: true,
  },
  {
    id: 7,
    name: "Google Pixel 8 Pro",
    brand: "Google",
    price: 899,
    originalPrice: 999,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop",
    rating: 4.6,
    reviews: 876,
    category: "smartphones",
    isNew: true,
  },
  {
    id: 8,
    name: "Apple Watch Series 9",
    brand: "Apple",
    price: 399,
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop",
    rating: 4.7,
    reviews: 2109,
    category: "wearables",
    isNew: true,
  },
  {
    id: 9,
    name: "Dell XPS 15",
    brand: "Dell",
    price: 1799,
    originalPrice: 1999,
    image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=400&fit=crop",
    rating: 4.6,
    reviews: 543,
    category: "laptops",
  },
  {
    id: 10,
    name: "Samsung Galaxy Tab S9",
    brand: "Samsung",
    price: 799,
    originalPrice: 899,
    image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&h=400&fit=crop",
    rating: 4.5,
    reviews: 432,
    category: "tablets",
  },
]

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.isFeatured)
}

export function getNewArrivals(): Product[] {
  return products.filter((p) => p.isNew)
}
