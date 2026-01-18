const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: headers, body: "" };
  }

  try {
    var taskId = event.queryStringParameters.taskId;
    
    if (!taskId) {
      return { statusCode: 400, headers: headers, body: JSON.stringify({ error: "Missing taskId" }) };
    }

    var apiKey = process.env.RUNWAY_API_KEY;
    
    if (!apiKey) {
      return { statusCode: 500, headers: headers, body: JSON.stringify({ error: "API key not configured" }) };
    }

    var response = await fetch("https://api.dev.runwayml.com/v1/tasks/" + taskId, {
      headers: {
        "Authorization": "Bearer " + apiKey,
        "X-Runway-Version": "2024-11-06"
      }
    });

    var data = await response.json();

    var videoUrl = null;
    if (data.output && data.output.length > 0) {
      videoUrl = data.output[0];
    }

    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({
        taskId: taskId,
        status: data.status,
        progress: data.progress || 0,
        videoUrl: videoUrl
      })
    };

  } catch (error) {
    return { statusCode: 500, headers: headers, body: JSON.stringify({ error: error.message }) };
  }
};
