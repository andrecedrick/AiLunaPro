/**
 * Customer "My Tickets" client — the in-app side of the support loop.
 * Reuses the existing support_tickets model; the worker enforces ownership.
 */

import { WORKER_BASE } from '../billing/stripeClient';
import { getIdToken } from '../team/teamApiClient';

export interface MyTicketReply { message: string; repliedAt: string; repliedBy: string }
export interface MyTicket {
  id: string; type: string; status: string; description: string;
  createdAt: string; replies: MyTicketReply[]; closedAt: string; closedBy: string;
}
export interface MyTickets { items: MyTicket[]; total: number; open: number }

export async function fetchMyTickets(): Promise<MyTickets | null> {
  const token = await getIdToken();
  if (!token) return null;
  try {
    const res = await fetch(`${WORKER_BASE}/api/support/my-tickets`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return null;
    return (await res.json()) as MyTickets;
  } catch { return null; }
}

export async function replyMyTicket(ticketId: string, message: string): Promise<boolean> {
  const token = await getIdToken();
  if (!token) return false;
  try {
    const res = await fetch(`${WORKER_BASE}/api/support/my-reply`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId, message }),
    });
    return res.ok;
  } catch { return false; }
}

export async function closeMyTicket(ticketId: string): Promise<boolean> {
  const token = await getIdToken();
  if (!token) return false;
  try {
    const res = await fetch(`${WORKER_BASE}/api/support/my-close`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId }),
    });
    return res.ok;
  } catch { return false; }
}
