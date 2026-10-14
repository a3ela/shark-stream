"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { DataTable, Pagination } from "@/components/admin/data-table";
import Modal from "@/components/admin/modal";
import ImageDropzone from "@/components/admin/image-dropzone";
import {
  getPaginatedSites,
  createSite,
  updateSite,
  deleteSite,
  getPaginatedCategories,
  inspectSiteWithAI,
} from "@/lib/actions/admin";
import { Plus, Pencil, Trash2, Loader2, ExternalLink, CheckCircle, XCircle, Sparkles, Search, X } from "lucide-react";

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
  ads?: "none" | "low" | "high";
  quality?: string;
  tags?: string[];
  requiresLogin?: boolean;
  createdAt: string;
}

const EMPTY_FORM = {
  name: "",
  url: "",
  logoUrl: "",
  category: "",
  verified: false,
  ads: "none" as "none" | "low" | "high",
  quality: "",
  tags: "",
  requiresLogin: false,
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
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Site | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Site | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [aiInspecting, setAiInspecting] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  async function handleAIInspect() {
    if (!form.url) {
      setAiFeedback("Please enter a URL first.");
      return;
    }
    setAiInspecting(true);
    setAiFeedback(null);
    try {
      const result = await inspectSiteWithAI(form.url);
      setForm((prev) => ({
        ...prev,
        name: prev.name || result.name,
        category: prev.category || result.categoryId || "",
        ads: result.ads,
        quality: result.quality,
        tags: result.tags.join(", "),
        requiresLogin: result.requiresLogin,
      }));
      setAiFeedback(
        `Gemini suggestion applied! ${result.recommendationReason} (Review & adjust anything before saving)`
      );
    } catch (err: unknown) {
      setAiFeedback(
        err instanceof Error ? err.message : "AI inspection failed. Check your GEMINI_API_KEY."
      );
    } finally {
      setAiInspecting(false);
    }
  }

  const fetchData = useCallback(async (p: number, q: string) => {
    setLoading(true);
    const [siteResult, catResult] = await Promise.all([
      getPaginatedSites(p, 10, q),
      getPaginatedCategories(1, 100),
    ]);
    setData(siteResult);
    setCategories(catResult.items);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void fetchData(page, search), search ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [page, search, fetchData]);

  function openAdd() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setAiFeedback(null);
    setModalOpen(true);
  }

  function openEdit(site: Site) {
    setEditTarget(site);
    setAiFeedback(null);
    setForm({
      name: site.name,
      url: site.url,
      logoUrl: site.logoUrl,
      category: site.category?._id ?? "",
      verified: site.verified,
      ads: site.ads ?? "none",
      quality: site.quality ?? "",
      tags: site.tags ? site.tags.join(", ") : "",
      requiresLogin: Boolean(site.requiresLogin),
    });
    setModalOpen(true);
  }

  function openDelete(site: Site) {
    setDeleteTarget(site);
    setDeleteConfirmOpen(true);
  }

  function handleSave() {
    startTransition(async () => {
      const payload = {
        ...form,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      if (editTarget) {
        await updateSite(editTarget._id, payload);
      } else {
        await createSite(payload);
      }
      setModalOpen(false);
      fetchData(page, search);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      if (deleteTarget) {
        await deleteSite(deleteTarget._id);
        setDeleteConfirmOpen(false);
        fetchData(page, search);
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
      key: "attributes",
      label: "Attributes",
      render: (row: Site) => (
        <div className="flex flex-wrap gap-1 text-[11px]">
          <span
            className={`rounded px-1.5 py-0.5 font-medium ${
              row.ads === "none"
                ? "bg-emerald-500/15 text-emerald-400"
                : row.ads === "low"
                  ? "bg-amber-500/15 text-amber-400"
                  : "bg-rose-500/15 text-rose-400"
            }`}
          >
            {row.ads === "none" ? "No Ads" : row.ads === "low" ? "Few Ads" : "Ad-Heavy"}
          </span>
          {row.quality && (
            <span className="rounded bg-cyan-500/15 px-1.5 py-0.5 font-medium text-cyan-300">
              {row.quality}
            </span>
          )}
          {row.requiresLogin ? (
            <span className="rounded bg-zinc-500/20 px-1.5 py-0.5 text-zinc-300">
              Login Req
            </span>
          ) : (
            <span className="rounded bg-blue-500/15 px-1.5 py-0.5 text-blue-300">
              No Login
            </span>
          )}
        </div>
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
          <p className="admin-eyebrow"><span className="admin-status-dot" /> Catalog / Directory</p>
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

      <div className="admin-sites-toolbar">
        <div><strong>Site directory</strong><span>Find and maintain listings in your catalog.</span></div>
        <div className="admin-search">
          <Search size={16} aria-hidden="true" />
          <label className="sr-only" htmlFor="admin-site-search">Search sites</label>
          <input id="admin-site-search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search site name or URL" />
          {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear site search"><X size={15} /></button>}
        </div>
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
            <div className="flex items-center justify-between mb-1">
              <label className="admin-form__label mb-0">URL</label>
              <button
                type="button"
                onClick={handleAIInspect}
                disabled={aiInspecting || !form.url}
                className="inline-flex items-center gap-1.5 rounded-md bg-(--primary)/15 px-2.5 py-1 text-xs font-semibold text-(--primary) hover:bg-(--primary)/25 disabled:opacity-40 transition-colors cursor-pointer"
                title="Inspect URL with Gemini Flash to auto-fill details"
              >
                {aiInspecting ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Sparkles size={13} />
                )}
                {aiInspecting ? "Inspecting..." : "Auto-fill with Gemini AI"}
              </button>
            </div>
            <input
              id="site-url-input"
              className="admin-form__input"
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="https://example.com"
            />
            {aiFeedback && (
              <p className="mt-1.5 text-xs text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 rounded-md p-2">
                {aiFeedback}
              </p>
            )}
          </div>
          <div className="admin-form__row">
            <ImageDropzone
              value={form.logoUrl}
              onChange={(url) => setForm((f) => ({ ...f, logoUrl: url }))}
              label="Site Logo"
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
          <div className="admin-form__row">
            <label className="admin-form__label">Ads Level</label>
            <select
              id="site-ads-select"
              className="admin-form__input admin-form__select"
              value={form.ads}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  ads: e.target.value as "none" | "low" | "high",
                }))
              }
            >
              <option value="none">No Ads (Clean)</option>
              <option value="low">Few Ads (Manageable)</option>
              <option value="high">Ad-Heavy (Requires Adblock)</option>
            </select>
          </div>
          <div className="admin-form__row">
            <label className="admin-form__label">Quality (Resolution)</label>
            <input
              id="site-quality-input"
              className="admin-form__input"
              value={form.quality}
              onChange={(e) =>
                setForm((f) => ({ ...f, quality: e.target.value }))
              }
              placeholder="e.g. 1080p, 4K, 720p, HD"
            />
          </div>
          <div className="admin-form__row">
            <label className="admin-form__label">Tags (comma-separated)</label>
            <input
              id="site-tags-input"
              className="admin-form__input"
              value={form.tags}
              onChange={(e) =>
                setForm((f) => ({ ...f, tags: e.target.value }))
              }
              placeholder="e.g. Sub & Dub, Downloads, Fast"
            />
          </div>
          <div className="admin-form__checkbox-row">
            <label className="admin-form__label">Requires Login</label>
            <input
              id="site-login-input"
              type="checkbox"
              className="admin-form__checkbox"
              checked={form.requiresLogin}
              onChange={(e) =>
                setForm((f) => ({ ...f, requiresLogin: e.target.checked }))
              }
            />
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
