const fetch = require('node-fetch');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET requests allowed' });
  }

  try {
    const { taskId } = req.query;
    
    if (!taskId) {
      return res.status(400).json({ error: 'Missing taskId' });
    }

    const apiKey = process.env.RUNWAY_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'Runway API key not configured' });
    }

    const response = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-Runway-Version': '2024-11-06'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Status check failed');
    }

    return res.status(200).json({
      taskId: taskId,
      status: data.status,
      progress: data.progress || 0,
      videoUrl: data.output ? data.output[0] : null,
      error: data.failure || null
    });

  } catch (error) {
    console.error('Status check error:', error);
    return res.status(500).json({ 
      error: 'Status check failed',
      message: error.message 
    });
  }
};