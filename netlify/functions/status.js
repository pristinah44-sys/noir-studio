const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const taskId = event.queryStringParameters.taskId;
    
    if (!taskId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing taskId" })
      };
    }

    const apiKey = process.env.RUNWAY_API_KEY;
    
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "API key not configured" })
      };
    }

    const response = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "X-Runway-Version": "2024-11-06"
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: data.error || "Status check failed" })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        taskId: taskId,
        status: data.status,
        progress: data.progress || 0,
        videoUrl: data.output ? data.output[0] : null
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
5. **Save As:** `status.js`
6. **Where:** Save it in the **`netlify/functions`** folder (same place as generate.js)
7. Click **Save**

---

## ✅ YOUR FOLDER SHOULD NOW BE:
```
noir-studio/
  netlify/
    functions/
      generate.js
      status.js      ← NEW FILE