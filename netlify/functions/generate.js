const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  var headers = {
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
    var prompt = body.prompt || "";
    var skinTone = body.skinTone || "medium";
    
    var apiKey = process.env.RUNWAY_API_KEY;
    
    if (!apiKey) {
      return { statusCode: 500, headers: headers, body: JSON.stringify({ error: "API key not configured" }) };
    }

    var fullPrompt = prompt + ", featuring hands with " + skinTone + " skin tone, ultra-realistic, 4K quality";

    var response = await fetch("https://api.dev.runwayml.com/v1/text_to_video", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json",
        "X-Runway-Version": "2024-11-06"
      },
      body: JSON.stringify({
        model: "veo3.1",
        promptText: fullPrompt,
        ratio: "720:1280",
        duration: 4
      })
    });

    var data = await response.json();
    
    console.log("Runway response:", JSON.stringify(data));

    if (data.id) {
      return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({ taskId: data.id, status: "processing" })
      };
    } else {
      return {
        statusCode: 500,
        headers: headers,
        body: JSON.stringify({ error: data.error || "No task ID returned", details: data })
      };
    }

  } catch (error) {
    return { statusCode: 500, headers: headers, body: JSON.stringify({ error: error.message }) };
  }
};
