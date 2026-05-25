import { useEffect, useState } from "react";
import api from "../services/api";

const useBudgets = () => {
  const now = new Date();

  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [loading, setLoading] = useState(true);

  const fetchBudgets = async () => {
    const { data } = await api.get(`/budgets?month=${month}&year=${year}`);
    setBudgets(data.budgets || []);
  };

  const fetchCategories = async () => {
    const { data } = await api.get("/categories");
    setCategories(
      (data.categories || []).filter((item) => item.type === "expense")
    );
  };

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchBudgets(), fetchCategories()]);
    } catch (error) {
      console.log("Failed to load budgets", error);
    } finally {
      setLoading(false);
    }
  };

  const createBudget = async (payload) => {
    await api.post("/budgets", payload);
    await fetchBudgets();
  };

  const updateBudget = async (id, payload) => {
    await api.put(`/budgets/${id}`, payload);
    await fetchBudgets();
  };

  const deleteBudget = async (id) => {
    await api.delete(`/budgets/${id}`);
    await fetchBudgets();
  };

  useEffect(() => {
    loadData();
  }, [month, year]);

  return {
    budgets,
    categories,
    month,
    year,
    loading,
    setMonth,
    setYear,
    createBudget,
    updateBudget,
    deleteBudget,
    refresh: loadData,
  };
};

export default useBudgets;