import axios from "axios";
import crypto from "crypto";

// 生成slug的唯一哈希标识（用于匹配Issue）
const generateSlugHash = (slug) => {
  // 创建一个短哈希，避免GitHub标题过长
  return crypto.createHash("md5").update(slug).digest("hex").slice(0, 8);
};

/**
 * 自动根据slug获取对应的GitHub Issue编号
 * 不存在则自动创建，无需手动维护映射关系
 * @param {string} slug - 文章的slug
 * @param {string} title - 文章标题（用于创建Issue时的标题）
 * @returns {number|null} 对应的GitHub Issue编号
 */
export async function autoMapSlugToIssue(slug, title) {
  if (!slug || !title) {
    console.error("缺少必要参数：slug和title都是必需的");
    return null;
  }

  // 生成唯一标识，用于在GitHub中识别该slug对应的Issue
  const slugHash = generateSlugHash(slug);
  const issueTag = `[COMMENT-MAP:${slugHash}]`; // 用于搜索的标记

  try {
    // 1. 先在GitHub仓库中搜索是否已有对应Issue
    const searchResponse = await axios.get(
      `https://api.github.com/search/issues?q=${encodeURIComponent(
        `${issueTag} repo:${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}`
      )}`,
      {
        headers: {
          Authorization: process.env.GITHUB_TOKEN
            ? `token ${process.env.GITHUB_TOKEN}`
            : undefined,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Next.js Auto Comment System",
        },
      }
    );

    // 2. 如果找到现有Issue，直接返回其编号
    if (searchResponse.data.total_count > 0) {
      const existingIssue = searchResponse.data.items[0];
      return existingIssue.number;
    }

    // 3. 如果没有找到，创建新的Issue
    const createResponse = await axios.post(
      `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/issues`,
      {
        title: `评论区：${title} ${issueTag}`, // 包含哈希标记，便于未来搜索
        body: `这是自动创建的评论区Issue，对应文章：
- Slug: ${slug}
- 自动生成时间: ${new Date().toISOString()}
- 请勿删除此Issue，否则评论将丢失`,
        labels: ["comments", "auto-generated"], // 添加标签便于管理
      },
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`, // 创建Issue需要token
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Next.js Auto Comment System",
        },
      }
    );

    // 4. 返回新创建的Issue编号
    return createResponse.data.number;
  } catch (error) {
    console.error("自动映射slug到Issue失败:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return null;
  }
}
