// backend/seeder.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Frame from './src/models/Frame.js';

dotenv.config();

const frames = [
  {
    name: "Vintage Golden",
    overlayUrl: "/uploads/Vintage_Gold_Frame_Overlay.png",
    sizesWithPrices: [
    { "label": "4x6", "price": 299 },
    { "label": "6x8", "price": 349 },
    { "label": "8x10", "price": 399 },
    { "label": "8x12", "price": 499 },
    { "label": "10x12", "price": 549 },
    { "label": "12x15", "price": 649 },
    { "label": "12x18", "price": 899 },
    { "label": "14x20", "price": 1199 },
    { "label": "6x36", "price": 1099 }
    ]
    },
    {
      name: "Smoked Mahogany",
      overlayUrl: "/uploads/Smoked_Mahogany_Frame_Overlay.png",
      sizesWithPrices: [
      { "label": "4x6", "price": 299 },
      { "label": "6x8", "price": 349 },
      { "label": "8x10", "price": 399 },
      { "label": "8x12", "price": 499 },
      { "label": "10x12", "price": 549 },
      { "label": "12x15", "price": 649 },
      { "label": "12x18", "price": 899 },
      { "label": "14x20", "price": 1199 },
      { "label": "6x36", "price": 1099 }
      ]
      },
      {
        name: "Rustic Oak",
        overlayUrl: "/uploads/Rustic_Oak_Frame_Overlay.png",
        sizesWithPrices: [
        { "label": "4x6", "price": 299 },
        { "label": "6x8", "price": 349 },
        { "label": "8x10", "price": 399 },
        { "label": "8x12", "price": 499 },
        { "label": "10x12", "price": 549 },
        { "label": "12x15", "price": 649 },
        { "label": "12x18", "price": 899 },
        { "label": "14x20", "price": 1199 },
        { "label": "6x36", "price": 1099 }
        ]
        },
        {
          name: "Modern Walnut",
          overlayUrl: "/uploads/Modern_Walnut_Frame_Overlay.png",
          sizesWithPrices: [
          { "label": "4x6", "price": 299 },
          { "label": "6x8", "price": 349 },
          { "label": "8x10", "price": 399 },
          { "label": "8x12", "price": 499 },
          { "label": "10x12", "price": 549 },
          { "label": "12x15", "price": 649 },
          { "label": "12x18", "price": 899 },
          { "label": "14x20", "price": 1199 },
          { "label": "6x36", "price": 1099 }
          ]
          },
          {
            name: "Minimalist Acrylic",
            overlayUrl: "/uploads/Minimalist_Acrylic_Frame_Overlay.png",
            sizesWithPrices: [
            { "label": "4x6", "price": 299 },
            { "label": "6x8", "price": 349 },
            { "label": "8x10", "price": 399 },
            { "label": "8x12", "price": 499 },
            { "label": "10x12", "price": 549 },
            { "label": "12x15", "price": 649 },
            { "label": "12x18", "price": 899 },
            { "label": "14x20", "price": 1199 },
            { "label": "6x36", "price": 1099 }
            ]
            },
            {
              name: "Industrial Grey Metal",
              overlayUrl: "/uploads/Industrial_Grey_Metal_Frame_Overlay.png",
              sizesWithPrices: [
              { "label": "4x6", "price": 299 },
              { "label": "6x8", "price": 349 },
              { "label": "8x10", "price": 399 },
              { "label": "8x12", "price": 499 },
              { "label": "10x12", "price": 549 },
              { "label": "12x15", "price": 649 },
              { "label": "12x18", "price": 899 },
              { "label": "14x20", "price": 1199 },
              { "label": "6x36", "price": 1099 }
              ]
              },
              {
                name: "Cottage White",
                overlayUrl: "/uploads/Cottage_White_Frame_Overlay.png",
                sizesWithPrices: [
                { "label": "4x6", "price": 299 },
                { "label": "6x8", "price": 349 },
                { "label": "8x10", "price": 399 },
                { "label": "8x12", "price": 499 },
                { "label": "10x12", "price": 549 },
                { "label": "12x15", "price": 649 },
                { "label": "12x18", "price": 899 },
                { "label": "14x20", "price": 1199 },
                { "label": "6x36", "price": 1099 }
                ]
                },
                {
                  name: "Classic Golden",
                  overlayUrl: "/uploads/classic_golden_frame_overlay.png",
                  sizesWithPrices: [
                  { "label": "4x6", "price": 299 },
                  { "label": "6x8", "price": 349 },
                  { "label": "8x10", "price": 399 },
                  { "label": "8x12", "price": 499 },
                  { "label": "10x12", "price": 549 },
                  { "label": "12x15", "price": 649 },
                  { "label": "12x18", "price": 899 },
                  { "label": "14x20", "price": 1199 },
                  { "label": "6x36", "price": 1099 }
                  ]
                  },
                  {
                    name: "Black Matte",
                    overlayUrl: "/uploads/Black_Matte_Frame_Overlay.png",
                    sizesWithPrices: [
                    { "label": "4x6", "price": 299 },
                    { "label": "6x8", "price": 349 },
                    { "label": "8x10", "price": 399 },
                    { "label": "8x12", "price": 499 },
                    { "label": "10x12", "price": 549 },
                    { "label": "12x15", "price": 649 },
                    { "label": "12x18", "price": 899 },
                    { "label": "14x20", "price": 1199 },
                    { "label": "6x36", "price": 1099 }
                    ]
                    },
                    {
                      name: "Bamboo Natural",
                      overlayUrl: "/uploads/Bamboo_Natural_Frame_Overlay.png",
                      sizesWithPrices: [
                      { "label": "4x6", "price": 299 },
                      { "label": "6x8", "price": 349 },
                      { "label": "8x10", "price": 399 },
                      { "label": "8x12", "price": 499 },
                      { "label": "10x12", "price": 549 },
                      { "label": "12x15", "price": 649 },
                      { "label": "12x18", "price": 899 },
                      { "label": "14x20", "price": 1199 },
                      { "label": "6x36", "price": 1099 }
                      ]
                      }
                    ];

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing data
    await Frame.deleteMany();
    console.log('Cleared existing frames');
    
    // Validate frames before insertion
    const validatedFrames = frames.map(frame => {
      if (!frame.overlayUrl) {
        console.error(`Invalid frame: ${frame.name} - missing overlayUrl`);
        return null;
      }
      return frame;
    }).filter(frame => frame !== null);
    
    // Insert validated frames
    const result = await Frame.insertMany(validatedFrames);
    console.log(`Successfully inserted ${result.length} frames`);
    
    // Verify the inserted data
    const insertedFrames = await Frame.find();
    console.log('Inserted frames:', JSON.stringify(insertedFrames, null, 2));
    
    process.exit();
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

importData();
