import express from 'express'
import Frame from '../models/Frame.js'
import multer from 'multer'
import path from 'path'

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  },
})

const upload = multer({ storage })

// GET all frames
router.get('/', async (req, res) => {
  try {
    const frames = await Frame.find()
    console.log('Raw Frames from DB:', JSON.stringify(frames, null, 2)); // Debug line
    
    // Since overlayUrl is already stored with full URL, we don't need to modify it
    const fullFrames = frames.map(frame => frame.toObject());

    console.log('Processed Frames:', JSON.stringify(fullFrames, null, 2)); // Debug line
    res.json(fullFrames)
  } catch (error) {
    console.error('Error fetching frames:', error); // Debug line
    res.status(500).json({ message: error.message })
  }
})

// GET frame by ID
router.get('/:id', async (req, res) => {
  try {
    const frame = await Frame.findById(req.params.id);
    
    if (!frame) {
      console.log(`Frame with ID ${req.params.id} not found`);
      return res.status(404).json({ message: 'Frame not found' });
    }

    console.log(`Found frame by ID ${req.params.id}:`, frame);
    res.json(frame);
  } catch (error) {
    console.error(`Error fetching frame ${req.params.id}:`, error);
    res.status(500).json({ message: error.message });
  }
});

// POST new frame
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, sizesWithPrices } = req.body
    const overlayUrl = `/uploads/${req.file.filename}`

    const frame = new Frame({
      name,
      overlayUrl,
      sizesWithPrices: JSON.parse(sizesWithPrices),
    })

    const newFrame = await frame.save()
    res.status(201).json(newFrame)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

export default router
