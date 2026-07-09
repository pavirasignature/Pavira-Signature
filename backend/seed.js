/**
 * Database Seeding Script for Supabase (PostgreSQL)
 * Populates database with sample data
 * Run: node seed.js
 */

const dotenv = require("dotenv");
dotenv.config();

const { supabase } = require("./utils/supabase");
const Category = require("./models/Category");
const Product = require("./models/Product");
const Coupon = require("./models/Coupon");
const User = require("./models/User");

// Sample Categories
const categories = [
  {
    name: "Wall Arts",
    slug: "wall-arts",
    description: "Handcrafted, premium metal and acrylic wall arts to define your spaces.",
    icon: "🎨",
    isActive: true
  },
  {
    name: "Wall Clocks",
    slug: "wall-clocks",
    description: "Sleek timepieces with silent movement technology and brushed gold finishes.",
    icon: "⏰",
    isActive: true
  },
  {
    name: "3D Layer Arts",
    slug: "3d-layer-arts",
    description: "Precision-cut multi-layered wooden wall art pieces creating depth and shadows.",
    icon: "🎭",
    isActive: true
  },
  {
    name: "Gift Articles",
    slug: "gift-articles",
    description: "Signature home accents, scented luxury candles, and personalized tokens.",
    icon: "🎁",
    isActive: true
  },
  {
    name: "3D MDF Arts",
    slug: "3d-mdf-arts",
    description: "Elite CNC-carved panels finished with metallic royal paint.",
    icon: "🏗️",
    isActive: true
  },
  {
    name: "Main Door Grills",
    slug: "door-grills",
    description: "High-grade premium rustproof door grills for cinematic security.",
    icon: "🚪",
    isActive: true
  }
];

// Sample Products
const products = [
  {
    name: "Eternal Gilded Lotus Wall Art",
    slug: "eternal-gilded-lotus-wall-art",
    categorySlug: "wall-arts",
    description: "Transform your entryway with Eternal Gilded Lotus Wall Art. Handcrafted and rustproof gold paint.",
    price: 4999,
    compareAtPrice: 6999,
    stock: 50,
    rating: 4.8,
    numReviews: 42,
    images: [{ url: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80" }],
    featured: true,
    trending: true,
    bestSeller: false,
    isActive: true
  },
  {
    name: "Aura Silent Brushed Gold Wall Clock",
    slug: "aura-silent-brushed-gold-wall-clock",
    categorySlug: "wall-clocks",
    description: "Japan quartz silent wall clock encased in high-tensile brushed gold.",
    price: 2999,
    compareAtPrice: 4499,
    stock: 30,
    rating: 4.9,
    numReviews: 76,
    images: [{ url: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=800&q=80" }],
    featured: true,
    trending: false,
    bestSeller: true,
    isActive: true
  },
  {
    name: "Sacred Geometry 3D Mandala",
    slug: "sacred-geometry-3d-mandala",
    categorySlug: "3d-layer-arts",
    description: "Crafted from 9 layers of high-precision walnut stained birch plywood.",
    price: 5999,
    compareAtPrice: 8499,
    stock: 2,
    rating: 4.7,
    numReviews: 19,
    images: [{ url: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=800&q=80" }],
    featured: false,
    trending: true,
    bestSeller: true,
    isActive: true
  },
  {
    name: "Royal Scented Luxury Candle Set",
    slug: "royal-scented-luxury-candle-set",
    categorySlug: "gift-articles",
    description: "Indulge in olfactory luxury with our hand-poured soy wax candles, infused with essential oils.",
    price: 1499,
    compareAtPrice: 1999,
    stock: 100,
    rating: 4.6,
    numReviews: 28,
    images: [{ url: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80" }],
    featured: false,
    trending: false,
    bestSeller: false,
    isActive: true
  },
  {
    name: "Majestic Metallic CNC Wall Panel",
    slug: "majestic-metallic-cnc-wall-panel",
    categorySlug: "3d-mdf-arts",
    description: "Precision CNC-carved 3D MDF panel finished in royal metallic paint for accent walls.",
    price: 8999,
    compareAtPrice: 12999,
    stock: 15,
    rating: 4.5,
    numReviews: 12,
    images: [{ url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" }],
    featured: true,
    trending: true,
    bestSeller: false,
    isActive: true
  },
  {
    name: "Imperial Rustproof Main Door Grill",
    slug: "imperial-rustproof-main-door-grill",
    categorySlug: "door-grills",
    description: "High-grade rustproof iron door grill with cinematic security and sleek gold finish.",
    price: 12999,
    compareAtPrice: 16999,
    stock: 8,
    rating: 4.9,
    numReviews: 34,
    images: [{ url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80" }],
    featured: false,
    trending: false,
    bestSeller: true,
    isActive: true
  }
];

// Sample Users
const adminUser = {
  firstName: "Admin",
  lastName: "User",
  name: "Admin User",
  email: "admin@pavira-signature.com",
  password: "Admin@123456",
  phone: "+91-9999999999",
  role: "admin",
  isVerified: true,
  isActive: true
};

const customerUser = {
  firstName: "Adit",
  lastName: "Panchal",
  name: "Adit Panchal",
  email: "user@pavira-signature.com",
  password: "User@123456",
  phone: "+91-9876543210",
  role: "customer",
  isVerified: true,
  isActive: true
};

const seedDatabase = async () => {
  try {
    console.log("Starting Supabase database seeding...");

    // Clean existing tables in order
    await supabase.from("wishlists").delete().neq("user", "00000000-0000-0000-0000-000000000000");
    await supabase.from("orders").delete().neq("user", "00000000-0000-0000-0000-000000000000");
    await supabase.from("products").delete().neq("name", "");
    await supabase.from("categories").delete().neq("name", "");
    await supabase.from("users").delete().neq("email", "");

    console.log("✓ Existing Supabase data cleared");

    // Insert categories
    const savedCategories = [];
    for (const cat of categories) {
      const { data, error } = await supabase.from("categories").insert([cat]).select().single();
      if (error) throw error;
      savedCategories.push(data);
    }
    console.log(`✓ Inserted ${savedCategories.length} categories`);

    // Insert products, linking to their categories dynamically by categorySlug
    const savedProducts = [];
    for (const prod of products) {
      const matchedCategory = savedCategories.find(c => c.slug === prod.categorySlug);
      prod.category = matchedCategory ? matchedCategory.id : savedCategories[0].id;
      // Remove temporary categorySlug field before inserting to Supabase
      delete prod.categorySlug;
      const { data, error } = await supabase.from("products").insert([prod]).select().single();
      if (error) throw error;
      savedProducts.push(data);
    }
    console.log(`✓ Inserted ${savedProducts.length} products`);

    // Seed users
    const admin = await User.create(adminUser);
    const customer = await User.create(customerUser);
    console.log(`✓ Seeded users. Admin: ${admin.email}, Customer: ${customer.email}`);

    console.log("\n✨ Supabase Seeding Completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("✗ Seeding error:", error.message || error);
    process.exit(1);
  }
};

seedDatabase();
