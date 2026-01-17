const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: "Method not allowed" }) 
    };
  }

  try {
    const { prompt, skinTone, template } = JSON.parse(event.body);
    
    const apiKey = process.env.RUNWAY_API_KEY;
    
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "API key not configured" })
      };
    }

    // Build the full prompt
    const fullPrompt = `${prompt}, featuring hands with ${skinTone} skin tone, ultra-realistic, 4K quality`;

    // Call Runway API
    const response = await fetch("https://api.dev.runwayml.com/v1/text-to-video", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Runway-Version": "2024-11-06"
      },
      body: JSON.stringify({
        model: "gen3a_turbo",
        prompt: fullPrompt,
        duration: 5,
        ratio: "9:16"
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: data.error || "Runway API error" })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        taskId: data.id,
        status: "processing"
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

---

## 💾 WHAT TO DO:

1. Open **TextEdit**
2. **Format → Make Plain Text**
3. **Paste** the code from the white box above
4. **File → Save**
5. **Save As:** `generate.js`
6. **Where:** Save it in the **`netlify/functions`** folder (inside noir-studio)
7. Click **Save**

---

## ✅ YOUR FOLDER SHOULD NOW BE:
```
noir-studio/
  netlify/
    functions/
      generate.js    ← NEW FILE