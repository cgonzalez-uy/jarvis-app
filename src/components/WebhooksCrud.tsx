import React, { useEffect, useState } from "react";
import { useAuth } from '../hooks/useAuth';
import ConfirmModal from './ConfirmModal';
import Notification from './Notification';

const PB_URL = "";

export default function WebhooksCrud() {
  const { token } = useAuth();
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [form, setForm] = useState({ id: null as string | null, name: "", url: "" });
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState({ open: false, message: '', type: 'info' as 'success' | 'error' | 'info' });
  const [confirm, setConfirm] = useState<{ open: boolean, id: string | null }>({ open: false, id: null });

  useEffect(() => {
    if (token) fetchWebhooks();
    // eslint-disable-next-line
  }, [token]);

  async function fetchWebhooks() {
    try {
      const res = await fetch(`${PB_URL}/api/collections/webhooks/records?perPage=50`, {
        headers: { Authorization: token },
      });
      const data = await res.json();
      setWebhooks(data.items || []);
    } catch {
      setNotif({ open: true, message: 'Error al cargar webhooks', type: 'error' });
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleEdit(w: any) {
    setForm({ id: w.id, name: w.name, url: w.url });
  }

  function handleCancel() {
    setForm({ id: null, name: "", url: "" });
  }

  function handleDelete(id: string) {
    setConfirm({ open: true, id });
  }

  async function confirmDelete() {
    if (!confirm.id) return;
    setLoading(true);
    try {
      await fetch(`${PB_URL}/api/collections/webhooks/records/${confirm.id}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });
      setNotif({ open: true, message: 'Webhook eliminado', type: 'success' });
      fetchWebhooks();
    } catch {
      setNotif({ open: true, message: 'Error al eliminar', type: 'error' });
    } finally {
      setLoading(false);
      setConfirm({ open: false, id: null });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (!form.name || !form.url) {
      setNotif({ open: true, message: 'Completa todos los campos', type: 'error' });
      setLoading(false);
      return;
    }
    try {
      if (form.id) {
        const res = await fetch(`${PB_URL}/api/collections/webhooks/records/${form.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: token },
          body: JSON.stringify({ name: form.name, url: form.url }),
        });
        if (!res.ok) throw new Error();
        setNotif({ open: true, message: 'Actualizado correctamente', type: 'success' });
      } else {
        const res = await fetch(`${PB_URL}/api/collections/webhooks/records`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: token },
          body: JSON.stringify({ name: form.name, url: form.url }),
        });
        if (!res.ok) throw new Error();
        setNotif({ open: true, message: 'Creado correctamente', type: 'success' });
      }
      handleCancel();
      fetchWebhooks();
    } catch {
      setNotif({ open: true, message: 'Error al guardar', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  if (!token) return <div className="text-center mt-8">Cargando...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Webhooks</h2>
      <form onSubmit={handleSubmit} className="mb-4 flex gap-2 flex-wrap">
        <input
          name="name"
          placeholder="Nombre"
          value={form.name}
          onChange={handleChange}
          className="border px-2 py-1 rounded"
        />
        <input
          name="url"
          placeholder="URL"
          value={form.url}
          onChange={handleChange}
          className="border px-2 py-1 rounded w-96"
        />
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark disabled:opacity-50"
          disabled={loading}
        >
          {form.id ? "Actualizar" : loading ? "Guardando..." : "Crear"}
        </button>
        {form.id && (
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            disabled={loading}
          >
            Cancelar
          </button>
        )}
      </form>
      <Notification open={notif.open} message={notif.message} type={notif.type} onClose={() => setNotif({ ...notif, open: false })} />
      <ConfirmModal
        open={confirm.open}
        message="¿Estás seguro que deseas eliminar este webhook?"
        onConfirm={confirmDelete}
        onCancel={() => setConfirm({ open: false, id: null })}
      />
      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="border px-2 py-1">Nombre</th>
            <th className="border px-2 py-1">URL</th>
            <th className="border px-2 py-1">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {webhooks.map(w => (
            <tr key={w.id}>
              <td className="border px-2 py-1">{w.name}</td>
              <td className="border px-2 py-1">{w.url}</td>
              <td className="border px-2 py-1">
                <button
                  onClick={() => handleEdit(w)}
                  className="bg-primary text-white px-2 py-1 rounded hover:bg-primary-dark mr-2"
                  disabled={loading}
                >Editar</button>
                <button
                  onClick={() => handleDelete(w.id)}
                  className="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500"
                  disabled={loading}
                >Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}