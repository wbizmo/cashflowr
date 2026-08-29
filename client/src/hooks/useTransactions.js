import { useCallback, useEffect, useState } from "react";
import api, { makeIdempotencyKey } from "../services/api";

const useTransactions = ({ page = 1, limit = 15, search = "", type = "all", from = "", to = "" } = {}) => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit, total: 0, pages: 1, hasNextPage: false, hasPreviousPage: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTransactions = useCallback(async (signal) => {
    const params = {
      page,
      limit,
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(type !== "all" ? { type } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    };
    const { data } = await api.get("/transactions", { params, signal });
    setTransactions(data.transactions || []);
    setPagination(data.pagination || { page, limit, total: data.transactions?.length || 0, pages: 1 });
  }, [page, limit, search, type, from, to]);

  const fetchCategories = useCallback(async () => {
    const { data } = await api.get("/categories");
    setCategories(data.categories || []);
  }, []);

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      await fetchTransactions();
    } catch (requestError) {
      if (requestError.code !== "ERR_CANCELED") {
        setError(requestError.response?.data?.message || "Unable to load transactions.");
      }
    } finally {
      setLoading(false);
    }
  }, [fetchTransactions]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetchTransactions(controller.signal)
      .catch((requestError) => {
        if (requestError.code !== "ERR_CANCELED") setError(requestError.response?.data?.message || "Unable to load transactions.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [fetchTransactions]);

  useEffect(() => {
    fetchCategories().catch(() => setError("Unable to load categories."));
  }, [fetchCategories]);

  const createTransaction = async (payload) => {
    const { data } = await api.post("/transactions", payload, {
      headers: { "Idempotency-Key": makeIdempotencyKey("transaction") },
    });
    await loadTransactions();
    return data.transaction;
  };

  const updateTransaction = async (id, payload, version) => {
    const { data } = await api.put(`/transactions/${id}`, payload, {
      headers: version === undefined ? {} : { "If-Match": String(version) },
    });
    await loadTransactions();
    return data.transaction;
  };

  const deleteTransaction = async (id, version) => {
    await api.delete(`/transactions/${id}`, {
      headers: version === undefined ? {} : { "If-Match": String(version) },
    });
    await loadTransactions();
  };

  return {
    transactions,
    categories,
    pagination,
    loading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refresh: loadTransactions,
  };
};

export default useTransactions;
