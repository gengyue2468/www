/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import axios from "axios";

export async function getPlaylist(playlistId: string) {
  try {
    const apiUrl = process.env.NCM_API_URL;
    
    if (!apiUrl) {
      console.error("NCM_API_URL environment variable is not set");
      throw new Error("API URL is not configured. Please set NCM_API_URL environment variable.");
    }
    
    const url = `${apiUrl}/playlist/detail?id=${playlistId}`;
    
    const response = await axios.get(url, {
      timeout: 10000,
    });
    
    console.log("Playlist response status:", response.status);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching playlist:", error);
    
    if (error.response) {
      throw new Error(`Failed to fetch playlist: ${error.response.status} ${error.response.statusText}`);
    } else if (error.request) {
      throw new Error("No response from server. Please check your network connection and API URL.");
    } else {
      throw new Error(error.message || "Unknown error occurred while fetching playlist");
    }
  }
}
