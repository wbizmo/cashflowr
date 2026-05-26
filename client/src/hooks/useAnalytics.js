import { useEffect, useState } from "react";
import api from "../services/api";

const useAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/analytics/summary");
      setAnalytics(data.analytics);
    } catch (error) {
      console.log("Failed to fetch analytics", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    analytics,
    loading,
    refresh: fetchAnalytics,
  };
};

export default useAnalytics;