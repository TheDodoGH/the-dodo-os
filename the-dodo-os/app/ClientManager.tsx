
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Search, Save, X, Pencil } from 'lucide-react';

type Client = {
  id: string;
  owner_id: string;
  name: string;
  company_name: string | null;
  address: string | null;
  vat_number: string | null;
  contact_name: string | null;
  email: string | null;
  default_hourly_rate: number | null;
  default_daily_rate: number | null;
};

const emptyForm = {
  name: '',
  company_name: '',
  address: '',
  vat_number: '',
  contact_name: '',
  email: '',
  default_hourly_rate: '',
  default_daily_rate: '',
};

export default function ClientManager() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function loadClients() {
    const { data, error } = await supabase()
      .from('clients')
      .select('*')
      .order('name');

    if (error) setError(error.message);
    else setClients(data || []);
  }

  useEffect(() => {
    void loadClients();
  }, []);

  function update(field: keyof typeof emptyForm, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function newClient() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowForm(true);
    setError('');
  }

  function editClient(client: Client) {
    setEditingId(client.id);
    setForm({
      name: client.name || '',
      company_name: client.company_name || '',
      address: client.address || '',
      vat_number: client.vat_number || '',
      contact_name: client.contact_name || '',
      email: client.email || '',
      default_hourly_rate:
        client.default_hourly_rate?.toString() || '',
      default_daily_rate:
        client.default_daily_rate?.toString() || '',
    });
    setShowForm(true);
    setError('');
  }

  async function saveClient(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');

    const { data: { user }, error: authError } =
      await supabase().auth.getUser();

    if (authError || !user) {
      setError('Please sign in again.');
      setBusy(false);
      return;
    }

    const payload = {
      name: form.name.trim(),
      company_name: form.company_name.trim(),
      address: form.address.trim(),
      vat_number: form.vat_number.trim(),
      contact_name: form.contact_name.trim(),
      email: form.email.trim(),
      default_hourly_rate: form.default_hourly_rate
        ? Number(form.default_hourly_rate)
        : null,
      default_daily_rate: form.default_daily_rate
        ? Number(form.default_daily_rate)
        : null,
      updated_at: new Date().toISOString(),
    };

    const result = editingId
      ? await supabase()
          .from('clients')
          .update(payload)
          .eq('id', editingId)
          .eq('owner_id', user.id)
      : await supabase()
          .from('clients')
          .insert({ ...payload, owner_id: user.id });

    setBusy(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    await loadClients();
  }

  const filtered = clients.filter(client =>
    [
      client.name,
      client.company_name,
      client.vat_number,
      client.contact_name,
    ]
      .some(value =>
        (value || '').toLowerCase().includes(search.toLowerCase())
      )
  );

  return (
    <div>
      <div className="section-head">
        <p>{clients.length} CLIENTS</p>
        <button className="primary" onClick={newClient}>
          <Plus size={16} /> NEW CLIENT
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <form className="form" onSubmit={saveClient}>
          <h2>{editingId ? 'EDIT CLIENT' : 'NEW CLIENT'}</h2>

          <input
            required
            placeholder="Client name (e.g. Street Smash)"
            value={form.name}
            onChange={e => update('name', e.target.value)}
          />

          <input
            placeholder="Legal company name"
            value={form.company_name}
            onChange={e => update('company_name', e.target.value)}
          />

          <textarea
            placeholder="Full billing address"
            value={form.address}
            onChange={e => update('address', e.target.value)}
          />

          <input
            placeholder="VAT / NIF / NIPC"
            value={form.vat_number}
            onChange={e => update('vat_number', e.target.value)}
          />

          <input
            placeholder="Contact person"
            value={form.contact_name}
            onChange={e => update('contact_name', e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => update('email', e.target.value)}
          />

          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Default hourly rate (€)"
            value={form.default_hourly_rate}
            onChange={e =>
              update('default_hourly_rate', e.target.value)
            }
          />

          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Default daily rate (€)"
            value={form.default_daily_rate}
            onChange={e =>
              update('default_daily_rate', e.target.value)
            }
          />

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="primary" disabled={busy}>
              <Save size={16} />
              {busy ? 'SAVING...' : 'SAVE CLIENT'}
            </button>

            <button
              type="button"
              className="back"
              onClick={() => setShowForm(false)}
            >
              <X size={16} /> CANCEL
            </button>
          </div>
        </form>
      )}

      <div className="form" style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Search size={18} />
          <input
            placeholder="Search clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.map(client => (
        <div className="projectrow" key={client.id}>
          <strong>{client.name}</strong>
          <small>
            {client.company_name || client.vat_number || ''}
          </small>
          <button
            type="button"
            onClick={() => editClient(client)}
            aria-label={`Edit ${client.name}`}
            style={{ border: 0, background: 'transparent' }}
          >
            <Pencil size={18} />
          </button>
        </div>
      ))}

      {!filtered.length && (
        <p className="muted">No clients found.</p>
      )}
    </div>
  );
}
