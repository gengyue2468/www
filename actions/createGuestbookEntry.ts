/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import axios from "axios";

export interface CreateGuestbookEntryParams {
  message: string;
  accessToken?: string;
}

export async function createGuestbookEntry(
  params: CreateGuestbookEntryParams
): Promise<{ success: boolean; issueUrl?: string; error?: string }> {
  try {
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;

    if (!owner || !repo) {
      console.error("GitHub environment variables are not set");
      throw new Error(
        "GitHub configuration is missing. Please set GITHUB_OWNER and GITHUB_REPO environment variables."
      );
    }

    if (!params.accessToken) {
      return {
        success: false,
        error: "Authentication required. Please sign in with GitHub.",
      };
    }

    // 验证输入
    if (!params.message) {
      return {
        success: false,
        error: "Message cannot be empty",
      };
    }

    if (params.message.length > 1000) {
      return {
        success: false,
        error: "Message cannot exceed 1000 characters",
      };
    }

    // 获取用户信息
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `token ${params.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
      timeout: 10000,
    });

    const userName = userResponse.data.login;
    const userAvatar = userResponse.data.avatar_url;

    const title = `Guestbook entry from: ${userName}`;
    const body = `**From:** ${userName}\n\n**Message:**\n${params.message}`;

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/issues`;

    const response = await axios.post(
      apiUrl,
      {
        title,
        body,
        labels: ["guestbook"],
      },
      {
        headers: {
          Authorization: `token ${params.accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
        timeout: 10000,
      }
    );

    return {
      success: true,
      issueUrl: response.data.html_url,
    };
  } catch (error: any) {
    console.error("Error creating guestbook entry:", error);
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;
      
      if (status === 422) {
        return {
          success: false,
          error: "Submission failed. Please check your input.",
        };
      }
      
      if (status === 401 || status === 403) {
        return {
          success: false,
          error: "Authentication failed. Please sign in again.",
        };
      }
      
      return {
        success: false,
        error: `Submission failed: ${status} ${message}`,
      };
    } else if (error.request) {
      return {
        success: false,
        error: "Network error. Please try again later.",
      };
    } else {
      return {
        success: false,
        error: error.message || "Unknown error",
      };
    }
  }
}

