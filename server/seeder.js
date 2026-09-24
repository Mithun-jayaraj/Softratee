const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Product = require('./models/product');
const User = require('./models/user');
const Category = require('./models/category');
dotenv.config();
const importData = async () => {
  try {
    await connectDB();
    await Product.deleteMany();
    await Category.deleteMany();
    let adminUser = await User.findOne({ email: 'softraadmin@gmail.com' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Softra Admin',
        email: 'softraadmin@gmail.com',
        password: 'admin123', 
        isAdmin: true
      });
      console.log('Demo Admin Account Created');
    }
    let normalUser = await User.findOne({ email: 'softrauser@gmail.com' });
    if (!normalUser) {
      normalUser = await User.create({
        name: 'Softra User',
        email: 'softrauser@gmail.com',
        password: 'user123', 
        isAdmin: false
      });
      console.log('Demo User Account Created');
    }
    let userId = adminUser._id;
    const createdCategories = await Category.insertMany([
      { name: 'Men', description: 'Men clothing' },
      { name: 'Women', description: 'Women clothing' },
      { name: 'Kids', description: 'Kids clothing' }
    ]);
    const sampleProducts = [
      {
        user: userId,
        name: 'Men\'s Classic Premium T-Shirt',
        type: 'Classic',
        isNewProduct: true,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'A high-quality, ultra-soft classic blank t-shirt.',
        category: createdCategories[0]._id,
        price: 19.99,
        countInStock: 100,
        sizes: ['S', 'M', 'L', 'XL']
      },
      {
        user: userId,
        name: 'Men\'s Oversized Streetwear Tee',
        type: 'Oversized',
        isNewProduct: true,
        image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Trendy oversized drop-shoulder t-shirt for a relaxed fit.',
        category: createdCategories[0]._id,
        price: 24.99,
        countInStock: 80,
        sizes: ['S', 'M', 'L', 'XL']
      },
      {
        user: userId,
        name: 'Men\'s Graphic Vintage Tee',
        type: 'Graphic',
        isNewProduct: false,
        image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Vintage wash graphic t-shirt with a retro aesthetic.',
        category: createdCategories[0]._id,
        price: 29.99,
        countInStock: 50,
        sizes: ['S', 'M', 'L', 'XL']
      },
      {
        user: userId,
        name: 'Men\'s Premium Cotton Polo',
        type: 'Polo',
        isNewProduct: false,
        image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Smart-casual premium polo shirt.',
        category: createdCategories[0]._id,
        price: 34.99,
        countInStock: 120,
        sizes: ['S', 'M', 'L', 'XL']
      },
      {
        user: userId,
        name: 'Men\'s Casual V-Neck',
        type: 'Casual',
        isNewProduct: false,
        image: 'https://images.unsplash.com/photo-1588145265551-fb18e8df6ff8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Soft casual v-neck for everyday wear.',
        category: createdCategories[0]._id,
        price: 18.99,
        countInStock: 90,
        sizes: ['S', 'M', 'L', 'XL']
      },
      {
        user: userId,
        name: 'Men\'s Printed Summer Tee',
        type: 'Printed',
        isNewProduct: true,
        image: 'https://images.unsplash.com/photo-1618517351616-3898bd307a52?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Lightweight printed tee perfect for summer.',
        category: createdCategories[0]._id,
        price: 22.99,
        countInStock: 60,
        sizes: ['M', 'L', 'XL']
      },
      {
        user: userId,
        name: 'Men\'s Essential Henley',
        type: 'Casual',
        isNewProduct: false,
        image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Classic three-button henley shirt.',
        category: createdCategories[0]._id,
        price: 26.99,
        countInStock: 45,
        sizes: ['S', 'M', 'L', 'XL']
      },
      {
        user: userId,
        name: 'Women\'s Basic Cotton Tee',
        type: 'Basic',
        isNewProduct: true,
        image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'A comfortable, basic t-shirt for women.',
        category: createdCategories[1]._id,
        price: 17.99,
        countInStock: 150,
        sizes: ['XS', 'S', 'M', 'L']
      },
      {
        user: userId,
        name: 'Women\'s Fitted Ribbed Tee',
        type: 'Fitted',
        isNewProduct: false,
        image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Flattering fitted ribbed t-shirt.',
        category: createdCategories[1]._id,
        price: 21.99,
        countInStock: 110,
        sizes: ['XS', 'S', 'M', 'L']
      },
      {
        user: userId,
        name: 'Women\'s Oversized Lounge Tee',
        type: 'Oversized',
        isNewProduct: true,
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Cozy oversized tee for lounging or casual outings.',
        category: createdCategories[1]._id,
        price: 25.99,
        countInStock: 75,
        sizes: ['S', 'M', 'L']
      },
      {
        user: userId,
        name: 'Women\'s Graphic Art Tee',
        type: 'Graphic',
        isNewProduct: false,
        image: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Artistic graphic print t-shirt.',
        category: createdCategories[1]._id,
        price: 28.99,
        countInStock: 40,
        sizes: ['XS', 'S', 'M', 'L']
      },
      {
        user: userId,
        name: 'Women\'s Summer Crop Tee',
        type: 'Crop',
        isNewProduct: false,
        image: 'https://images.unsplash.com/photo-1504198458649-3128b932f49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Stylish and breathable crop-style t-shirt.',
        category: createdCategories[1]._id,
        price: 19.99,
        countInStock: 85,
        sizes: ['XS', 'S', 'M']
      },
      {
        user: userId,
        name: 'Women\'s Premium Silk-Blend Tee',
        type: 'Premium',
        isNewProduct: true,
        image: 'https://images.unsplash.com/photo-1588117260145-b472942d45b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Luxurious silk-blend premium t-shirt.',
        category: createdCategories[1]._id,
        price: 45.99,
        countInStock: 30,
        sizes: ['S', 'M', 'L']
      },
      {
        user: userId,
        name: 'Women\'s Casual Striped Tee',
        type: 'Casual',
        isNewProduct: false,
        image: 'https://images.unsplash.com/photo-1551048600-b63038ce02f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Classic striped casual t-shirt.',
        category: createdCategories[1]._id,
        price: 22.99,
        countInStock: 65,
        sizes: ['XS', 'S', 'M', 'L']
      },
      {
        user: userId,
        name: 'Kids\' Basic Play Tee',
        type: 'Basic',
        isNewProduct: false,
        image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Durable basic t-shirt for everyday play.',
        category: createdCategories[2]._id,
        price: 14.99,
        countInStock: 200,
        sizes: ['4Y', '6Y', '8Y', '10Y']
      },
      {
        user: userId,
        name: 'Kids\' Printed Dinosaur Tee',
        type: 'Printed',
        isNewProduct: true,
        image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Fun printed t-shirt featuring dinosaur patterns.',
        category: createdCategories[2]._id,
        price: 18.99,
        countInStock: 120,
        sizes: ['4Y', '6Y', '8Y', '10Y']
      },
      {
        user: userId,
        name: 'Kids\' Graphic Superhero Tee',
        type: 'Graphic',
        isNewProduct: true,
        image: 'https://images.unsplash.com/photo-1560506840-0ca1a87b140f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Cool graphic tee for little superheroes.',
        category: createdCategories[2]._id,
        price: 19.99,
        countInStock: 95,
        sizes: ['4Y', '6Y', '8Y']
      },
      {
        user: userId,
        name: 'Kids\' Casual Stripe Tee',
        type: 'Casual',
        isNewProduct: false,
        image: 'https://images.unsplash.com/photo-1621644131557-61cbf587c6aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Comfortable casual striped t-shirt.',
        category: createdCategories[2]._id,
        price: 16.99,
        countInStock: 110,
        sizes: ['4Y', '6Y', '8Y', '10Y']
      },
      {
        user: userId,
        name: 'Kids\' Cartoon Character Tee',
        type: 'Cartoon',
        isNewProduct: false,
        image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Cute cartoon character illustration tee.',
        category: createdCategories[2]._id,
        price: 17.99,
        countInStock: 80,
        sizes: ['4Y', '6Y', '8Y']
      },
      {
        user: userId,
        name: 'Kids\' Active Sports Tee',
        type: 'Sports',
        isNewProduct: false,
        image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Breathable sports t-shirt for active kids.',
        category: createdCategories[2]._id,
        price: 20.99,
        countInStock: 70,
        sizes: ['6Y', '8Y', '10Y', '12Y']
      }
    ];
    await Product.insertMany(sampleProducts);
    console.log('Data Imported successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
importData();
