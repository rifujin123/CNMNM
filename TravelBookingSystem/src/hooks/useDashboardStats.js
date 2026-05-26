import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchDashboardStats } from "../api/services";

export function useDashboardStats(filters = {}, enabled = true) {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const loadStats = async () => {
    if (!token || !enabled) {
      setData(null);
      setIsLoading(false);
      setIsError(false);
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);
      const stats = await fetchDashboardStats({ token, filters });
      setData(stats);
    } catch (err) {
      console.error("Load dashboard stats error:", err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [token, enabled, JSON.stringify(filters)]);

  return { data, isLoading, isError, refetch: loadStats };
}
