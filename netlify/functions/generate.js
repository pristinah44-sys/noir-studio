const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    var body = JSON.parse(event.body);
    var prompt = body.prompt;
    var skinTone = body.skinTone;
    
    var apiKey = process.env.RUNWAY_API_KEY;
    
    if (!apiKey) {
      return { statusCode: 500, headers: headers, body: JSON.stringify({ error: "API key not configured" }) };
    }

    var fullPrompt = prompt + ", featuring hands with " + skinTone + " skin tone, ultra-realistic, 4K quality";

    var response = await fetch("https://api.dev.runwayml.com/v1/image_to_video", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json",
        "X-Runway-Version": "2024-11-06"
      },
      body: JSON.stringify({
        model: "gen3a_turbo",
        promptText: fullPrompt,
        duration: 5,
        ratio: "9:16"
      })
    });

    var data = await response.json();

    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({ taskId: data.id, status: "processing" })
    };

  } catch (error) {
    return { statusCode: 500, headers: headers, body: JSON.stringify({ error: error.message }) };
  }
};
