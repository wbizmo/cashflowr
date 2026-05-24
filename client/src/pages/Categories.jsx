import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  X,
  Check,
  Wallet,
} from "lucide-react";

import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";
import {
  categoryIcons,
  iconOptions,
  colorOptions,
} from "../utils/categoryOptions";

const initialForm = {
  name: "",
  type: "expense",
  color: "#3B82F6",
  icon: "Wallet",
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/categories");
      setCategories(data.categories || []);
    } catch (error) {
      console.log("Failed to fetch categories", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    setForm({
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon,
    });

    setEditingId(category._id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const saveCategory = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      if (editingId) {
        await api.put(`/categories/${editingId}`, form);
      } else {
        await api.post("/categories", form);
      }

      await fetchCategories();
      closeModal();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id) => {
    const confirmDelete = confirm(
      "Delete this category? Existing transactions may still reference it."
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete category");
    }
  };

  const incomeCategories = categories.filter((item) => item.type === "income");
  const expenseCategories = categories.filter((item) => item.type === "expense");

  const renderCategoryCard = (category) => {
    const Icon = categoryIcons[category.icon] || Wallet;

    return (
      <div
        key={category._id}
        className="rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center"
              style={{
                backgroundColor: `${category.color}20`,
              }}
            >
              <Icon
                size={22}
                style={{
                  color: category.color,
                }}
              />
            </div>

            <div>
              <h3 className="text-white font-semibold text-lg">
                {category.name}
              </h3>

              <p className="text-slate-400 text-sm capitalize mt-1">
                {category.type}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openEditModal(category)}
              className="h-10 w-10 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center hover:bg-white/[0.06] cursor-pointer"
            >
              <Pencil size={16} className="text-slate-300" />
            </button>

            <button
              onClick={() => deleteCategory(category._id)}
              className="h-10 w-10 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center hover:bg-red-500/10 cursor-pointer"
            >
              <Trash2 size={16} className="text-red-400" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <h1 className="text-4xl font-bold text-white">Categories</h1>

            <p className="text-slate-400 mt-2">
              Create and manage custom income and expense categories.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="h-12 px-5 rounded-2xl bg-white text-black font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus size={18} />
            New Category
          </button>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-28 rounded-[28px] border border-white/10 bg-white/[0.03] animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid xl:grid-cols-2 gap-8">
            <section>
              <div className="mb-5">
                <h2 className="text-2xl font-semibold text-white">
                  Expense Categories
                </h2>

                <p className="text-slate-400 text-sm mt-1">
                  Used for spending, budgets, and expense analytics.
                </p>
              </div>

              <div className="grid gap-4">
                {expenseCategories.length === 0 ? (
                  <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-8 text-slate-400">
                    No expense categories yet.
                  </div>
                ) : (
                  expenseCategories.map(renderCategoryCard)
                )}
              </div>
            </section>

            <section>
              <div className="mb-5">
                <h2 className="text-2xl font-semibold text-white">
                  Income Categories
                </h2>

                <p className="text-slate-400 text-sm mt-1">
                  Used for salary, freelance income, business revenue, and more.
                </p>
              </div>

              <div className="grid gap-4">
                {incomeCategories.length === 0 ? (
                  <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-8 text-slate-400">
                    No income categories yet.
                  </div>
                ) : (
                  incomeCategories.map(renderCategoryCard)
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
          <div
            onClick={closeModal}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          <form
            onSubmit={saveCategory}
            className="relative w-full max-w-xl rounded-[32px] border border-white/10 bg-[#0B1120] p-6 md:p-8 shadow-2xl"
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-5 top-5 h-10 w-10 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center cursor-pointer"
            >
              <X size={18} className="text-white" />
            </button>

            <h2 className="text-3xl font-bold text-white">
              {editingId ? "Edit Category" : "New Category"}
            </h2>

            <p className="text-slate-400 mt-2">
              Choose how this category appears across your dashboard.
            </p>

            <div className="mt-8 space-y-5">
              <div>
                <label className="text-sm text-slate-300">Category name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Food, Salary, Transport"
                  className="mt-2 w-full h-13 rounded-2xl border border-white/10 bg-white/[0.03] px-4 outline-none text-white placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300">Type</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="mt-2 w-full h-13 rounded-2xl border border-white/10 bg-white/[0.03] px-4 outline-none text-white"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-300">Icon</label>
                <div className="mt-3 grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {iconOptions.map((iconName) => {
                    const Icon = categoryIcons[iconName] || Wallet;
                    const active = form.icon === iconName;

                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            icon: iconName,
                          }))
                        }
                        className={`h-12 rounded-2xl border flex items-center justify-center cursor-pointer ${
                          active
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-white/10 bg-white/[0.03]"
                        }`}
                      >
                        <Icon size={20} className="text-white" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-300">Color</label>
                <div className="mt-3 flex flex-wrap gap-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          color,
                        }))
                      }
                      className={`h-10 w-10 rounded-full border-2 flex items-center justify-center cursor-pointer ${
                        form.color === color
                          ? "border-white"
                          : "border-transparent"
                      }`}
                      style={{
                        backgroundColor: color,
                      }}
                    >
                      {form.color === color && (
                        <Check size={16} className="text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={saving}
                className="w-full h-13 rounded-2xl bg-white text-black font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Categories;