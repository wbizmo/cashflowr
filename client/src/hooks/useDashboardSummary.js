import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

const useDashboardSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/dashboard/summary");
      setSummary(data.summary);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load your financial overview.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, refresh: fetchSummary };
};

export default useDashboardSummary;
