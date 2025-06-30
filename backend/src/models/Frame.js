import mongoose from 'mongoose'

const sizePriceSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    default: 10, // Default stock for each size
  }
})

const frameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  overlayUrl: {
    type: String,
    required: true,
  },
  sizesWithPrices: [sizePriceSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model('Frame', frameSchema) 