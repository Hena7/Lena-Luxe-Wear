import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  console.log("📦 Creating categories...");
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "Men's Wear" },
      update: {},
      create: { name: "Men's Wear" },
    }),
    prisma.category.upsert({
      where: { name: "Women's Wear" },
      update: {},
      create: { name: "Women's Wear" },
    }),
    prisma.category.upsert({
      where: { name: "Kids" },
      update: {},
      create: { name: "Kids" },
    }),
    prisma.category.upsert({
      where: { name: "Accessories" },
      update: {},
      create: { name: "Accessories" },
    }),
  ]);

  console.log("✅ Categories created!");

  const [menCategory, womenCategory, kidsCategory, accessoriesCategory] =
    categories;

  console.log("👕 Creating products...");

  const products = [
    {
      name: "Classic Cotton T-Shirt",
      description: "Comfortable everyday cotton tee with a relaxed fit",
      price: 19.99,
      stock: 100,
      categoryId: menCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80",
    },
    {
      name: "Premium Polo Shirt",
      description:
        "Elegant polo shirt perfect for casual and semi-formal occasions",
      price: 34.99,
      stock: 75,
      categoryId: menCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500&q=80",
    },
    {
      name: "Slim Fit Jeans",
      description: "Modern slim fit denim jeans with stretch comfort",
      price: 49.99,
      stock: 80,
      categoryId: menCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&q=80",
    },
    {
      name: "Casual Chino Pants",
      description: "Versatile chino pants for everyday wear",
      price: 44.99,
      stock: 60,
      categoryId: menCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&q=80",
    },
    {
      name: "Denim Jacket",
      description: "Classic denim jacket with vintage wash",
      price: 79.99,
      stock: 45,
      categoryId: menCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80",
    },
    {
      name: "Leather Belt",
      description: "Genuine leather belt with silver buckle",
      price: 24.99,
      stock: 120,
      categoryId: menCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1624222247344-550fb60583c2?w=500&q=80",
    },
    {
      name: "Oxford Dress Shirt",
      description: "Crisp white oxford shirt for professional looks",
      price: 39.99,
      stock: 70,
      categoryId: menCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1602810318660-d7ca5eb1153b?w=500&q=80",
    },
    {
      name: "Wool Blend Sweater",
      description: "Warm and cozy sweater for cold weather",
      price: 54.99,
      stock: 55,
      categoryId: menCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80",
    },
    {
      name: "Athletic Shorts",
      description: "Breathable shorts perfect for workouts",
      price: 27.99,
      stock: 90,
      categoryId: menCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&q=80",
    },
    {
      name: "Hooded Sweatshirt",
      description: "Comfortable hoodie with kangaroo pocket",
      price: 42.99,
      stock: 85,
      categoryId: menCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80",
    },
    {
      name: "Bomber Jacket",
      description: "Stylish bomber jacket with ribbed cuffs",
      price: 89.99,
      stock: 40,
      categoryId: menCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&q=80",
    },
    {
      name: "Cargo Pants",
      description: "Functional cargo pants with multiple pockets",
      price: 52.99,
      stock: 65,
      categoryId: menCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500&q=80",
    },

    {
      name: "Summer Floral Dress",
      description: "Light and breezy floral dress perfect for summer",
      price: 65.0,
      stock: 50,
      categoryId: womenCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80",
    },
    {
      name: "Elegant Maxi Dress",
      description: "Floor-length dress for formal occasions",
      price: 89.99,
      stock: 35,
      categoryId: womenCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500&q=80",
    },
    {
      name: "Casual Denim Skirt",
      description: "Classic A-line denim skirt",
      price: 38.99,
      stock: 60,
      categoryId: womenCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=500&q=80",
    },
    {
      name: "Satin Blouse",
      description: "Luxurious satin blouse with bow detail",
      price: 44.99,
      stock: 55,
      categoryId: womenCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1564257577-7e93c9acc6cf?w=500&q=80",
    },
    {
      name: "High Waist Jeans",
      description: "Flattering high-rise skinny jeans",
      price: 54.99,
      stock: 70,
      categoryId: womenCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&q=80",
    },
    {
      name: "Knit Cardigan",
      description: "Cozy oversized cardigan sweater",
      price: 48.99,
      stock: 65,
      categoryId: womenCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=500&q=80",
    },
    {
      name: "Wrap Top",
      description: "Flattering wrap-style blouse",
      price: 36.99,
      stock: 75,
      categoryId: womenCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1564257577-7e93c9acc6cf?w=500&q=80",
    },
    {
      name: "Pleated Midi Skirt",
      description: "Elegant pleated skirt in neutral tone",
      price: 52.99,
      stock: 48,
      categoryId: womenCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=500&q=80",
    },
    {
      name: "Leather Jacket",
      description: "Edgy faux leather moto jacket",
      price: 99.99,
      stock: 30,
      categoryId: womenCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80",
    },
    {
      name: "Cashmere Sweater",
      description: "Soft cashmere blend pullover",
      price: 78.99,
      stock: 42,
      categoryId: womenCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1571513800374-df1bbe650e56?w=500&q=80",
    },
    {
      name: "Wide Leg Trousers",
      description: "Professional wide-leg pants",
      price: 58.99,
      stock: 55,
      categoryId: womenCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=500&q=80",
    },
    {
      name: "Evening Gown",
      description: "Stunning floor-length evening dress",
      price: 149.99,
      stock: 20,
      categoryId: womenCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500&q=80",
    },
    {
      name: "Fitted Blazer",
      description: "Tailored blazer for office wear",
      price: 84.99,
      stock: 45,
      categoryId: womenCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=500&q=80",
    },
    {
      name: "Yoga Leggings",
      description: "High-performance athletic leggings",
      price: 32.99,
      stock: 100,
      categoryId: womenCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500&q=80",
    },

    {
      name: "Kids Cotton T-Shirt",
      description: "Soft cotton tee for children",
      price: 15.99,
      stock: 120,
      categoryId: kidsCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=500&q=80",
    },
    {
      name: "Kids Denim Jeans",
      description: "Durable jeans for active kids",
      price: 29.99,
      stock: 90,
      categoryId: kidsCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500&q=80",
    },
    {
      name: "Princess Dress",
      description: "Beautiful party dress for girls",
      price: 44.99,
      stock: 50,
      categoryId: kidsCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=500&q=80",
    },
    {
      name: "Boys Cargo Shorts",
      description: "Comfortable shorts with pockets",
      price: 22.99,
      stock: 80,
      categoryId: kidsCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500&q=80",
    },
    {
      name: "Kids Hoodie",
      description: "Warm pullover hoodie",
      price: 32.99,
      stock: 75,
      categoryId: kidsCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=500&q=80",
    },
    {
      name: "School Uniform Polo",
      description: "Classic polo shirt for school",
      price: 18.99,
      stock: 110,
      categoryId: kidsCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=500&q=80",
    },
    {
      name: "Kids Winter Jacket",
      description: "Insulated jacket for cold weather",
      price: 54.99,
      stock: 60,
      categoryId: kidsCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80",
    },
    {
      name: "Girls Leggings",
      description: "Stretchy comfortable leggings",
      price: 16.99,
      stock: 95,
      categoryId: kidsCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500&q=80",
    },
    {
      name: "Boys Athletic Shorts",
      description: "Sports shorts for active play",
      price: 19.99,
      stock: 85,
      categoryId: kidsCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500&q=80",
    },
    {
      name: "Kids Pajama Set",
      description: "Cozy two-piece sleepwear",
      price: 26.99,
      stock: 70,
      categoryId: kidsCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=500&q=80",
    },

    {
      name: "Leather Wallet",
      description: "Genuine leather bifold wallet",
      price: 34.99,
      stock: 150,
      categoryId: accessoriesCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80",
    },
    {
      name: "Woven Straw Hat",
      description: "Summer sun hat with wide brim",
      price: 28.99,
      stock: 80,
      categoryId: accessoriesCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=500&q=80",
    },
    {
      name: "Canvas Backpack",
      description: "Durable canvas backpack with laptop sleeve",
      price: 54.99,
      stock: 70,
      categoryId: accessoriesCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80",
    },
    {
      name: "Silk Scarf",
      description: "Elegant silk scarf in multiple colors",
      price: 42.99,
      stock: 90,
      categoryId: accessoriesCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500&q=80",
    },
    {
      name: "Designer Sunglasses",
      description: "UV protection sunglasses with case",
      price: 79.99,
      stock: 60,
      categoryId: accessoriesCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80",
    },
    {
      name: "Leather Handbag",
      description: "Stylish shoulder bag with compartments",
      price: 89.99,
      stock: 45,
      categoryId: accessoriesCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80",
    },
    {
      name: "Knit Beanie",
      description: "Warm winter beanie hat",
      price: 18.99,
      stock: 120,
      categoryId: accessoriesCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=500&q=80",
    },
    {
      name: "Cotton Socks Pack",
      description: "Pack of 5 comfortable cotton socks",
      price: 14.99,
      stock: 200,
      categoryId: accessoriesCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=500&q=80",
    },
    {
      name: "Watch",
      description: "Classic analog watch with leather strap",
      price: 99.99,
      stock: 55,
      categoryId: accessoriesCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=80",
    },
    {
      name: "Leather Gloves",
      description: "Warm leather gloves for winter",
      price: 36.99,
      stock: 75,
      categoryId: accessoriesCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1603119593730-c5d585acfc37?w=500&q=80",
    },
    {
      name: "Crossbody Bag",
      description: "Compact crossbody purse",
      price: 44.99,
      stock: 65,
      categoryId: accessoriesCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80",
    },
    {
      name: "Baseball Cap",
      description: "Adjustable sports cap",
      price: 22.99,
      stock: 100,
      categoryId: accessoriesCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&q=80",
    },
    {
      name: "Tote Bag",
      description: "Large canvas tote for shopping",
      price: 24.99,
      stock: 110,
      categoryId: accessoriesCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&q=80",
    },
    {
      name: "Phone Case",
      description: "Protective silicone phone case",
      price: 16.99,
      stock: 180,
      categoryId: accessoriesCategory.id,
      imageUrl:
        "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500&q=80",
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log("✅ Created", products.length, "products!");

  console.log("👤 Creating admin user...");
  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@lena.com" },
    update: {},
    create: {
      email: "admin@lena.com",
      name: "Lena Admin",
      phoneNumber: "+1234567890",
      passwordHash: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log(
    "✅ Admin user created! (email: admin@lena.com, password: admin123)",
  );

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
