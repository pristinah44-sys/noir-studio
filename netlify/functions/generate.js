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
    var prompt = body.prompt;
    var skinTone = body.skinTone;
    
    var apiKey = process.env.RUNWAY_API_KEY;
    
    if (!apiKey) {
      return { statusCode: 500, headers: headers, body: JSON.stringify({ error: "API key not configured" }) };
    }

    // Map skin tone to image filename
    var imageMap = {
      "Fair Cool": "01-fair-cool.png",
      "Fair Warm": "02-fair-warm.png",
      "Fair Neutral": "03-fair-neutral.png",
      "Medium Cool": "04-medium-cool.png",
      "Medium Warm": "05-medium-warm.png",
      "Medium Olive": "06-medium-olive.png",
      "Tan": "07-tan.png",
      "Deep Cool": "08-deep-cool.png",
      "Deep Warm": "09-deep-warm.png",
      "Deep Rich": "10-deep-rich.png",
      "Very Deep Cool": "11-very-deep-cool.png",
      "Very Deep Rich": "12-very-deep-rich.png"
    };

    var imageFile = imageMap[skinTone] || "07-tan.png";
    var imageUrl = "https://raw.githubusercontent.com/pristinah44-sys/noir-studio/main/images/hands/" + imageFile;

    var response = await fetch("https://api.dev.runwayml.com/v1/image_to_video", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json",
        "X-Runway-Version": "2024-11-06"
      },
      body: JSON.stringify({
        model: "gen3a_turbo",
        promptImage: imageUrl,
        promptText: prompt,
        duration: 5,
        ratio: "720:1280"
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
