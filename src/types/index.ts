export type Role = 'BUYER' | 'VENDOR' | 'ADMIN';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TicketStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  token?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TicketStatus;
  buyerId: string;
  vendorId?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  resolutionTimeHours?: number;
}

export interface TicketHistory {
  id: string;
  ticketId: string;
  status: string;
  changedBy: string;
  changedAt: string;
}

export interface Comment {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  message: string;
  createdDate: string;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  priority: Priority;
  buyerId: string;
  attachments?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface TicketStats {
  total: number;
  open: number;
  assigned: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

export interface PriorityStats {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface SlaReport {
  averageResolutionHours: number;
}
