"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { DataTable, Pagination } from "@/components/admin/data-table";
import Modal from "@/components/admin/modal";
import { getPaginatedUsers, updateUserRole, createUser } from "@/lib/actions/admin";
import { Loader2, ShieldCheck, ShieldOff, Plus } from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
  createdAt: string;
}

const EMPTY_USER_FORM = {
  name: "",
  email: "",
  password: "",
  role: "user" as "admin" | "user",
};

export default function UsersPage() {
  const [data, setData] = useState<{
    items: User[];
    total: number;
    page: number;
    totalPages: number;
  }>({ items: [], total: 0, page: 1, totalPages: 1 });

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [roleTarget, setRoleTarget] = useState<User | null>(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_USER_FORM);

  const fetchData = useCallback(async (p: number) => {
    setLoading(true);
    const result = await getPaginatedUsers(p, 10);
    setData(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData(page);
  }, [page, fetchData]);

  function openRoleModal(user: User) {
    setRoleTarget(user);
    setRoleModalOpen(true);
  }

  function handleRoleChange(newRole: "admin" | "user") {
    startTransition(async () => {
      if (roleTarget) {
        await updateUserRole(roleTarget._id, newRole);
        setRoleModalOpen(false);
        fetchData(page);
      }
    });
  }
  
  function handleCreateUser() {
    startTransition(async () => {
      try {
        await createUser(addForm);
        setAddUserOpen(false);
        setAddForm(EMPTY_USER_FORM);
        fetchData(page);
      } catch (err) {
        console.error(err);
        alert("Failed to create user");
      }
    });
  }

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (row: User) => (
        <div className="admin-user-cell">
          <div className="admin-avatar">
            {(row.name ?? "?")[0].toUpperCase()}
          </div>
          <span>{row.name}</span>
        </div>
      ),
    },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Role",
      render: (row: User) => (
        <span
          className={`admin-badge ${
            row.role === "admin"
              ? "admin-badge--admin"
              : "admin-badge--ghost"
          }`}
        >
          {row.role === "admin" ? "Admin" : "User"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (row: User) =>
        row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—",
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Users</h1>
          <p className="admin-page__subtitle">
            {data.total} user{data.total !== 1 ? "s" : ""} registered
          </p>
        </div>
        <button
          id="add-user-btn"
          className="admin-btn admin-btn--primary"
          onClick={() => {
            setAddForm(EMPTY_USER_FORM);
            setAddUserOpen(true);
          }}
        >
          <Plus size={16} />
          Add User
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
            emptyMessage="No users found."
            actions={(row) => (
              <div className="admin-actions">
                <button
                  id={`toggle-role-${row._id}-btn`}
                  className={`admin-action-btn ${
                    row.role === "admin"
                      ? "admin-action-btn--warning"
                      : "admin-action-btn--success"
                  }`}
                  onClick={() => openRoleModal(row)}
                  title={row.role === "admin" ? "Revoke Admin" : "Make Admin"}
                >
                  {row.role === "admin" ? (
                    <ShieldOff size={15} />
                  ) : (
                    <ShieldCheck size={15} />
                  )}
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

      {/* Add User Modal */}
      <Modal
        open={addUserOpen}
        onClose={() => setAddUserOpen(false)}
        title="Create New User"
        size="md"
      >
        <div className="admin-form">
          <div className="admin-form__row">
            <label className="admin-form__label">Full Name</label>
            <input
              id="user-name-input"
              className="admin-form__input"
              value={addForm.name}
              onChange={(e) => setAddForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. John Doe"
            />
          </div>
          <div className="admin-form__row">
            <label className="admin-form__label">Email Address</label>
            <input
              id="user-email-input"
              type="email"
              className="admin-form__input"
              value={addForm.email}
              onChange={(e) => setAddForm(f => ({ ...f, email: e.target.value }))}
              placeholder="e.g. john@example.com"
            />
          </div>
          <div className="admin-form__row">
            <label className="admin-form__label">Password</label>
            <input
              id="user-password-input"
              type="password"
              className="admin-form__input"
              value={addForm.password}
              onChange={(e) => setAddForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Minimum 8 characters"
            />
          </div>
          <div className="admin-form__row">
            <label className="admin-form__label">Role</label>
            <select
              id="user-role-select"
              className="admin-form__input admin-form__select"
              value={addForm.role}
              onChange={(e) => setAddForm(f => ({ ...f, role: e.target.value as "admin" | "user" }))}
            >
              <option value="user">Regular User</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <div className="admin-form__actions">
            <button className="admin-btn" onClick={() => setAddUserOpen(false)}>
              Cancel
            </button>
            <button
              id="save-user-btn"
              className="admin-btn admin-btn--primary"
              onClick={handleCreateUser}
              disabled={isPending || !addForm.name || !addForm.email || addForm.password.length < 8}
            >
              {isPending ? <Loader2 size={14} className="admin-loading__spinner" /> : null}
              Create User
            </button>
          </div>
        </div>
      </Modal>

      {/* Role change modal */}
      <Modal
        open={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title="Change User Role"
        size="sm"
      >
        <div className="admin-confirm">
          <p className="admin-confirm__text">
            {roleTarget?.role === "admin" ? (
              <>
                Revoke admin privileges from{" "}
                <strong>{roleTarget?.name}</strong>? They will become a
                regular user.
              </>
            ) : (
              <>
                Grant admin privileges to{" "}
                <strong>{roleTarget?.name}</strong>? They will have full
                access to the admin panel.
              </>
            )}
          </p>
          <div className="admin-form__actions">
            <button
              className="admin-btn"
              onClick={() => setRoleModalOpen(false)}
            >
              Cancel
            </button>
            <button
              id="confirm-role-change-btn"
              className={`admin-btn ${
                roleTarget?.role === "admin"
                  ? "admin-btn--danger"
                  : "admin-btn--primary"
              }`}
              onClick={() =>
                handleRoleChange(
                  roleTarget?.role === "admin" ? "user" : "admin",
                )
              }
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 size={14} className="admin-loading__spinner" />
              ) : null}
              {roleTarget?.role === "admin" ? "Revoke Admin" : "Make Admin"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
