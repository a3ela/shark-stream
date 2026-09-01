"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { DataTable, Pagination } from "@/components/admin/data-table";
import Modal from "@/components/admin/modal";
import {
  getPaginatedRequests,
  updateRequestStatus,
  deleteRequest,
} from "@/lib/actions/admin";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Trash2,
  Clock,
  ExternalLink,
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

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [actionTarget, setActionTarget] = useState<SiteRequest | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | "delete">("approve");
  const [modalOpen, setModalOpen] = useState(false);
  const [notes, setNotes] = useState("");

  const fetchData = useCallback(
    async (p: number, filter: StatusFilter) => {
      setLoading(true);
      const result = await getPaginatedRequests(p, 10, filter);
      setData(result);
      setLoading(false);
    },
    [],
  );

  useEffect(() => {
    fetchData(1, statusFilter);
  }, [statusFilter, fetchData]);

  useEffect(() => {
    fetchData(page, statusFilter);
  }, [page, fetchData, statusFilter]);

  function openAction(
    req: SiteRequest,
    type: "approve" | "reject" | "delete",
  ) {
    setActionTarget(req);
    setActionType(type);
    setNotes("");
    setModalOpen(true);
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
    { key: "submittedByEmail", label: "Submitted By" },
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
            onClick={() => setStatusFilter(f.value)}
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
                {row.status === "pending" && (
                  <>
                    <button
                      id={`approve-request-${row._id}-btn`}
                      className="admin-action-btn admin-action-btn--success"
                      onClick={() => openAction(row, "approve")}
                      title="Approve"
                    >
                      <CheckCircle size={15} />
                    </button>
                    <button
                      id={`reject-request-${row._id}-btn`}
                      className="admin-action-btn admin-action-btn--warning"
                      onClick={() => openAction(row, "reject")}
                      title="Reject"
                    >
                      <XCircle size={15} />
                    </button>
                  </>
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

      {/* Action Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          actionType === "approve"
            ? "Approve Request"
            : actionType === "reject"
              ? "Reject Request"
              : "Delete Request"
        }
        size="sm"
      >
        <div className="admin-confirm">
          <p className="admin-confirm__text">
            {actionType === "approve" && (
              <>
                Approve <strong>{actionTarget?.name}</strong>? This will mark
                the request as approved.
              </>
            )}
            {actionType === "reject" && (
              <>
                Reject <strong>{actionTarget?.name}</strong>? You can add a
                reason below.
              </>
            )}
            {actionType === "delete" && (
              <>
                Permanently delete the request for{" "}
                <strong>{actionTarget?.name}</strong>?
              </>
            )}
          </p>

          {(actionType === "approve" || actionType === "reject") && (
            <div className="admin-form__row" style={{ marginTop: "0.75rem" }}>
              <label className="admin-form__label">Notes (optional)</label>
              <textarea
                id="request-notes-input"
                className="admin-form__input admin-form__textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add a note..."
                rows={3}
              />
            </div>
          )}

          <div className="admin-form__actions">
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
                ? "Approve"
                : actionType === "reject"
                  ? "Reject"
                  : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
