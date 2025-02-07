// seedProducts.js
const Product = require('./models/product.model'); // Adjust path as needed
const sequelize = require('./config/database'); // Adjust path as needed

const coffeeProducts = [
  {
    name: 'Colombian Supremo',
    description: 'A smooth medium roast with chocolatey notes and a clean finish.',
    price: 14.99,
    image: 'https://example.com/images/colombian-supremo.jpg',
    categories: ['Medium Roast', 'Colombian', 'Single Origin']
  },
  {
    name: 'Ethiopian Yirgacheffe',
    description: 'Floral aroma with bright citrus flavors and hints of blueberry.',
    price: 16.50,
    image: 'https://example.com/images/ethiopian-yirgacheffe.jpg',
    categories: ['Light Roast', 'Ethiopian', 'Single Origin']
  },
  {
    name: 'Kenyan AA',
    description: 'Vibrant acidity with notes of black currant and a rich aroma.',
    price: 17.00,
    image: 'https://example.com/images/kenyan-aa.jpg',
    categories: ['Medium Roast', 'Kenyan', 'Single Origin']
  },
  {
    name: 'Sumatra Mandheling',
    description: 'Earthy and bold with herbal notes, perfect for dark roast lovers.',
    price: 15.75,
    image: 'https://example.com/images/sumatra-mandheling.jpg',
    categories: ['Dark Roast', 'Sumatra', 'Single Origin']
  },
  {
    name: 'Guatemala Antigua',
    description: 'Delicate sweetness with hints of caramel and a smoky finish.',
    price: 13.99,
    image: 'https://example.com/images/guatemala-antigua.jpg',
    categories: ['Medium Roast', 'Guatemalan', 'Single Origin']
  },
  {
    name: 'Brazil Santos',
    description: 'Balanced, low acidity coffee with a nutty and chocolatey profile.',
    price: 12.50,
    image: 'https://example.com/images/brazil-santos.jpg',
    categories: ['Medium Roast', 'Brazilian']
  },
  {
    name: 'Honduras Marcala',
    description: 'Well-rounded body featuring sweet cocoa and mild fruity tones.',
    price: 14.00,
    image: 'https://example.com/images/honduras-marcala.jpg',
    categories: ['Medium Roast', 'Honduran', 'Organic']
  }
];

async function seedCoffeeProducts() {
  try {
    // Ensure the database connection is established
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Optionally, ensure the table is created (if not using migrations)
    // await sequelize.sync();

    // Insert multiple products in one go
    await Product.bulkCreate(coffeeProducts);

    console.log('Coffee products have been inserted successfully.');
  } catch (error) {
    console.error('Error inserting coffee products:', error);
  } finally {
    // Close the database connection if needed in a standalone script
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

// Execute the seeding function if this file is run directly
if (require.main === module) {
  seedCoffeeProducts();
}

module.exports = seedCoffeeProducts;
