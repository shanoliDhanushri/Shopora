
const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
});

const Category = require('../models/Category');
const Product = require('../models/Product');

const MONGO_URI = process.env.MONGO_URI;
// Realistic Sri Lankan product image URLs from Unsplash (free to use)
const categoryImages = {
  electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80',
  fashion: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80',
  homeGarden: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
  sportsOutdoor: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&q=80',
  beautyHealth: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80',
};

const categories = [
  {
    name: 'Electronics',
    description: 'Latest gadgets, phones, computers, and electronic accessories',
    image: categoryImages.electronics,
  },
  {
    name: 'Fashion',
    description: 'Trendy clothing, footwear, and accessories for men and women',
    image: categoryImages.fashion,
  },
  {
    name: 'Home & Garden',
    description: 'Furniture, kitchen appliances, and home decor',
    image: categoryImages.homeGarden,
  },
  {
    name: 'Sports & Outdoor',
    description: 'Sports equipment, activewear, and outdoor gear',
    image: categoryImages.sportsOutdoor,
  },
  {
    name: 'Beauty & Health',
    description: 'Skincare, cosmetics, health supplements, and wellness products',
    image: categoryImages.beautyHealth,
  },
];

const generateProducts = (categoryIds) => {
  const [electronics, fashion, homeGarden, sports, beauty] = categoryIds;

  return [
    // Electronics
    {
      name: 'Samsung Galaxy A54 5G Smartphone',
      description: 'Experience the power of 5G with the Samsung Galaxy A54. Features a stunning 6.4" Super AMOLED display, 50MP triple camera system, 5000mAh battery, and 8GB RAM for seamless multitasking.',
      shortDescription: '6.4" Super AMOLED, 50MP camera, 5G capable, 5000mAh battery',
      price: 89900,
      discountPrice: 79900,
      category: electronics,
      brand: 'Samsung',
      stock: 25,
      isFeatured: true,
      isBestSeller: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&q=80' },
        { url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80' },
      ],
      tags: ['smartphone', '5g', 'samsung', 'android'],
      specifications: [
        { key: 'Display', value: '6.4" Super AMOLED' },
        { key: 'RAM', value: '8GB' },
        { key: 'Storage', value: '128GB' },
        { key: 'Battery', value: '5000mAh' },
      ],
    },
    {
      name: 'JBL Tune 510BT Wireless Headphones',
      description: 'Enjoy 40 hours of pure bass sound with JBL Tune 510BT wireless headphones. Foldable design with Bluetooth 5.0, hands-free calls, and voice assistant support.',
      shortDescription: '40Hr battery, Pure Bass, Bluetooth 5.0, Foldable',
      price: 12500,
      discountPrice: 9900,
      category: electronics,
      brand: 'JBL',
      stock: 50,
      isFeatured: true,
      isNewArrival: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80' },
      ],
      tags: ['headphones', 'wireless', 'bluetooth', 'jbl'],
      specifications: [
        { key: 'Battery Life', value: '40 hours' },
        { key: 'Connectivity', value: 'Bluetooth 5.0' },
        { key: 'Driver Size', value: '32mm' },
      ],
    },
    {
      name: 'HP Pavilion 15 Laptop Core i5',
      description: 'Work and play efficiently with the HP Pavilion 15. Intel Core i5 12th gen processor, 8GB DDR4 RAM, 512GB SSD, 15.6" FHD display, and Windows 11 Home.',
      shortDescription: 'Intel i5 12th Gen, 8GB RAM, 512GB SSD, 15.6" FHD',
      price: 189900,
      discountPrice: 169900,
      category: electronics,
      brand: 'HP',
      stock: 10,
      isFeatured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80' },
      ],
      tags: ['laptop', 'hp', 'intel', 'windows'],
      specifications: [
        { key: 'Processor', value: 'Intel Core i5-1235U' },
        { key: 'RAM', value: '8GB DDR4' },
        { key: 'Storage', value: '512GB NVMe SSD' },
        { key: 'Display', value: '15.6" FHD IPS' },
        { key: 'OS', value: 'Windows 11 Home' },
      ],
    },
    {
      name: 'Sony WH-1000XM5 Noise Cancelling Headphones',
      description: 'Industry-leading noise cancellation with Sony\'s WH-1000XM5. 30-hour battery life, multipoint connection, speak-to-chat technology, and premium sound quality.',
      shortDescription: 'Best-in-class ANC, 30Hr battery, Multipoint connect',
      price: 55000,
      discountPrice: 48500,
      category: electronics,
      brand: 'Sony',
      stock: 15,
      isNewArrival: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80' },
      ],
      tags: ['headphones', 'sony', 'noise-cancelling', 'premium'],
    },
    {
      name: 'Xiaomi Redmi Watch 3 Active Smartwatch',
      description: 'Track your fitness and stay connected with Redmi Watch 3 Active. 1.83" HD display, 12-day battery, GPS, heart rate monitoring, 100+ workout modes.',
      shortDescription: '1.83" HD, 12-day battery, GPS, Health tracking',
      price: 9500,
      discountPrice: 7900,
      category: electronics,
      brand: 'Xiaomi',
      stock: 40,
      isNewArrival: true,
      isBestSeller: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80' },
      ],
      tags: ['smartwatch', 'xiaomi', 'fitness', 'gps'],
    },

    // Fashion
    {
      name: 'Men\'s Premium Cotton Oxford Shirt',
      description: 'Classic Oxford cotton shirt crafted from 100% premium combed cotton. Perfect for office, casual outings, and semi-formal events. Available in multiple colors.',
      shortDescription: '100% Premium Cotton, Regular Fit, Machine Washable',
      price: 3500,
      discountPrice: 2800,
      category: fashion,
      brand: 'Ceylon Threads',
      stock: 100,
      isFeatured: true,
      isBestSeller: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80' },
      ],
      tags: ['shirt', 'mens', 'cotton', 'formal'],
    },
    {
      name: 'Women\'s Floral Midi Dress',
      description: 'Elegant floral print midi dress perfect for everyday wear and special occasions. Made from breathable chiffon fabric with adjustable straps and invisible zip closure.',
      shortDescription: 'Chiffon fabric, Midi length, Floral print',
      price: 4800,
      discountPrice: 3900,
      category: fashion,
      brand: 'Island Chic',
      stock: 60,
      isFeatured: true,
      isNewArrival: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80' },
      ],
      tags: ['dress', 'womens', 'floral', 'casual'],
    },
    {
      name: 'Nike Air Max 270 Running Shoes',
      description: 'Experience maximum cushioning with Nike Air Max 270. Mesh upper for breathability, Air Max unit in the heel for comfort, and rubber outsole for durability.',
      shortDescription: 'Air Max cushioning, Mesh upper, Rubber outsole',
      price: 18500,
      discountPrice: 15900,
      category: fashion,
      brand: 'Nike',
      stock: 30,
      isBestSeller: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80' },
      ],
      tags: ['shoes', 'nike', 'running', 'sports'],
    },
    {
      name: 'Leather Bifold Wallet for Men',
      description: 'Slim and stylish genuine leather bifold wallet with RFID blocking technology. Features 6 card slots, 2 currency compartments, and ID window.',
      shortDescription: 'Genuine Leather, RFID Block, 6 Card Slots, Slim',
      price: 2900,
      discountPrice: 0,
      category: fashion,
      brand: 'Ceylon Leather Co.',
      stock: 75,
      images: [
        { url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80' },
      ],
      tags: ['wallet', 'leather', 'mens', 'rfid'],
    },

    // Home & Garden
    {
      name: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker',
      description: 'Replace 7 kitchen appliances with one. Pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker, and warmer. 5.7 litre capacity perfect for Sri Lankan families.',
      shortDescription: '7-in-1 functions, 5.7L capacity, 13 built-in programmes',
      price: 24500,
      discountPrice: 19900,
      category: homeGarden,
      brand: 'Instant Pot',
      stock: 20,
      isFeatured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80' },
      ],
      tags: ['kitchen', 'pressure cooker', 'appliance', 'cooking'],
    },
    {
      name: 'Tefal Non-Stick Frying Pan Set (3 Piece)',
      description: 'Premium non-stick frying pan set with Thermo-Spot technology that shows when the pan is at the perfect temperature. Dishwasher safe, PFOA free coating.',
      shortDescription: 'Thermo-Spot tech, 3-piece set, PFOA Free, Dishwasher safe',
      price: 8900,
      discountPrice: 7200,
      category: homeGarden,
      brand: 'Tefal',
      stock: 35,
      isBestSeller: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80' },
      ],
      tags: ['cookware', 'tefal', 'non-stick', 'kitchen'],
    },
    {
      name: 'Ceramic Planter Set for Indoor Plants',
      description: 'Set of 3 premium ceramic planters in modern minimalist design. Perfect for succulents, herbs, and small indoor plants. Comes with drainage holes and bamboo saucers.',
      shortDescription: 'Set of 3, Ceramic with drainage holes, Bamboo saucers',
      price: 2800,
      discountPrice: 0,
      category: homeGarden,
      brand: 'GreenSpace',
      stock: 60,
      isNewArrival: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&q=80' },
      ],
      tags: ['plants', 'ceramic', 'home decor', 'garden'],
    },
    {
      name: 'Dyson V8 Slim Cordless Vacuum Cleaner',
      description: 'Powerful cordless vacuum with up to 40 minutes of fade-free suction. Flexible reach under furniture, transforms to handheld for above-floor cleaning. HEPA filtration.',
      shortDescription: '40min battery, HEPA filter, Transforms to handheld',
      price: 85000,
      discountPrice: 74900,
      category: homeGarden,
      brand: 'Dyson',
      stock: 8,
      images: [
        { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
      ],
      tags: ['vacuum', 'dyson', 'cordless', 'cleaning'],
    },

    // Sports & Outdoor
    {
      name: 'Yonex Nanoray 10 Badminton Racket',
      description: 'Lightweight graphite badminton racket designed for fast play. Nanoray technology for maximum repulsion, 5U weight grade, and comes with full cover.',
      shortDescription: 'Graphite frame, Nanoray tech, 5U weight, With cover',
      price: 5900,
      discountPrice: 4800,
      category: sports,
      brand: 'Yonex',
      stock: 45,
      isBestSeller: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&q=80' },
      ],
      tags: ['badminton', 'yonex', 'racket', 'sports'],
    },
    {
      name: 'Yoga Mat Premium TPE Non-Slip',
      description: 'Eco-friendly TPE yoga mat with superior grip on both sides. 6mm thickness for joint protection, alignment lines for perfect positioning, and carrying strap included.',
      shortDescription: 'TPE material, 6mm thick, Double-sided grip, Alignment lines',
      price: 3200,
      discountPrice: 2500,
      category: sports,
      brand: 'ZenFlex',
      stock: 80,
      isNewArrival: true,
      isFeatured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1601925228520-b5cf2afb5718?w=600&q=80' },
      ],
      tags: ['yoga', 'fitness', 'mat', 'exercise'],
    },
    {
      name: 'Adjustable Dumbbell Set 2-24kg',
      description: 'Space-saving adjustable dumbbell set that replaces 15 sets of weights. Quick weight adjustment dial, durable chrome finish, comfortable handle grip. Perfect for home gym.',
      shortDescription: '2-24kg range, Quick adjust dial, Space-saving design',
      price: 32000,
      discountPrice: 28500,
      category: sports,
      brand: 'PowerFit',
      stock: 15,
      isFeatured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80' },
      ],
      tags: ['dumbbell', 'weights', 'gym', 'fitness'],
    },

    // Beauty & Health
    {
      name: 'Cetaphil Gentle Skin Cleanser 500ml',
      description: 'Dermatologist-recommended gentle cleanser for sensitive skin. Non-irritating, non-comedogenic formula that removes dirt and makeup without stripping natural oils.',
      shortDescription: 'For sensitive skin, Soap-free, Non-comedogenic, 500ml',
      price: 2800,
      discountPrice: 2400,
      category: beauty,
      brand: 'Cetaphil',
      stock: 100,
      isBestSeller: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1556228578-626a9065e43e?w=600&q=80' },
      ],
      tags: ['skincare', 'cleanser', 'cetaphil', 'sensitive skin'],
    },
    {
      name: 'L\'Oreal Paris Revitalift Serum',
      description: 'Anti-ageing face serum with 1.5% pure Hyaluronic Acid and Vitamin C. Clinically proven to reduce wrinkles, improve firmness, and intensely hydrate skin.',
      shortDescription: '1.5% Hyaluronic Acid, Vitamin C, Anti-ageing, 30ml',
      price: 4500,
      discountPrice: 3800,
      category: beauty,
      brand: "L'Oreal Paris",
      stock: 55,
      isNewArrival: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80' },
      ],
      tags: ['serum', 'loreal', 'anti-ageing', 'hyaluronic acid'],
    },
    {
      name: 'Himalaya Herbals Neem Face Wash 150ml',
      description: 'Purifying neem face wash that deeply cleanses skin and removes acne-causing bacteria. Enriched with Neem and Turmeric extracts for a clear, healthy complexion.',
      shortDescription: 'Neem & Turmeric, Anti-acne, Daily use, 150ml',
      price: 850,
      discountPrice: 0,
      category: beauty,
      brand: 'Himalaya',
      stock: 150,
      isBestSeller: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80' },
      ],
      tags: ['face wash', 'himalaya', 'neem', 'acne'],
    },
    {
      name: 'Vitamin C + Zinc Immune Support 60 Tablets',
      description: 'High-strength Vitamin C 1000mg with Zinc for immune system support. Slow-release formula for all-day protection. Suitable for adults, vegetarian capsules.',
      shortDescription: 'Vit C 1000mg + Zinc, Slow release, 60 Tablets, Veggie',
      price: 2200,
      discountPrice: 1850,
      category: beauty,
      brand: 'NutriLab',
      stock: 90,
      isNewArrival: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80' },
      ],
      tags: ['vitamins', 'supplements', 'immunity', 'health'],
    },
  ];
};

const seedDatabase = async () => {
  try {
    // Check MongoDB connection string
    if (!MONGO_URI) {
      throw new Error('MONGO_URI is missing in backend/.env');
    }

    console.log('🌱 Connecting to MongoDB...');

    await mongoose.connect(MONGO_URI);
    await Category.init();
    await Product.init();

    console.log('✅ Connected to MongoDB');

    // Create categories without deleting existing data
    console.log('📂 Creating categories...');

    const categoryIds = [];

    for (const category of categories) {
      let existingCategory = await Category.findOne({
        name: category.name,
      });

      if (!existingCategory) {
        existingCategory = await Category.create(category);

        console.log('✅ Category added:', category.name);
      } else {
        console.log('⏭️ Category already exists:', category.name);
      }

      categoryIds.push(existingCategory._id);
    }

    // Generate sample products
    console.log('📦 Creating products...');

    const products = generateProducts(categoryIds);

    let addedProducts = 0;
    let skippedProducts = 0;

    for (const product of products) {
      const existingProduct = await Product.findOne({
        name: product.name,
        category: product.category,
      });

      if (!existingProduct) {
        await Product.create(product);

        addedProducts++;

        console.log('✅ Product added:', product.name);
      } else {
        skippedProducts++;

        console.log('⏭️ Product already exists:', product.name);
      }
    }

    // Display final results
    console.log('\n🎉 Database seeded successfully!');
    console.log('=======================================');
    console.log('📂 Categories:       ', categoryIds.length);
    console.log('📦 Products added:   ', addedProducts);
    console.log('⏭️ Products skipped: ', skippedProducts);
    console.log('=======================================');

  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exitCode = 1;

  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
};

seedDatabase();
