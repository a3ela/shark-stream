"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { DataTable, Pagination } from "@/components/admin/data-table";
import Modal from "@/components/admin/modal";
import {
  getPaginatedSites,
  createSite,
  updateSite,
  deleteSite,
  getPaginatedCategories,
} from "@/lib/actions/admin";
import { Plus, Pencil, Trash2, Loader2, ExternalLink, CheckCircle, XCircle } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
}

interface Site {
  _id: string;
  name: string;
  url: string;
  logoUrl: string;
  category: Category | null;
  verified: boolean;
  createdAt: string;
}

const EMPTY_FORM = {
  name: "",
  url: "",
  logoUrl: "",
  category: "",
  verified: false,
};

export default function SitesPage() {
  const [data, setData] = useState<{
    items: Site[];
    total: number;
    page: number;
    totalPages: number;
  }>({ items: [], total: 0, page: 1, totalPages: 1 });

  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Site | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Site | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const fetchData = useCallback(async (p: number) => {
    setLoading(true);
    const [siteResult, catResult] = await Promise.all([
      getPaginatedSites(p, 10),
      getPaginatedCategories(1, 100),
    ]);
    setData(siteResult);
    setCategories(catResult.items);
    setLoading(false);
  }, []);

  useEffect(() => {
    void (async () => { await fetchData(page); })();
  }, [page, fetchData]);

  function openAdd() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(site: Site) {
    setEditTarget(site);
    setForm({
      name: site.name,
      url: site.url,
      logoUrl: site.logoUrl,
      category: site.category?._id ?? "",
      verified: site.verified,
    });
    setModalOpen(true);
  }

  function openDelete(site: Site) {
    setDeleteTarget(site);
    setDeleteConfirmOpen(true);
  }

  function handleSave() {
    startTransition(async () => {
      if (editTarget) {
        await updateSite(editTarget._id, form);
      } else {
        await createSite(form);
      }
      setModalOpen(false);
      fetchData(page);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      if (deleteTarget) {
        await deleteSite(deleteTarget._id);
        setDeleteConfirmOpen(false);
        fetchData(page);
      }
    });
  }

  const columns = [
    {
      key: "logoUrl",
      label: "Logo",
      render: (row: Site) =>
        row.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={row.logoUrl}
            alt={row.name}
            className="admin-table-logo"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <span className="admin-table-logo-placeholder">{row.name[0]}</span>
        ),
    },
    { key: "name", label: "Name" },
    {
      key: "url",
      label: "URL",
      render: (row: Site) => (
        <a
          href={row.url}
          target="_blank"
          rel="noopener noreferrer"
          className="admin-link"
        >
          {row.url.replace(/^https?:\/\//, "").split("/")[0]}
          <ExternalLink size={12} />
        </a>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (row: Site) =>
        row.category ? (
          <span className="admin-badge admin-badge--ghost">{row.category.name}</span>
        ) : (
          <span className="admin-badge admin-badge--muted">—</span>
        ),
    },
    {
      key: "verified",
      label: "Verified",
      render: (row: Site) =>
        row.verified ? (
          <CheckCircle size={18} className="admin-icon--success" />
        ) : (
          <XCircle size={18} className="admin-icon--muted" />
        ),
    },
    {
      key: "createdAt",
      label: "Added",
      render: (row: Site) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Sites</h1>
          <p className="admin-page__subtitle">
            {data.total} site{data.total !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          id="add-site-btn"
          className="admin-btn admin-btn--primary"
          onClick={openAdd}
        >
          <Plus size={16} />
          Add Site
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
            emptyMessage="No sites found. Add one to get started."
            actions={(row) => (
              <div className="admin-actions">
                <button
                  id={`edit-site-${row._id}-btn`}
                  className="admin-action-btn admin-action-btn--edit"
                  onClick={() => openEdit(row)}
                  title="Edit"
                >
                  <Pencil size={15} />
                </button>
                <button
                  id={`delete-site-${row._id}-btn`}
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
        title={editTarget ? "Edit Site" : "Add Site"}
        size="md"
      >
        <div className="admin-form">
          <div className="admin-form__row">
            <label className="admin-form__label">Site Name</label>
            <input
              id="site-name-input"
              className="admin-form__input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Crunchyroll"
            />
          </div>
          <div className="admin-form__row">
            <label className="admin-form__label">URL</label>
            <input
              id="site-url-input"
              className="admin-form__input"
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="https://example.com"
            />
          </div>
          <div className="admin-form__row">
            <label className="admin-form__label">Logo URL</label>
            <input
              id="site-logo-input"
              className="admin-form__input"
              value={form.logoUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, logoUrl: e.target.value }))
              }
              placeholder="https://example.com/favicon.ico"
            />
          </div>
          <div className="admin-form__row">
            <label className="admin-form__label">Category</label>
            <select
              id="site-category-select"
              className="admin-form__input admin-form__select"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-form__checkbox-row">
            <label className="admin-form__label">Verified</label>
            <input
              id="site-verified-input"
              type="checkbox"
              className="admin-form__checkbox"
              checked={form.verified}
              onChange={(e) =>
                setForm((f) => ({ ...f, verified: e.target.checked }))
              }
            />
          </div>
          <div className="admin-form__actions">
            <button className="admin-btn" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button
              id="save-site-btn"
              className="admin-btn admin-btn--primary"
              onClick={handleSave}
              disabled={isPending || !form.name || !form.url || !form.category}
            >
              {isPending ? (
                <Loader2 size={14} className="admin-loading__spinner" />
              ) : null}
              {editTarget ? "Save Changes" : "Create Site"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Site"
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
              id="confirm-delete-site-btn"
              className="admin-btn admin-btn--danger"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 size={14} className="admin-loading__spinner" />
              ) : null}
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
