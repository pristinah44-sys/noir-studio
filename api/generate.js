const fetch = require('node-fetch');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    const apiKey = process.env.RUNWAY_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'Runway API key not configured' });
    }

    const runwayResponse = await fetch('https://api.dev.runwayml.com/v1/image_to_video', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06'
      },
      body: JSON.stringify({
        model: 'gen3a_turbo',
        promptText: prompt,
        duration: 5,
        ratio: '9:16'
      })
    });

    const data = await runwayResponse.json();

    if (!runwayResponse.ok) {
      throw new Error(data.error || 'Runway API error');
    }

    return res.status(200).json({
      taskId: data.id,
      status: 'processing'
    });

  } catch (error) {
    console.error('Generation error:', error);
    return res.status(500).json({ 
      error: 'Video generation failed',
      message: error.message 
    });
  }
};