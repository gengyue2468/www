import { serialize } from "next-mdx-remote/serialize";
import { calculateReadingTime } from "@/components/CalculateReadingTime";
import axios from "axios";

/**
 * 基础API请求函数
 * @param {string} url - 请求地址
 * @returns {Promise} 请求结果
 */
export const fetchApi = async (url) => {
  const response = await axios.get(url);
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`请求失败: ${response.statusText}`);
  }
  return response.data;
};

/**
 * 处理MDX内容（序列化+计算阅读时间）
 * @param {string} content - 原始MDX内容
 * @returns {Promise} 包含处理结果的对象
 */
export const processMdxContent = async (content) => {
  const readingTime = calculateReadingTime(content);
  const mdxSource = await serialize(content);
  return { mdxSource, readingTime };
};

/**
 * 格式化错误信息
 * @param {Error} error - 错误对象
 * @returns {string} 格式化后的错误信息
 */
export const formatError = (error) => {
  if (error.response) {
    return `请求失败: ${error.response.data.message || error.message}`;
  } else if (error.request) {
    return "网络错误，无法连接到服务器";
  } else {
    return error.message;
  }
};
    