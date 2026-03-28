'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { authApi } from '@/lib/authApi';
import { User } from '@/types';
import { Card, PageHeader, Spinner, EmptyState } from '@/components/ui';
import toast from 'react-hot-toast';
import { RiUserLine, RiDeleteBinLine, RiShieldLine, RiTeamLine } from 'react-icons/ri';

// Confirmation modal component
function DeleteConfirmModal({
  user,
  onConfirm,
  onCancel,
  loading,
}: {
  user: User;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-sm mx-4 p-6 rounded-2xl border"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 mx-auto mb-4">
          <RiDeleteBinLine className="text-red-400 text-xl" />
        </div>
        <h3 className="text-lg font-bold text-white text-center mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Delete User
        </h3>
        <p className="text-sm text-slate-400 text-center mb-1">
          Are you sure you want to delete
        </p>
        <p className="text-sm font-semibold text-white text-center mb-5">
          {user.name} ({user.email})?
        </p>
        <p className="text-xs text-red-400 text-center mb-6">
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 border border-white/10 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <RiDeleteBinLine /> Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const roleColors: Record<string, string> = {
  BUYER: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  VENDOR: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
  ADMIN: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
};

const roleIcons: Record<string, React.ElementType> = {
  BUYER: RiUserLine,
  VENDOR: RiTeamLine,
  ADMIN: RiShieldLine,
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await authApi.getAllUsers();
      setUsers(data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await authApi.deleteUser(userToDelete.id);
      toast.success(`${userToDelete.name} deleted`);
      setUserToDelete(null);
      loadUsers();
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Users"
        subtitle={`${users.length} registered users`}
      />

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : users.length === 0 ? (
        <EmptyState title="No users found" message="Users will appear here once they register" icon={<RiUserLine />} />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  {['User', 'Email', 'Role', 'Action'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {users.map(user => {
                  const RoleIcon = roleIcons[user.role] || RiUserLine;
                  return (
                    <tr key={user.id} className="group hover:bg-white/3 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-brand-700 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-white">
                              {user.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-white">{user.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-400">{user.email}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${roleColors[user.role] || 'text-slate-400 bg-slate-400/10 border-slate-400/20'}`}>
                          <RoleIcon className="text-xs" />
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setUserToDelete(user)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                        >
                          <RiDeleteBinLine /> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Delete confirmation modal */}
      {userToDelete && (
        <DeleteConfirmModal
          user={userToDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setUserToDelete(null)}
          loading={deleting}
        />
      )}
    </DashboardLayout>
  );
}