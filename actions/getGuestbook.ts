/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import axios from "axios";

export interface GuestbookEntry {
  id: number;
  body: string;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  html_url: string;
}

export async function getGuestbookEntries(): Promise<GuestbookEntry[]> {
  try {
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const token = process.env.GITHUB_TOKEN;

    if (!owner || !repo) {
      console.error("GitHub environment variables are not set");
      throw new Error(
        "GitHub configuration is missing. Please set GITHUB_OWNER and GITHUB_REPO environment variables."
      );
    }

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/issues?labels=guestbook&state=open&sort=created&direction=desc`;

    // 对于公开仓库，token 是可选的
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
    };

    if (token) {
      headers.Authorization = `token ${token}`;
    }

    const response = await axios.get(apiUrl, {
      headers,
      timeout: 10000,
    });

    return response.data.map((issue: any) => ({
      id: issue.number,
      body: issue.body || "",
      user: {
        login: issue.user.login,
        avatar_url: issue.user.avatar_url,
      },
      created_at: issue.created_at,
      html_url: issue.html_url,
    }));
  } catch (error: any) {
    console.error("Error fetching guestbook entries:", error);
    if (error.response) {
      throw new Error(
        `Failed to fetch guestbook entries: ${error.response.status} ${error.response.statusText}`
      );
    } else if (error.request) {
      throw new Error(
        "No response from server. Please check your network connection."
      );
    } else {
      throw new Error(
        error.message || "Unknown error occurred while fetching guestbook entries"
      );
    }
  }
}

