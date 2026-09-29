import { Badge } from './Badge.js';

interface StatusPillProps {
  status: string;
  type?: 'house' | 'application' | 'maintenance';
}

export function StatusPill({ status, type }: StatusPillProps) {
  const normalized = status.toLowerCase();

  if (type === 'house' || normalized === 'vacant' || normalized === 'occupied') {
    switch (normalized) {
      case 'vacant':
        return <Badge variant="success">Vacant</Badge>;
      case 'occupied':
        return <Badge variant="info">Occupied</Badge>;
      case 'maintenance':
        return <Badge variant="warning">Under Repair</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  if (type === 'application' || ['pending', 'allocated', 'rejected', 'withdrawn'].includes(normalized)) {
    switch (normalized) {
      case 'pending':
        return <Badge variant="warning">Pending Review</Badge>;
      case 'allocated':
        return <Badge variant="success">Allocated</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'withdrawn':
        return <Badge variant="secondary">Withdrawn</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  if (type === 'maintenance' || ['in_progress', 'resolved', 'cancelled'].includes(normalized)) {
    switch (normalized) {
      case 'pending':
        return <Badge variant="warning">Pending Action</Badge>;
      case 'in_progress':
        return <Badge variant="info">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="success">Resolved</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  return <Badge variant="outline">{status}</Badge>;
}
