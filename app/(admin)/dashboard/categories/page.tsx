"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { DataTable, Pagination } from "@/components/admin/data-table";
import Modal from "@/components/admin/modal";
import {
  getPaginatedCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/actions/admin";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  showEmpty: boolean;
  order: number;
  createdAt: string;
}

const EMPTY_FORM = {
  name: "",
  slug: "",
  description: "",
  icon: "",
  showEmpty: true,
  order: 0,
};

export default function CategoriesPage() {
  const [data, setData] = useState<{
    items: Category[];
    total: number;
    page: number;
    totalPages: number;
  }>({ items: [], total: 0, page: 1, totalPages: 1 });

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const fetchData = useCallback(async (p: number) => {
    setLoading(true);
    const result = await getPaginatedCategories(p, 10);
    setData(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData(page);
  }, [page, fetchData]);

  function openAdd() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(cat: Category) {
    setEditTarget(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      showEmpty: cat.showEmpty,
      order: cat.order,
    });
    setModalOpen(true);
  }

  function openDelete(cat: Category) {
    setDeleteTarget(cat);
    setDeleteConfirmOpen(true);
  }

  function handleSave() {
    startTransition(async () => {
      if (editTarget) {
        await updateCategory(editTarget._id, form);
      } else {
        await createCategory(form);
      }
      setModalOpen(false);
      fetchData(page);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      if (deleteTarget) {
        await deleteCategory(deleteTarget._id);
        setDeleteConfirmOpen(false);
        fetchData(page);
      }
    });
  }

  const columns = [
    {
      key: "icon",
      label: "Icon",
      render: (row: Category) => (
        <span className="admin-badge admin-badge--ghost">{row.icon}</span>
      ),
    },
    { key: "name", label: "Name" },
    { key: "slug", label: "Slug" },
    { key: "description", label: "Description" },
    {
      key: "order",
      label: "Order",
      render: (row: Category) => (
        <span className="admin-badge">{row.order}</span>
      ),
    },
    {
      key: "showEmpty",
      label: "Show Empty",
      render: (row: Category) => (
        <span className={`admin-badge ${row.showEmpty ? "admin-badge--success" : "admin-badge--muted"}`}>
          {row.showEmpty ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (row: Category) =>
        new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Categories</h1>
          <p className="admin-page__subtitle">
            {data.total} categor{data.total === 1 ? "y" : "ies"} total
          </p>
        </div>
        <button
          id="add-category-btn"
          className="admin-btn admin-btn--primary"
          onClick={openAdd}
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {loading ? (
        <div className="admin-loading">
          <Loader2 size={32} className="admin-loading__spinner" />
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data.items}
            keyField="_id"
            emptyMessage="No categories found. Add one to get started."
            actions={(row) => (
              <div className="admin-actions">
                <button
                  id={`edit-category-${row._id}-btn`}
                  className="admin-action-btn admin-action-btn--edit"
                  onClick={() => openEdit(row)}
                  title="Edit"
                >
                  <Pencil size={15} />
                </button>
                <button
                  id={`delete-category-${row._id}-btn`}
                  className="admin-action-btn admin-action-btn--delete"
                  onClick={() => openDelete(row)}
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )}
          />
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? "Edit Category" : "Add Category"}
        size="md"
      >
        <div className="admin-form">
          <div className="admin-form__row">
            <label className="admin-form__label">Name</label>
            <input
              id="category-name-input"
              className="admin-form__input"
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  name: e.target.value,
                  slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                }))
              }
              placeholder="e.g. Anime"
            />
          </div>
          <div className="admin-form__row">
            <label className="admin-form__label">Slug</label>
            <input
              id="category-slug-input"
              className="admin-form__input"
              value={form.slug}
              onChange={(e) =>
                setForm((f) => ({ ...f, slug: e.target.value }))
              }
              placeholder="e.g. anime"
            />
          </div>
          <div className="admin-form__row">
            <label className="admin-form__label">Description</label>
            <textarea
              id="category-description-input"
              className="admin-form__input admin-form__textarea"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Short description..."
            />
          </div>
          <div className="admin-form__row">
            <label className="admin-form__label">Icon (filename or emoji)</label>
            <input
              id="category-icon-input"
              className="admin-form__input"
              value={form.icon}
              onChange={(e) =>
                setForm((f) => ({ ...f, icon: e.target.value }))
              }
              placeholder="e.g. anime.svg or 🎌"
            />
          </div>
          <div className="admin-form__row admin-form__row--inline">
            <div>
              <label className="admin-form__label">Order</label>
              <input
                id="category-order-input"
                type="number"
                className="admin-form__input"
                value={form.order}
                onChange={(e) =>
                  setForm((f) => ({ ...f, order: Number(e.target.value) }))
                }
              />
            </div>
            <div className="admin-form__checkbox-row">
              <label className="admin-form__label">Show Empty</label>
              <input
                id="category-showempty-input"
                type="checkbox"
                className="admin-form__checkbox"
                checked={form.showEmpty}
                onChange={(e) =>
                  setForm((f) => ({ ...f, showEmpty: e.target.checked }))
                }
              />
            </div>
          </div>
          <div className="admin-form__actions">
            <button
              className="admin-btn"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button
              id="save-category-btn"
              className="admin-btn admin-btn--primary"
              onClick={handleSave}
              disabled={isPending || !form.name || !form.slug}
            >
              {isPending ? <Loader2 size={14} className="admin-loading__spinner" /> : null}
              {editTarget ? "Save Changes" : "Create Category"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Category"
        size="sm"
      >
        <div className="admin-confirm">
          <p className="admin-confirm__text">
            Are you sure you want to delete{" "}
            <strong>{deleteTarget?.name}</strong>? This cannot be undone.
          </p>
          <div className="admin-form__actions">
            <button
              className="admin-btn"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </button>
            <button
              id="confirm-delete-category-btn"
              className="admin-btn admin-btn--danger"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? <Loader2 size={14} className="admin-loading__spinner" /> : null}
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
