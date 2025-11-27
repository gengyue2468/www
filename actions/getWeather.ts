/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import axios from "axios";

export async function getWeather() {
  try {
    const apiUrl =
      "https://api.open-meteo.com/v1/forecast?latitude=30.5931&longitude=114.3054&current_weather=true";

    if (!apiUrl) {
      console.error("Weather API environment variables are not set");
      throw new Error(
        "API URL or API Key is not configured. Please set WEATHER_API_URL and WEATHER_API_KEY environment variables."
      );
    }

    const url = apiUrl;

    const response = await axios.get(url, {
      timeout: 10000,
    });

    return response.data;
  } catch (error: any) {
    console.error("Error fetching weather data:", error);
    if (error.response) {
      throw new Error(
        `Failed to fetch weather data: ${error.response.status} ${error.response.statusText}`
      );
    } else if (error.request) {
      throw new Error(
        "No response from server. Please check your network connection and API URL."
      );
    } else {
      throw new Error(
        error.message || "Unknown error occurred while fetching weather data"
      );
    }
  }
}
