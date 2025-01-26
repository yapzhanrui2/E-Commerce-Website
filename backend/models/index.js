const User = require('./user.model');
const Product = require('./product.model');
const CartItem = require('./cart.model');

// Define associations
CartItem.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(CartItem, { foreignKey: 'productId' });

CartItem.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(CartItem, { foreignKey: 'userId' });

module.exports = {
    User,
    Product,
    CartItem
}; 