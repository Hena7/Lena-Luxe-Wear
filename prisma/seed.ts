// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- Define Category Data ---
// Using names directly as they are unique. We'll upsert based on name.
const categoriesToSeed = [
  { name: 'T-Shirt' },
  { name: 'Jeans' },
  { name: 'Dress' },
  { name: 'Accessories' },
  { name: 'Sweater' },
  { name: 'Shoes' },
  // Add more if desired
];

// --- Define Product Data ---
// Now references the CATEGORY NAME, which we will use to connect
const productsToSeed = [
    // Category: T-Shirt
    { id: 'prod-001', name: 'Classic Cotton T-Shirt', price: 19.99, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', description: 'A comfortable and classic 100% cotton t-shirt.', categoryName: 'T-Shirt', stock: 100 },
    { id: 'prod-009', name: 'Graphic Print T-Shirt', price: 22.50, imageUrl: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', categoryName: 'T-Shirt', stock: 90 },
    // Category: Jeans
    { id: 'prod-002', name: 'Slim Fit Jeans', price: 49.95, imageUrl: 'https://images.unsplash.com/photo-1602293589914-9b29cdae68dc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', description: 'Modern slim fit jeans with a touch of stretch for comfort.', categoryName: 'Jeans', stock: 50 },
    { id: 'prod-010', name: 'High-Waisted Jeans', price: 52.00, imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', categoryName: 'Jeans', stock: 45 },
    // Category: Dress
    { id: 'prod-003', name: 'Summer Floral Dress', price: 65.00, imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', description: 'Light and airy floral dress perfect for summer days.', categoryName: 'Dress', stock: 30 },
    // Category: Accessories
    { id: 'prod-004', name: 'Leather Belt', price: 24.50, imageUrl: 'https://images.unsplash.com/photo-1542181634-519e8a315436?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', description: 'Genuine leather belt with a classic buckle.', categoryName: 'Accessories', stock: 75 },
    { id: 'prod-007', name: 'Wool Scarf', price: 29.95, imageUrl: 'https://images.unsplash.com/photo-1542060748-10c28b62716f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', description: 'Soft wool scarf to keep you warm in style.', categoryName: 'Accessories', stock: 80 },
    { id: 'prod-008', name: 'Stylish Sunglasses', price: 75.00, imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', description: 'Protect your eyes with these fashionable sunglasses.', categoryName: 'Accessories', stock: 25 },
    // Category: Sweater
    { id: 'prod-005', name: 'Cozy Knit Sweater', price: 55.00, imageUrl: 'https://images.unsplash.com/photo-1616420879804-2a14f4173313?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', description: 'Warm and cozy knit sweater for chilly evenings.', categoryName: 'Sweater', stock: 40 },
    // Category: Shoes
    { id: 'prod-006', name: 'Canvas Sneakers', price: 39.99, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format=fit&crop&w=500&q=80', description: 'Casual and durable canvas sneakers for everyday wear.', categoryName: 'Shoes', stock: 60 },
];


async function main() {
  console.log(`Start seeding ...`);

  // --- Seed Categories ---
  console.log('Seeding categories...');
  for (const cat of categoriesToSeed) {
    await prisma.category.upsert({
      where: { name: cat.name }, // Use the unique name to find/update
      update: {}, // No fields to update if found, just ensure it exists
      create: {
        name: cat.name,
        // Prisma generates the ID automatically (cuid)
      },
    });
    console.log(`Upserted category: ${cat.name}`);
  }
  console.log('Categories seeded.');

  // --- Seed Products (with category connection) ---
  console.log('Seeding products...');
  for (const p of productsToSeed) {
    // Separate categoryName from the rest of the product data
    const { categoryName, ...productData } = p;

    const product = await prisma.product.upsert({
      where: { id: productData.id },
      update: { // Data to update if product exists
        ...productData, // Spread the basic fields (name, price, etc.)
        category: {     // Connect to the existing category
          connect: {
            name: categoryName, // Connect using the unique category name
          }
        }
      },
      create: { // Data to use if product needs to be created
        ...productData, // Spread the basic fields
         category: {    // Connect to the existing category
          connect: {
            name: categoryName, // Connect using the unique category name
          }
        }
        // The categoryId field is automatically set by Prisma via connect
      },
    });
    console.log(`Upserted product with id: ${product.id} linked to category: ${categoryName}`);
  }
  console.log('Products seeded.');

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  });