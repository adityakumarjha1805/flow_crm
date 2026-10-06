const apiBase = import.meta.env.VITE_API_URL || ''

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('mini-crm-token')
  const response = await fetch(`${apiBase}/api${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const result = response.status === 204 ? {} : await response.json()
  if (!response.ok) throw new Error(result.message || 'The request could not be completed')
  return result
}

export function normalizeLead(lead) {
  return {
    ...lead,
    id: lead._id || lead.id,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
    notes: (lead.notes || []).map((note) => ({ ...note, id: note._id || note.id, date: note.createdAt || note.date })),
    followUps: (lead.followUps || []).map((item) => ({ ...item, id: item._id || item.id, leadId: item.leadId || item.lead })),
  }
}
