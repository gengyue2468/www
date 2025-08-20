import { useState, useEffect, useRef } from "react";
import { useSession, signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import axios from "axios";
import {
  BanIcon,
  CommentIcon,
  GitHubIcon,
  MarkdownIcon,
  SendIcon,
  SmileIcon,
} from "./Icon";
import moment from "moment";
import MdxContent from "./MdxContent";
import { serialize } from "next-mdx-remote/serialize";
import { remarkPlugins, rehypePlugins } from "@/lib/markdown/plugins";
import Wrapper from "./Wrapper";
import remarkGemoji from "remark-gemoji";

const EMOJI_LIST = [
  { code: ":smile:", symbol: "😊" },
  { code: ":laughing:", symbol: "😆" },
  { code: ":heart:", symbol: "❤️" },
  { code: ":thumbsup:", symbol: "👍" },
  { code: ":thumbsdown:", symbol: "👎" },
  { code: ":thinking:", symbol: "🤔" },
  { code: ":tada:", symbol: "🎉" },
  { code: ":rocket:", symbol: "🚀" },
  { code: ":fire:", symbol: "🔥" },
  { code: ":star:", symbol: "⭐" },
  { code: ":question:", symbol: "❓" },
  { code: ":exclamation:", symbol: "❗" },
  { code: ":clap:", symbol: "👏" },
  { code: ":100:", symbol: "💯" },
  { code: ":cool:", symbol: "😎" },
  { code: ":sad:", symbol: "😢" },
  { code: ":angry:", symbol: "😠" },
  { code: ":surprised:", symbol: "😮" },
  { code: ":wink:", symbol: "😉" },
  { code: ":ok_hand:", symbol: "👌" },
];

// 表情符号转换函数
const convertEmojis = (text) => {
  if (!text) return text;
  let converted = text;
  EMOJI_LIST.forEach(emoji => {
    // 使用单词边界正则表达式确保只匹配完整的表情代码
    const regex = new RegExp(`\\b${emoji.code}\\b`, 'g');
    converted = converted.replace(regex, emoji.symbol);
  });
  return converted;
};

export default function CommentSystem({ slug }) {
  const { data: session, status } = useSession();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);

  // 处理评论的MDX序列化
  const processComments = async (rawComments) => {
    try {
      // 先转换表情符号
      const commentsWithEmojis = rawComments.map(comment => ({
        ...comment,
        body: convertEmojis(comment.body)
      }));

      // 然后进行MDX序列化
      const processedComments = await Promise.all(
        commentsWithEmojis.map(async (comment) => ({
          ...comment,
          mdxSource: await serialize(comment.body, {
            mdxOptions: {
              remarkPlugins,
              rehypePlugins,
            },
          }),
        }))
      );
      return processedComments;
    } catch (err) {
      console.error("处理评论MDX失败：", err);
      // 如果MDX序列化失败，至少确保表情符号被转换
      return rawComments.map(comment => ({
        ...comment,
        body: convertEmojis(comment.body)
      }));
    }
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/comments?slug=${slug}`);
      const rawComments = response.data;

      const sortedComments = rawComments.sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      });

      const processedComments = await processComments(sortedComments);
      setComments(processedComments);
      setError("");
    } catch (err) {
      setError("Failed to load comments");
      console.error(
        "Error fetching comments:",
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  // 插入表情符号到评论内容
  const insertEmoji = (emojiCode) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = textarea.value;

    const newValue =
      currentValue.substring(0, start) +
      emojiCode +
      currentValue.substring(end);

    setNewComment(newValue);

    setTimeout(() => {
      const newCursorPos = start + emojiCode.length;
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // 提交评论
  const submitComment = async () => {
    if (!newComment.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post("/api/comments", {
        slug,
        body: newComment,
      });

      // 处理新评论的表情符号和MDX序列化
      const commentWithEmoji = {
        ...response.data,
        body: convertEmojis(response.data.body)
      };
      
      const newCommentWithMdx = {
        ...commentWithEmoji,
        mdxSource: await serialize(commentWithEmoji.body, {
          mdxOptions: {
            remarkPlugins,
            rehypePlugins,
          },
        }),
      };
      
      setComments([newCommentWithMdx, ...comments]);
      setNewComment("");
      setError("");
      setShowEmojiPicker(false);
    } catch (err) {
      setError("Failed to submit comment");
      console.error("Error submitting comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchComments();
    }
  }, [slug]);

  // 点击外部关闭表情面板
  useEffect(() => {
    const handleClickOutside = (event) => {
      const emojiButton = document.getElementById("emoji-button");
      const emojiPicker = document.getElementById("emoji-picker");

      if (
        emojiButton &&
        emojiPicker &&
        !emojiButton.contains(event.target) &&
        !emojiPicker.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 表情选择面板
  const emojiPicker = (
    <div
      id="emoji-picker"
      className="bg-white dark:bg-black p-3 rounded-none sm:rounded-xl mt-2 border border-neutral-200 dark:border-neutral-800 z-10"
    >
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-48 overflow-y-auto pr-1">
        {EMOJI_LIST.map((emoji, index) => (
          <button
            key={index}
            onClick={() => insertEmoji(emoji.code)}
            className="p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center"
            title={emoji.code}
          >
            <span className="text-xl">{emoji.symbol}</span>
          </button>
        ))}
      </div>
      <p className="text-xs sm:text-sm opacity-50 mt-2 text-center">
        点击表情插入到评论中
      </p>
    </div>
  );

  return (
    <div className="mt-12 pt-8">
      <div className="flex items-center mb-6 space-x-2">
        <CommentIcon className="size-6" />
        <h3 className="text-lg sm:text-xl font-semibold ">
          评论 ({comments.length})
        </h3>
      </div>

      {status === "authenticated" ? (
        <div className="w-[calc(100%+4rem)] -translate-x-8">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="在这里写下您的评论..."
              rows={4}
              className="w-full min-h-48 px-8 py-4 border border-neutral-200 dark:border-neutral-800 rounded-none sm:rounded-xl  bg-white dark:bg-black  placeholder:opacity-50 focus:outline-none"
            />
            <div className="absolute right-3 top-3 flex space-x-1">
              <button
                id="emoji-button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1"
                aria-label="添加表情"
              >
                <SmileIcon className="h-5 w-5" />
              </button>
              <button
                className="p-1"
                aria-label="Markdown 支持"
              >
                <MarkdownIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {showEmojiPicker && emojiPicker}

          <div className="flex justify-center max-w-xs mx-auto mt-4">
            <button
              onClick={submitComment}
              disabled={submitting || !newComment.trim()}
              className="w-full flex items-center justify-center px-4 py-2 bg-black dark:bg-white text-white dark:text-neutral-900 rounded-xl hover:bg-neutral-900 dark:hover:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  发送中...
                </>
              ) : (
                <>
                  <SendIcon className="h-4 w-4 mr-2 fill-black dark:fill-white" />
                  发送评论
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 border border-neutral-200 dark:border-neutral-800 rounded-none sm:rounded-xl w-[calc(100%+4rem)] -translate-x-8 text-center">
          <div className="flex justify-center">
            <BanIcon className="size-12 sm:size-16" />
          </div>
          <p className="mb-4 mt-4 font-medium text-lg sm:text-xl">
            请登录，然后才能发表评论
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => signIn("github")}
              className="flex flex-row items-center space-x-2 font-medium px-8 py-2 bg-black dark:bg-white text-white dark:text-neutral-900 rounded-xl hover:bg-neutral-900 dark:hover:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 transition-colors"
            >
              <GitHubIcon className="size-6" /> <span>使用 GitHub 登录</span>
            </button>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* 评论列表 */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
        </div>
      ) : comments.length === 0 ? (
        <p className="opacity-50 text-center text-xs sm:text-sm mt-4 py-4 font-medium">
          没有评论
        </p>
      ) : (
        <div className="space-y-6 mt-8 mb-8 -translate-x-8 w-[calc(100%+4rem)]">
          {comments.map((comment, index) => (
            <div
              key={comment.id}
              className={`px-8 py-2 border-neutral-200 dark:border-neutral-800 ${
                index === 0 ? "border-y" : "border-b"
              }`}
            >
              <div className="flex items-center mb-0 -py-0">
                <div
                  className={`flex items-center space-x-2 ${
                    index === 0 && "mt-4"
                  }`}
                >
                  <div>
                    <img
                      src={comment.user?.avatar_url}
                      alt={`${comment.user?.login}'s avatar`}
                      className="size-8 sm:size-10 rounded-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col space-y-0.5">
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">
                      @{comment.user?.login || "Anonymous"}
                    </span>
                    <span className="opacity-50 text-xs sm:text-sm">
                      {moment(comment.created_at).format(
                        "YYYY 年 MM 月 DD 日 HH:mm:ss"
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <Wrapper>
                {comment.mdxSource ? (
                  <div className="break-words overflow-wrap-anywhere">
                    <MdxContent mdxSource={comment.mdxSource} />
                  </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none break-words overflow-wrap-anywhere">
                    {comment.body}
                  </div>
                )}
              </Wrapper>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}