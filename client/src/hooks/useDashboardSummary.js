import { useEffect, useState } from "react";
import api from "../services/api";

const useDashboardSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/dashboard/summary");
      setSummary(data.summary);
    } catch (error) {
      console.log("Failed to fetch dashboard summary", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return {
    summary,
    loading,
    refresh: fetchSummary,
  };
};

export default useDashboardSummary;