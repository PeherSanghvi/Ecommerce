require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.collection('products');
  const fashionEmpty = await db.countDocuments({ department: 'Fashion', $or: [{images: {$size: 0}}, {images: null}] });
  console.log('Fashion products with NO images:', fashionEmpty);
  process.exit(0);
});
