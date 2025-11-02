const axios = require('axios');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持POST请求' });
  }

  try {
    const { article } = req.body;

    if (!article || article.trim().length === 0) {
      return res.status(400).json({ error: '请输入需要总结的文章' });
    }

    const prompt = `请总结以下文章的核心内容，保持简洁明了：\n\n${article}`;

    const axiosConfig = {
      method: 'post',
      url: `${process.env.OPENAI_BASE_URL}/v1/chat/completions`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      data: {
        messages: [
          { role: 'system', content: '你是一个专业的文章总结助手，擅长提炼核心观点。' },
          { role: 'user', content: prompt }
        ],
        model: process.env.OPENAI_MODEL,
        stream: true,
        response_format: { type: 'text' }
      },
      responseType: 'stream',
    };

    const response = await axios(axiosConfig);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    response.data.on('data', (chunk) => {
      const chunkStr = chunk.toString('utf8');
      const lines = chunkStr.split('\n').filter(line => line.trim());

      lines.forEach(line => {
        const cleanLine = line.replace(/^data: /, '');
        if (cleanLine === '[DONE]') return; 
        
        try {
          const parsed = JSON.parse(cleanLine);
          const content = parsed.choices[0]?.delta?.content;
          if (content) {
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
          }
        } catch (e) {
          console.debug('解析流式数据失败（可能是不完整片段）：', e);
        }
      });
    });

    response.data.on('end', () => {
      res.write('data: [DONE]\n\n');
      res.end();
    });

    response.data.on('error', (err) => {
      console.error('流式响应错误：', err);
      res.status(500).write(`data: ${JSON.stringify({ error: '总结过程出错' })}\n\n`);
      res.end();
    });

  } catch (error) {
    console.error('AI总结请求失败：', error.response?.data || error.message);
    const errorMsg = error.response?.data?.error?.message || '总结失败，请重试';
    res.status(500).json({ error: errorMsg });
  }
}