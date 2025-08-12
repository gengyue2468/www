// hooks/useBaseFetch.js
import { useState, useEffect, useCallback } from "react";

/**
 * 修复依赖管理的基础请求Hook
 * 确保只在必要时重新请求
 */
export const useBaseFetch = (fetchFn, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 关键：用useCallback稳定fetchFn，避免每次渲染都创建新函数
  const stableFetchFn = useCallback(fetchFn, dependencies);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await stableFetchFn(); // 使用稳定的fetchFn
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [stableFetchFn]); // 仅依赖稳定的fetchFn

  // 仅在fetchData变化时重新执行（即依赖变化时）
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
    