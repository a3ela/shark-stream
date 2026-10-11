"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { DataTable, Pagination } from "@/components/admin/data-table";
import Modal from "@/components/admin/modal";
import {
  getPaginatedRequests,
  updateRequestStatus,
  deleteRequest,
  analyzeRequestWithAI,
  getPaginatedCategories,
} from "@/lib/actions/admin";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Trash2,
  Clock,
  ExternalLink,
  Sparkles,
} from "lucide-react";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

interface Category {
  _id: string;
  name: string;
}

interface SiteRequest {
  _id: string;
  name: string;
  url: string;
  categoryId: Category | null;
  submittedBy: string;
  submittedByEmail: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  aiRecommendation?: "approved" | "rejected";
  aiReason?: string;
  aiMetadata?: {
    ads?: "none" | "low" | "high";
    quality?: string;
    tags?: string[];
    requiresLogin?: boolean;
    categorySuggestion?: string;
  };
  createdAt: string;
}

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    pending: "admin-badge--warning",
    approved: "admin-badge--success",
    rejected: "admin-badge--danger",
  };
  return (
    <span className={`admin-badge ${map[status] ?? ""}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default function RequestsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [data, setData] = useState<{
    items: SiteRequest[];
    total: number;
    page: number;
    totalPages: number;
  }>({ items: [], total: 0, page: 1, totalPages: 1 });

  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [actionTarget, setActionTarget] = useState<SiteRequest | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | "delete">("approve");
  const [modalOpen, setModalOpen] = useState(false);
  const [notes, setNotes] = useState("");

  // Admin editable fields for approve modal
  const [editForm, setEditForm] = useState({
    name: "",
    categoryId: "",
    ads: "none" as "none" | "low" | "high",
    quality: "1080p",
    tags: "",
    requiresLogin: false,
  });

  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const fetchData = useCallback(
    async (p: number, filter: StatusFilter) => {
      setLoading(true);
      const [reqResult, catResult] = await Promise.all([
        getPaginatedRequests(p, 10, filter),
        getPaginatedCategories(1, 100),
      ]);
      setData(reqResult);
      setCategories(catResult.items);
      setLoading(false);
    },
    [],
  );

  useEffect(() => {
    void (async () => { await fetchData(page, statusFilter); })();
  }, [page, fetchData, statusFilter]);

  function openAction(
    req: SiteRequest,
    type: "approve" | "reject" | "delete",
  ) {
    setActionTarget(req);
    setActionType(type);
    setNotes(req.notes || "");
    setEditForm({
      name: req.name,
      categoryId: req.categoryId?._id ?? categories[0]?._id ?? "",
      ads: req.aiMetadata?.ads ?? "none",
      quality: req.aiMetadata?.quality ?? "1080p",
      tags: req.aiMetadata?.tags?.join(", ") ?? "",
      requiresLogin: Boolean(req.aiMetadata?.requiresLogin),
    });
    setModalOpen(true);
  }

  async function handleAIInspectRequest(req: SiteRequest) {
    setAnalyzingId(req._id);
    try {
      const aiResult = await analyzeRequestWithAI(req._id);
      await fetchData(page, statusFilter);
      // Auto open modal with the AI values pre-populated so the admin can review
      setActionTarget({
        ...req,
        aiRecommendation: aiResult.statusRecommendation,
        aiReason: aiResult.recommendationReason,
        aiMetadata: {
          ads: aiResult.ads,
          quality: aiResult.quality,
          tags: aiResult.tags,
          requiresLogin: aiResult.requiresLogin,
          categorySuggestion: aiResult.categorySuggestion,
        },
      });
      setActionType(
        aiResult.statusRecommendation === "approved" ? "approve" : "reject"
      );
      setEditForm({
        name: aiResult.name || req.name,
        categoryId: aiResult.categoryId || req.categoryId?._id || "",
        ads: aiResult.ads,
        quality: aiResult.quality,
        tags: aiResult.tags.join(", "),
        requiresLogin: aiResult.requiresLogin,
      });
      setNotes(aiResult.recommendationReason);
      setModalOpen(true);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "AI analysis failed");
    } finally {
      setAnalyzingId(null);
    }
  }

  function handleConfirm() {
    startTransition(async () => {
      if (!actionTarget) return;
      if (actionType === "delete") {
        await deleteRequest(actionTarget._id);
      } else {
        await updateRequestStatus(
          actionTarget._id,
          actionType === "approve" ? "approved" : "rejected",
          notes,
          actionType === "approve"
            ? {
                name: editForm.name,
                category: editForm.categoryId,
                ads: editForm.ads,
                quality: editForm.quality,
                tags: editForm.tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean),
                requiresLogin: editForm.requiresLogin,
              }
            : undefined,
        );
      }
      setModalOpen(false);
      fetchData(page, statusFilter);
    });
  }

  const columns = [
    { key: "name", label: "Site Name" },
    {
      key: "url",
      label: "URL",
      render: (row: SiteRequest) => (
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
      key: "categoryId",
      label: "Category",
      render: (row: SiteRequest) =>
        row.categoryId ? (
          <span className="admin-badge admin-badge--ghost">
            {row.categoryId.name}
          </span>
        ) : (
          <span className="admin-badge admin-badge--muted">—</span>
        ),
    },
    {
      key: "ai",
      label: "AI Advice",
      render: (row: SiteRequest) => (
        <div>
          {row.aiRecommendation ? (
            <div className="flex flex-col gap-1 text-[11px]">
              <span
                className={`inline-flex items-center gap-1 w-fit rounded px-1.5 py-0.5 font-semibold ${
                  row.aiRecommendation === "approved"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-rose-500/15 text-rose-400"
                }`}
              >
                <Sparkles size={11} />
                AI: {row.aiRecommendation === "approved" ? "Approve" : "Reject"}
              </span>
              {row.aiReason && (
                <p className="text-(--text-secondary) truncate max-w-xs" title={row.aiReason}>
                  {row.aiReason}
                </p>
              )}
            </div>
          ) : (
            <button
              onClick={() => handleAIInspectRequest(row)}
              disabled={analyzingId === row._id}
              className="inline-flex items-center gap-1 rounded bg-(--primary)/15 px-2 py-1 text-[11px] font-medium text-(--primary) hover:bg-(--primary)/25 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {analyzingId === row._id ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Sparkles size={12} />
              )}
              Audit with AI
            </button>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row: SiteRequest) => statusBadge(row.status),
    },
    {
      key: "createdAt",
      label: "Submitted",
      render: (row: SiteRequest) =>
        new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Site Requests</h1>
          <p className="admin-page__subtitle">
            {data.total} request{data.total !== 1 ? "s" : ""} ({statusFilter})
          </p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="admin-filter-tabs">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            id={`filter-${f.value}-btn`}
            className={`admin-filter-tab ${statusFilter === f.value ? "admin-filter-tab--active" : ""}`}
            onClick={() => { setPage(1); setStatusFilter(f.value); }}
          >
            {f.value === "pending" && <Clock size={13} />}
            {f.value === "approved" && <CheckCircle size={13} />}
            {f.value === "rejected" && <XCircle size={13} />}
            {f.label}
          </button>
        ))}
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
            emptyMessage={`No ${statusFilter === "all" ? "" : statusFilter + " "}requests found.`}
            actions={(row) => (
              <div className="admin-actions">
                {/* Admin can approve, reject, or re-decide regardless of status */}
                {row.status !== "approved" && (
                  <button
                    id={`approve-request-${row._id}-btn`}
                    className="admin-action-btn admin-action-btn--success"
                    onClick={() => openAction(row, "approve")}
                    title={row.status === "rejected" ? "Override: Approve Rejected" : "Approve"}
                  >
                    <CheckCircle size={15} />
                  </button>
                )}
                {row.status !== "rejected" && (
                  <button
                    id={`reject-request-${row._id}-btn`}
                    className="admin-action-btn admin-action-btn--warning"
                    onClick={() => openAction(row, "reject")}
                    title={row.status === "approved" ? "Override: Reject Approved" : "Reject"}
                  >
                    <XCircle size={15} />
                  </button>
                )}
                <button
                  id={`delete-request-${row._id}-btn`}
                  className="admin-action-btn admin-action-btn--delete"
                  onClick={() => openAction(row, "delete")}
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

      {/* Action Modal (Full Admin Control) */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          actionType === "approve"
            ? "Approve Request & Add to Directory"
            : actionType === "reject"
              ? "Reject Request"
              : "Delete Request"
        }
        size={actionType === "approve" ? "md" : "sm"}
      >
        <div className="admin-confirm">
          <p className="admin-confirm__text">
            {actionType === "approve" && (
              <>
                Approve <strong>{actionTarget?.name}</strong>. Review and adjust any details below before publishing to the directory:
              </>
            )}
            {actionType === "reject" && (
              <>
                Reject <strong>{actionTarget?.name}</strong>. You can provide a reason or notes below:
              </>
            )}
            {actionType === "delete" && (
              <>
                Permanently delete the request for <strong>{actionTarget?.name}</strong>?
              </>
            )}
          </p>

          {/* If approving, allow admin to review and edit name, category, ads, quality, tags */}
          {actionType === "approve" && (
            <div className="admin-form mt-4 space-y-3">
              <div className="admin-form__row">
                <label className="admin-form__label">Published Name</label>
                <input
                  className="admin-form__input"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>

              <div className="admin-form__row">
                <label className="admin-form__label">Category</label>
                <select
                  className="admin-form__input admin-form__select"
                  value={editForm.categoryId}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, categoryId: e.target.value }))
                  }
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form__row">
                <label className="admin-form__label">Ad Level</label>
                <select
                  className="admin-form__input admin-form__select"
                  value={editForm.ads}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      ads: e.target.value as "none" | "low" | "high",
                    }))
                  }
                >
                  <option value="none">No Ads (Clean)</option>
                  <option value="low">Few Ads (Manageable)</option>
                  <option value="high">Ad-Heavy</option>
                </select>
              </div>

              <div className="admin-form__row">
                <label className="admin-form__label">Quality</label>
                <input
                  className="admin-form__input"
                  value={editForm.quality}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, quality: e.target.value }))
                  }
                  placeholder="e.g. 1080p, 4K"
                />
              </div>

              <div className="admin-form__row">
                <label className="admin-form__label">Tags (comma-separated)</label>
                <input
                  className="admin-form__input"
                  value={editForm.tags}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, tags: e.target.value }))
                  }
                  placeholder="e.g. Sub & Dub, Fast"
                />
              </div>

              <div className="admin-form__checkbox-row">
                <label className="admin-form__label">Requires Login</label>
                <input
                  type="checkbox"
                  className="admin-form__checkbox"
                  checked={editForm.requiresLogin}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, requiresLogin: e.target.checked }))
                  }
                />
              </div>
            </div>
          )}

          {(actionType === "approve" || actionType === "reject") && (
            <div className="admin-form__row mt-3">
              <label className="admin-form__label">Admin Notes / Reason</label>
              <textarea
                id="request-notes-input"
                className="admin-form__input admin-form__textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Reason or notes..."
                rows={2}
              />
            </div>
          )}

          <div className="admin-form__actions mt-4">
            <button className="admin-btn" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button
              id="confirm-request-action-btn"
              className={`admin-btn ${
                actionType === "approve"
                  ? "admin-btn--primary"
                  : "admin-btn--danger"
              }`}
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 size={14} className="admin-loading__spinner" />
              ) : null}
              {actionType === "approve"
                ? "Confirm & Publish"
                : actionType === "reject"
                  ? "Reject Request"
                  : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
