import { useEffect, useState } from "react";
import api from "../services/api";

const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    const { data } = await api.get("/transactions");
    setTransactions(data.transactions || []);
  };

  const fetchCategories = async () => {
    const { data } = await api.get("/categories");
    setCategories(data.categories || []);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchTransactions(), fetchCategories()]);
    } catch (error) {
      console.log("Failed to load transaction data", error);
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (payload) => {
    await api.post("/transactions", payload);
    await fetchTransactions();
  };

  const updateTransaction = async (id, payload) => {
    await api.put(`/transactions/${id}`, payload);
    await fetchTransactions();
  };

  const deleteTransaction = async (id) => {
    await api.delete(`/transactions/${id}`);
    await fetchTransactions();
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    transactions,
    categories,
    loading,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refresh: loadData,
  };
};

export default useTransactions;