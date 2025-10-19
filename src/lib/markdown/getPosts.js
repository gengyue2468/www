import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import { serialize } from "next-mdx-remote/serialize";
import { calculateReadingTime } from "@/lib/CalculateReadingTime";
import { remarkPlugins, rehypePlugins } from "@/lib/markdown/plugins";

const postsDirectory = path.join(process.cwd(), "data", "whims");

export async function getAllPosts(sortByDate = true, descending = true) {
  try {
    const filenames = await fs.readdir(postsDirectory);

    const posts = await Promise.all(
      filenames.map(async (filename) => {
        if (!filename.endsWith(".mdx")) return null;

        const slug = filename.replace(/\.mdx$/, "");
        const fullPath = path.join(postsDirectory, filename);
        const fileContents = await fs.readFile(fullPath, "utf8");

        const { data: frontmatter, content } = matter(fileContents);

        if (frontmatter.draft && process.env.NODE_ENV === "production") {
          return null;
        }

        const readingTime = await calculateReadingTime(content);

        return {
          slug,
          frontmatter,
          content,
          readingTime,
        };
      })
    );
    const filteredPosts = posts.filter((post) => post !== null);

    if (sortByDate) {
      return filteredPosts.sort((a, b) => {
        const dateA = new Date(a.frontmatter.date);
        const dateB = new Date(b.frontmatter.date);
        return descending ? dateB - dateA : dateA - dateB;
      });
    }

    return filteredPosts;
  } catch (error) {
    console.error("Error getting all posts:", error);
    return [];
  }
}

export async function getPostBySlug(slug) {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`);
    const fileContents = await fs.readFile(fullPath, "utf8");

    const { data: frontmatter, content } = matter(fileContents);

    const mdxSource = await serialize(content, {
      mdxOptions: {
        remarkPlugins,
        rehypePlugins,
      },
    });

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

export async function getLatestPost() {
  try {
    const posts = await getAllPosts(true, true);

    if (posts.length === 0) {
      return null;
    }
    return getPostBySlug(posts[0].slug);
  } catch (error) {
    console.error("Error getting latest post:", error);
    return null;
  }
}

export async function getAllPostPaths() {
  try {
    const filenames = await fs.readdir(postsDirectory);
    const mdxFiles = filenames.filter((filename) => filename.endsWith(".mdx"));

    return mdxFiles.map((filename) => ({
      params: {
        slug: filename.replace(/\.mdx$/, ""),
      },
    }));
  } catch (error) {
    console.error("Error getting post paths:", error);
    return [];
  }
}

export async function getPostsByTag(tag) {
  try {
    const allPosts = await getAllPosts();
    return allPosts.filter(
      (post) => post.frontmatter.tags && post.frontmatter.tags.includes(tag)
    );
  } catch (error) {
    console.error(`Error getting posts with tag ${tag}:`, error);
    return [];
  }
}
