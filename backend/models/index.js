const User = require('./user.model');
const Product = require('./product.model');
const CartItem = require('./cart.model');
const Review = require('./review.model');

// Define associations
CartItem.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(CartItem, { foreignKey: 'productId' });

CartItem.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(CartItem, { foreignKey: 'userId' });

// Review associations
Review.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(Review, { foreignKey: 'productId' });

Review.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Review, { foreignKey: 'userId' });

module.exports = {
    User,
    Product,
    CartItem,
    Review
}; 