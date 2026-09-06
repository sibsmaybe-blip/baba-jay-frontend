import { useEffect, useState } from "react";
import { getUsers, createUser, updateUser, deleteUser } from "../api/api";
import { ROLES } from "../data/mockUsers";
import PageBanner from "../components/PageBanner";

function Users() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", password: "", role: "Cashier" });

  async function loadUsers() {
    const data = await getUsers();
    setUsers(data);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleAddUser(e) {
    e.preventDefault();
    await createUser(form);
    setForm({ name: "", username: "", password: "", role: "Cashier" });
    setShowForm(false);
    loadUsers(); // re-fetch so the table reflects the new user
  }

  async function toggleActive(user) {
    await updateUser(user.id, { active: !user.active });
    loadUsers();
  }

  async function handleDelete(user) {
    if (!confirm(`Delete ${user.name}? This can't be undone.`)) return;
    await deleteUser(user.id);
    loadUsers();
  }

  return (
    <div>
      <PageBanner title="User Management" subtitle="Accounts, roles, and access" />
      <div className="d-flex justify-content-end align-items-center mb-3">
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add User"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddUser} className="card p-3 mb-4 shadow-sm">
          <div className="row g-2">
            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
            <div className="col-md-3">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="col-md-1">
              <button type="submit" className="btn btn-primary w-100">Save</button>
            </div>
          </div>
        </form>
      )}

      <table className="table table-hover bg-white shadow-sm">
        <thead>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>Role</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.username}</td>
              <td>
                <span className="badge" style={{ background: "var(--bubblegum)" }}>
                  {user.role}
                </span>
              </td>
              <td>
                <span className={`badge ${user.active ? "bg-success" : "bg-secondary"}`}>
                  {user.active ? "Active" : "Deactivated"}
                </span>
              </td>
              <td className="text-end">
                <button
                  className="btn btn-sm btn-outline-secondary me-2"
                  onClick={() => toggleActive(user)}
                >
                  {user.active ? "Deactivate" : "Activate"}
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(user)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Users;
