import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import { serialize } from "next-mdx-remote/serialize";
import { calculateReadingTime } from "@/components/CalculateReadingTime";

const postsDirectory = path.join(process.cwd(), "data", "whims");

/**
 * 获取所有文章的元数据（不包含内容）
 * @param {boolean} sortByDate - 是否按日期排序
 * @param {boolean} descending - 是否降序排列
 * @returns {Promise<Array>} 文章元数据数组
 */
export async function getAllPosts(sortByDate = true, descending = true) {
  try {
    const filenames = await fs.readdir(postsDirectory);

    const posts = await Promise.all(
      filenames.map(async (filename) => {
        const slug = filename.replace(/\.mdx$/, "");

        const fullPath = path.join(postsDirectory, filename);
        const fileContents = await fs.readFile(fullPath, "utf8");

        const { data: frontmatter } = matter(fileContents);

        return {
          slug,
          frontmatter,
        };
      })
    );

    if (sortByDate) {
      return posts.sort((a, b) => {
        const dateA = new Date(a.frontmatter.date);
        const dateB = new Date(b.frontmatter.date);
        return descending ? dateB - dateA : dateA - dateB;
      });
    }

    return posts;
  } catch (error) {
    console.error("Error getting all posts:", error);
    return [];
  }
}

/**
 * 通过slug获取单篇文章的完整信息（包含内容）
 * @param {string} slug - 文章的slug
 * @returns {Promise<Object>} 包含元数据和内容的文章对象
 */
export async function getPostBySlug(slug) {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`);
    const fileContents = await fs.readFile(fullPath, "utf8");

    const { data: frontmatter, content } = matter(fileContents);

    const mdxSource = await serialize(content);
    const readingTime = await calculateReadingTime(content);

    return {
      slug,
      frontmatter,
      mdxSource,
      readingTime,
    };
  } catch (error) {
    console.error(`Error getting post with slug ${slug}:`, error);
    return null;
  }
}

/**
 * 获取最新的一篇文章（默认按日期降序排序后的第一篇）
 * @returns {Promise<Object>} 最新文章的完整信息
 */
export async function getLatestPost() {
  try {
    // 获取所有文章并按日期降序排序
    const posts = await getAllPosts(true, true);

    if (posts.length === 0) {
      return null;
    }

    // 获取排序后的第一篇文章的完整信息
    return getPostBySlug(posts[0].slug);
  } catch (error) {
    console.error("Error getting latest post:", error);
    return null;
  }
}

/**
 * 获取所有文章的路径参数，用于getStaticPaths
 * @returns {Promise<Array>} 包含所有文章slug的路径参数数组
 */
export async function getAllPostPaths() {
  try {
    const filenames = await fs.readdir(postsDirectory);

    return filenames.map((filename) => ({
      params: {
        slug: filename.replace(/\.mdx$/, ""),
      },
    }));
  } catch (error) {
    console.error("Error getting post paths:", error);
    return [];
  }
}
