const OpenAI = require("openai");
const { Product } = require("../src/models");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Make sure you have this in .env
});

async function generateProducts() {
  const prompt = `
Generate a JSON array of 15 recommended wellness products. Each should have:
- name
- brand (string like "CeraVe", "Now Foods", etc.)
- description (2-3 lines)
- tags (array like ["eczema", "anxiety", etc.])
- conditionTags (array like ["Eczema", "Anxiety", "PCOS", etc.] - use proper condition names)
- recommendedByAI (true or false)
- price (decimal number like 25.99)
- category (string like "skincare", "supplements", "sleep", etc.)

Focus on health topics like eczema, sleep, anxiety, gut, PMS, acne, PCOS, stress, inflammation.
Be realistic but concise. Return only valid JSON array.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.choices[0].message.content;
    console.log("OpenAI Response:", text);
    
    const products = JSON.parse(text);

    for (const item of products) {
      await Product.create({
        name: item.name,
        brand: item.brand || 'Unknown Brand',
        description: item.description,
        tags: item.tags || [],
        conditionTags: item.conditionTags || [],
        upvotes: Math.floor(Math.random() * 200) + 10,
        rating: (Math.random() * 1.5 + 3.5).toFixed(1), // Random rating between 3.5-5.0
        useCount: Math.floor(Math.random() * 1000) + 100,
        comments: Math.floor(Math.random() * 50) + 5,
        recommendedByAI: item.recommendedByAI || true,
        price: item.price || null,
        category: item.category || 'wellness'
      });
    }

    console.log("✅ Products added from OpenAI!");
  } catch (err) {
    console.error("❌ Error parsing OpenAI response or inserting into DB:", err.message);
    if (err.response) {
      console.log("Full response:", err.response.data);
    }
  }
}

generateProducts(); 