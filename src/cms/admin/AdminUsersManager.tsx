// src/pages/admin/AdminUsersManager.tsx
import React, { useState, useEffect } from "react";
import { Users, Plus, Trash2, CheckCircle2, X, Edit2 } from "lucide-react";
import { authService, AdminUser } from "../../services/authService";
import { useAdminAuth } from "../../context/AdminAuthContext";

export const AdminUsersManager: React.FC = () => {
  const { user: currentUser, refreshProfile } = useAdminAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("CONTENT_EDITOR");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Edit user state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("CONTENT_EDITOR");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editPassword, setEditPassword] = useState("");

  const loadUsers = async () => {
    const res = await authService.listUsers();
    if (res.success && res.users) {
      setUsers(res.users);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      alert("Please fill out all required fields.");
      return;
    }

    setIsSubmitting(true);
    const res = await authService.createUser({ email, password, name, role });
    setIsSubmitting(false);

    if (res.success) {
      setNotification(`User "${name}" created successfully!`);
      setTimeout(() => setNotification(null), 3000);
      setIsModalOpen(false);
      setEmail("");
      setPassword("");
      setName("");
      loadUsers();
    } else {
      alert(res.message || "Failed to create user");
    }
  };

  const handleOpenEdit = (u: AdminUser) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditRole(u.role);
    setEditIsActive(u.isActive !== false);
    setEditPassword("");
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editName.trim()) {
      alert("Name cannot be empty.");
      return;
    }
    if (!editEmail.trim()) {
      alert("Email cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    const updates: any = {
      name: editName.trim(),
      email: editEmail.trim().toLowerCase(),
      role: editRole,
      isActive: editIsActive,
    };
    if (editPassword.trim()) {
      if (editPassword.trim().length < 8) {
        alert("Password must be at least 8 characters.");
        setIsSubmitting(false);
        return;
      }
      updates.password = editPassword.trim();
    }

    const res = await authService.updateUser(editingUser.id, updates);
    setIsSubmitting(false);

    if (res.success) {
      if (editingUser.id === currentUser?.id) {
        await refreshProfile();
      }
      setNotification(`User "${editName}" updated successfully!`);
      setTimeout(() => setNotification(null), 3000);
      setIsEditModalOpen(false);
      setEditingUser(null);
      loadUsers();
    } else {
      alert(res.message || "Failed to update user");
    }
  };

  const handleDelete = async (id: string, userName: string) => {
    if (id === currentUser?.id) {
      alert("You cannot delete your own account.");
      return;
    }

    if (window.confirm(`Revoke CMS access and delete user "${userName}"?`)) {
      const res = await authService.deleteUser(id);
      if (res.success) {
        setNotification(`User "${userName}" deleted.`);
        setTimeout(() => setNotification(null), 3000);
        loadUsers();
      } else {
        alert(res.message || "Failed to delete user");
      }
    }
  };

  return (
    <div
      style={{
        maxWidth: "100%",
        margin: "0 auto",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        padding: "0",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "clamp(1rem, 2vw, 2rem)",
          padding: "clamp(0.5rem, 1vw, 0)",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "#0F172A",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <Users color="#18181B" /> Team & CMS Access Control
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#64748B",
              marginTop: "0.375rem",
            }}
          >
            Manage administrative personnel, content editors, sales leads, and
            role-based permissions.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1.25rem",
            backgroundColor: "#18181B",
            border: "1px solid #09090B",
            borderRadius: "8px",
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: "0.875rem",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(24, 24, 27, 0.22)",
          }}
        >
          <Plus size={18} /> Add Team Member
        </button>
      </div>

      {notification && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1.25rem",
            backgroundColor: "#ECFDF5",
            border: "1px solid #A7F3D0",
            borderRadius: "8px",
            color: "#047857",
            marginBottom: "1.5rem",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={16} /> {notification}
        </div>
      )}

      {/* Users Table */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "12px",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            fontSize: "0.875rem",
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "1px solid #E2E8F0",
                backgroundColor: "#F8FAFC",
                color: "#475569",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              <th style={{ padding: "1rem 1.5rem", fontWeight: 700 }}>User</th>
              <th style={{ padding: "1rem", fontWeight: 700 }}>Role</th>
              <th style={{ padding: "1rem", fontWeight: 700 }}>Status</th>
              <th style={{ padding: "1rem", fontWeight: 700 }}>Last Login</th>
              <th
                style={{ padding: "1rem", textAlign: "right", fontWeight: 700 }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSuper = u.role === "SUPER_ADMIN";
              const isEditor = u.role === "CONTENT_EDITOR";
              const roleBg = isSuper
                ? "#EEF2FF"
                : isEditor
                  ? "#FEF3C7"
                  : "#ECFDF5";
              const roleColor = isSuper
                ? "#4338CA"
                : isEditor
                  ? "#B45309"
                  : "#047857";
              const roleBorder = isSuper
                ? "#C7D2FE"
                : isEditor
                  ? "#FDE68A"
                  : "#A7F3D0";

              return (
                <tr key={u.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <div style={{ fontWeight: 700, color: "#0F172A" }}>
                      {u.name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748B" }}>
                      {u.email}
                    </div>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span
                      style={{
                        padding: "0.2rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        backgroundColor: roleBg,
                        color: roleColor,
                        border: `1px solid ${roleBorder}`,
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: u.isActive !== false ? "#047857" : "#BE123C",
                      }}
                    >
                      {u.isActive !== false ? "Active" : "â—‹ Disabled"}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      color: "#64748B",
                      fontSize: "0.8125rem",
                    }}
                  >
                    {u.lastLoginAt
                      ? new Date(u.lastLoginAt).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td
                    style={{
                      padding: "1rem 1.5rem",
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "0.5rem",
                      }}
                    >
                      <button
                        onClick={() => handleOpenEdit(u)}
                        style={{
                          background: "#F1F5F9",
                          border: "1px solid #CBD5E1",
                          color: "#334155",
                          borderRadius: "6px",
                          cursor: "pointer",
                          padding: "0.35rem 0.5rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                        title="Edit user role and profile"
                      >
                        <Edit2 size={14} /> Edit
                      </button>

                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDelete(u.id, u.name)}
                          style={{
                            background: "#FFE4E6",
                            border: "1px solid #FECDD3",
                            color: "#BE123C",
                            borderRadius: "6px",
                            cursor: "pointer",
                            padding: "0.35rem 0.5rem",
                            display: "inline-flex",
                            alignItems: "center",
                          }}
                          title="Delete user"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "500px",
              padding: "2rem",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  color: "#0F172A",
                  margin: 0,
                }}
              >
                Add Team Member
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#64748B",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleCreateSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "0.375rem",
                  }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "6px",
                    padding: "0.625rem",
                    color: "#0F172A",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "0.375rem",
                  }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "6px",
                    padding: "0.625rem",
                    color: "#0F172A",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "0.375rem",
                  }}
                >
                  Initial Password (min 8 characters)
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "6px",
                    padding: "0.625rem",
                    color: "#0F172A",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "0.375rem",
                  }}
                >
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: "100%",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "6px",
                    padding: "0.625rem",
                    color: "#0F172A",
                    outline: "none",
                  }}
                >
                  <option value="CONTENT_EDITOR">
                    CONTENT_EDITOR (Edit pages, products, articles)
                  </option>
                  <option value="CMS_ADMIN">
                    CMS_ADMIN (Manage all content & CRM)
                  </option>
                  <option value="SALES_USER">
                    SALES_USER (Access Inquiries & RFQs)
                  </option>
                  <option value="SUPER_ADMIN">
                    SUPER_ADMIN (Full system access)
                  </option>
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.75rem",
                  marginTop: "1rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: "0.625rem 1.25rem",
                    borderRadius: "6px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    color: "#475569",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "0.625rem 1.5rem",
                    borderRadius: "6px",
                    backgroundColor: "#18181B",
                    border: "1px solid #09090B",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(24, 24, 27, 0.22)",
                  }}
                >
                  {isSubmitting ? "Creating..." : "Create Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingUser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "500px",
              padding: "2rem",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 800,
                    color: "#0F172A",
                    margin: 0,
                  }}
                >
                  Edit Member
                </h2>
                <div
                  style={{
                    fontSize: "0.8125rem",
                    color: "#64748B",
                    marginTop: "0.2rem",
                  }}
                >
                  {editingUser.email}
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#64748B",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleEditSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "0.375rem",
                  }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{
                    width: "100%",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "6px",
                    padding: "0.625rem",
                    color: "#0F172A",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "0.375rem",
                  }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  style={{
                    width: "100%",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "6px",
                    padding: "0.625rem",
                    color: "#0F172A",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "0.375rem",
                  }}
                >
                  Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  style={{
                    width: "100%",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "6px",
                    padding: "0.625rem",
                    color: "#0F172A",
                    outline: "none",
                  }}
                >
                  <option value="CONTENT_EDITOR">
                    CONTENT_EDITOR (Edit pages, products, articles)
                  </option>
                  <option value="CMS_ADMIN">
                    CMS_ADMIN (Manage all content & CRM)
                  </option>
                  <option value="SALES_USER">
                    SALES_USER (Access Inquiries & RFQs)
                  </option>
                  <option value="SUPER_ADMIN">
                    SUPER_ADMIN (Full system access)
                  </option>
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  padding: "0.75rem",
                  backgroundColor: "#F8FAFC",
                  borderRadius: "8px",
                  border: "1px solid #E2E8F0",
                }}
              >
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                />
                <label
                  htmlFor="editIsActive"
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#1E293B",
                    cursor: "pointer",
                  }}
                >
                  Account Active (Uncheck to suspend login access)
                </label>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "0.375rem",
                  }}
                >
                  Reset Password (leave blank to keep existing)
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Enter new password (min 8 characters)"
                  style={{
                    width: "100%",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "6px",
                    padding: "0.625rem",
                    color: "#0F172A",
                    outline: "none",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.75rem",
                  marginTop: "1rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{
                    padding: "0.625rem 1.25rem",
                    borderRadius: "6px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    color: "#475569",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "0.625rem 1.5rem",
                    borderRadius: "6px",
                    backgroundColor: "#18181B",
                    border: "1px solid #09090B",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(24, 24, 27, 0.22)",
                  }}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
