import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { getApiUrl } from "../services/configService";
import ConfirmModal from "./ConfirmModal";
import Notification from "./Notification";

export default function UsersCrud() {
  const { token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({ id: null as string | null, email: "", password: "", username: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState({ open: false, message: '', type: 'info' as 'success' | 'error' | 'info' });
  const [confirm, setConfirm] = useState<{ open: boolean, id: string | null }>({ open: false, id: null });

  useEffect(() => {
    if (token) fetchUsers();
    // eslint-disable-next-line
  }, [token]);

  async function fetchUsers() {
    try {
      const apiUrl = getApiUrl('/collections/users/records?perPage=50');
      const res = await fetch(apiUrl, {
        headers: { Authorization: token },
      });
      const data = await res.json();
      setUsers(data.items || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setNotif({ open: true, message: 'Error al cargar usuarios', type: 'error' });
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleEdit(u: any) {
    setForm({ id: u.id, email: u.email, username: u.username, name: u.name || "", password: "" });
  }

  function handleCancel() {
    setForm({ id: null, email: "", password: "", username: "", name: "" });
  }

  function handleDelete(id: string) {
    setConfirm({ open: true, id });
  }

  async function confirmDelete() {
    if (!confirm.id) return;
    setLoading(true);
    try {
      const apiUrl = getApiUrl(`/collections/users/records/${confirm.id}`);
      await fetch(apiUrl, {
        method: "DELETE",
        headers: { Authorization: token },
      });
      setNotif({ open: true, message: 'Usuario eliminado', type: 'success' });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setNotif({ open: true, message: 'Error al eliminar', type: 'error' });
    } finally {
      setLoading(false);
      setConfirm({ open: false, id: null });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (!form.email || (!form.id && !form.password)) {
      setNotif({ open: true, message: 'Completa todos los campos', type: 'error' });
      setLoading(false);
      return;
    }
    try {
      if (form.id) {
        const apiUrl = getApiUrl(`/collections/users/records/${form.id}`);
        const res = await fetch(apiUrl, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: token },
          body: JSON.stringify({ email: form.email, username: form.username, name: form.name }),
        });
        if (!res.ok) throw new Error();
        setNotif({ open: true, message: 'Actualizado correctamente', type: 'success' });
      } else {
        const apiUrl = getApiUrl('/collections/users/records');
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: token },
          body: JSON.stringify({ email: form.email, password: form.password, passwordConfirm: form.password, username: form.username, name: form.name }),
        });
        if (!res.ok) throw new Error();
        setNotif({ open: true, message: 'Creado correctamente', type: 'success' });
      }
      handleCancel();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      setNotif({ open: true, message: 'Error al guardar', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  if (!token) return <div className="text-center mt-8">Cargando...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Usuarios</h2>
      <form onSubmit={handleSubmit} className="mb-4 flex gap-2 flex-wrap">
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="border px-2 py-1 rounded"
        />
        <input
          name="name"
          placeholder="Nombre"
          value={form.name}
          onChange={handleChange}
          className="border px-2 py-1 rounded"
        />
        <input
          name="username"
          placeholder="Usuario"
          value={form.username}
          onChange={handleChange}
          className="border px-2 py-1 rounded"
        />
        {!form.id && (
          <input
            name="password"
            placeholder="Contraseña"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="border px-2 py-1 rounded"
          />
        )}
        <button type="submit" className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark disabled:opacity-50" disabled={loading}>{form.id ? "Actualizar" : "Crear"}</button>
        {form.id && <button type="button" onClick={handleCancel} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500" disabled={loading}>Cancelar</button>}
      </form>
      <Notification open={notif.open} message={notif.message} type={notif.type} onClose={() => setNotif({ ...notif, open: false })} />
      <ConfirmModal
        open={confirm.open}
        message="¿Estás seguro que deseas eliminar este usuario?"
        onConfirm={confirmDelete}
        onCancel={() => setConfirm({ open: false, id: null })}
      />
      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">Nombre</th>
            <th className="border px-2 py-1">Usuario</th>
            <th className="border px-2 py-1">Verificado</th>
            <th className="border px-2 py-1">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td className="border px-2 py-1">{u.email}</td>
              <td className="border px-2 py-1">{u.name}</td>
              <td className="border px-2 py-1">{u.username}</td>
              <td className="border px-2 py-1">{u.verified ? "Sí" : "No"}</td>
              <td className="border px-2 py-1">
                <button onClick={() => handleEdit(u)} className="bg-primary text-white px-2 py-1 rounded hover:bg-primary-dark mr-2" disabled={loading}>Editar</button>
                <button onClick={() => handleDelete(u.id)} className="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500" disabled={loading}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}