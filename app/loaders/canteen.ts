import axios from "axios";
import type { Canteen } from "@/types/canteen";

export async function loadCanteenData() {
  try {
    const canteenPromise = axios
      .get("https://chifan.huster.fun/api/open-now")
      .then((response) => {
        const openedCanteen: Canteen[] = Array.isArray(response.data)
          ? response.data
          : [];
        return openedCanteen;
      })
      .catch((error) => {
        console.error("Error fetching canteen status:", error);
        return [] as Canteen[];
      });
    return canteenPromise;
  } catch (error) {
    console.error("Loader error:", error);
    return Promise.resolve([] as Canteen[]);
  }
}

export async function loadCanteenStatus() {
  try {
    const canteenStatusPromise = axios
      .get("https://chifan.huster.fun/api/kaifan")
      .then((response) => {
        return response.data as { status: string; message: string };
      })
      .catch((error) => {
        console.error("Error fetching canteen status:", error);
        return { status: "error", message: "无法获取食堂状态" } as {
          status: string;
          message: string;
        };
      });
    return canteenStatusPromise;
  } catch (error) {
    console.error("Loader error:", error);
    return Promise.resolve({ status: "error", message: "无法获取食堂状态" } as {
      status: string;
      message: string;
    });
  }
}
