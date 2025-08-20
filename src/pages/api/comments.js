// pages/api/comments/index.js
import axios from 'axios';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req, res) {
  const allowedMethods = ['POST', 'GET', 'OPTIONS'];
  
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', allowedMethods);
    return res.status(200).end();
  }
  
  if (!allowedMethods.includes(req.method)) {
    res.setHeader('Allow', allowedMethods);
    return res.status(405).json({ 
      message: `Method not allowed. Allowed methods: ${allowedMethods.join(', ')}` 
    });
  }

  // 处理GET请求 - 获取评论
  if (req.method === 'GET') {
    const { slug } = req.query;
    
    if (!slug) {
      return res.status(400).json({ 
        message: 'Missing required parameter: slug'
      });
    }

    try {
      // 搜索包含该slug标签的issue
      const searchResponse = await axios.get(
        `https://api.github.com/search/issues?q=repo:${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}+label:${slug}+state:open`,
        {
          headers: {
            Authorization: process.env.GITHUB_TOKEN ? `token ${process.env.GITHUB_TOKEN}` : undefined,
            'Accept': 'application/vnd.github.v3+json',
          }
        }
      );

      // 如果没有找到issue，返回空数组
      if (searchResponse.data.items.length === 0) {
        return res.status(200).json([]);
      }

      const issueNumber = searchResponse.data.items[0].number;
      
      // 获取该issue的评论
      const commentsResponse = await axios.get(
        `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/issues/${issueNumber}/comments`,
        {
          headers: {
            Authorization: process.env.GITHUB_TOKEN ? `token ${process.env.GITHUB_TOKEN}` : undefined,
            'Accept': 'application/vnd.github.v3+json',
          }
        }
      );

      return res.status(200).json(commentsResponse.data);
    } catch (error) {
      console.error('Error fetching comments:', error.response?.data || error.message);
      return res.status(500).json({ 
        message: 'Failed to fetch comments',
        error: error.response?.data || error.message
      });
    }
  }

  // 处理POST请求 - 创建评论
  if (req.method === 'POST') {
    const { slug, body } = req.body;
    
    // 验证参数
    if (!slug || !body) {
      return res.status(400).json({ 
        message: 'Missing required parameters: slug and body are required'
      });
    }

    // 验证用户身份
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      // 搜索包含该slug标签的issue
      const searchResponse = await axios.get(
        `https://api.github.com/search/issues?q=repo:${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}+label:${slug}+state:open`,
        {
          headers: {
            Authorization: process.env.GITHUB_TOKEN ? `token ${process.env.GITHUB_TOKEN}` : undefined,
            'Accept': 'application/vnd.github.v3+json',
          }
        }
      );

      let issueNumber;

      // 如果没有找到issue，创建一个新的
      if (searchResponse.data.items.length === 0) {
        const issueResponse = await axios.post(
          `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/issues`,
          {
            title: `Comments for: ${slug}`,
            body: `This issue is used to store comments for the blog post with slug: ${slug}`,
            labels: [slug, 'comments'],
          },
          {
            headers: {
              Authorization: `token ${process.env.GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json',
            }
          }
        );

        issueNumber = issueResponse.data.number;
      } else {
        issueNumber = searchResponse.data.items[0].number;
      }

      // 在评论中添加用户标识
      const commentBody = body;
      
      // 创建评论
      const response = await axios.post(
        `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/issues/${issueNumber}/comments`,
        { body: commentBody },
        {
          headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
          }
        }
      );

      return res.status(201).json(response.data);
    } catch (error) {
      console.error('Error creating comment:', error.response?.data || error.message);
      return res.status(500).json({ 
        message: 'Failed to create comment',
        error: error.response?.data || error.message
      });
    }
  }
}
    
