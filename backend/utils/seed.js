/**
 * Seeds the database with sample products.
 * Run with: npm run seed
 * WARNING: this clears the existing products collection first.
 */
require('dotenv').config();
const connectDB = require('../config/db');
const Product = require('../models/Product');

const sampleProducts = [
  {
    name: 'Aria Wireless Headphones',
    description: 'Over-ear wireless headphones with active noise cancellation and 30-hour battery life.',
    price: 129.99,
    category: 'Electronics',
    imageUrl: 'https://placehold.co/600x600/1b1f24/f7f7f5?text=Headphones',
    stock: 42,
    featured: true,
  },
  {
    name: 'Pulse Smartwatch',
    description: 'Fitness smartwatch with heart-rate monitor, GPS, and a week-long battery.',
    price: 89.5,
    category: 'Electronics',
    imageUrl: 'https://placehold.co/600x600/1b1f24/f7f7f5?text=Smartwatch',
    stock: 30,
    featured: true,
  },
  {
    name: 'Terra Ceramic Mug Set',
    description: 'Set of two hand-glazed ceramic mugs, microwave and dishwasher safe.',
    price: 24.0,
    category: 'Home & Kitchen',
    imageUrl: 'https://placehold.co/600x600/0f766e/f7f7f5?text=Mug+Set',
    stock: 75,
    featured: false,
  },
  {
    name: 'Drift Canvas Backpack',
    description: 'Water-resistant canvas backpack with a padded 15-inch laptop sleeve.',
    price: 54.99,
    category: 'Bags',
    imageUrl: 'https://placehold.co/600x600/0f766e/f7f7f5?text=Backpack',
    stock: 20,
    featured: true,
  },
  {
    name: 'Lumen Desk Lamp',
    description: 'Adjustable LED desk lamp with three brightness levels and USB charging port.',
    price: 32.99,
    category: 'Home & Kitchen',
    imageUrl: 'https://placehold.co/600x600/0f766e/f7f7f5?text=Desk+Lamp',
    stock: 50,
    featured: false,
  },
  {
    name: 'Cove Running Shoes',
    description: 'Lightweight breathable running shoes with responsive cushioning.',
    price: 74.0,
    category: 'Footwear',
    imageUrl: 'https://placehold.co/600x600/ff9f1c/1b1f24?text=Shoes',
    stock: 60,
    featured: true,
  },
  {
    name: 'Nomad Travel Bottle',
    description: 'Insulated stainless steel bottle that keeps drinks cold for 24 hours.',
    price: 19.99,
    category: 'Outdoor',
    imageUrl: 'https://placehold.co/600x600/ff9f1c/1b1f24?text=Bottle',
    stock: 100,
    featured: false,
  },
  {
    name: 'Fable Notebook Trio',
    description: 'Set of three dot-grid notebooks with a soft-touch cover.',
    price: 16.5,
    category: 'Stationery',
    imageUrl: 'https://placehold.co/600x600/1b1f24/f7f7f5?text=Notebooks',
    stock: 85,
    featured: false,
  },
];

async function seed() {
  await connectDB();
  console.log('Clearing existing products...');
  await Product.deleteMany({});
  console.log('Inserting sample products...');
  await Product.insertMany(sampleProducts);
  console.log(`Seeded ${sampleProducts.length} products.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
