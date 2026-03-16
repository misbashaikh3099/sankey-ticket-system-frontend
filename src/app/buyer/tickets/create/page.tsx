'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { ticketApi, fileApi } from '@/lib/ticketApi';
import { Priority } from '@/types';
import { Card, PageHeader, Button, Input, Textarea, Select } from '@/components/ui';
import toast from 'react-hot-toast';
import { RiUploadLine, RiCloseLine, RiCheckLine } from 'react-icons/ri';

export default function CreateTicketPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as Priority,
  });
  const [attachments, setAttachments] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const name = await fileApi.upload(file);
        uploaded.push(name);
      }
      setAttachments((prev) => [...prev, ...uploaded]);
      toast.success(`${uploaded.length} file(s) uploaded`);
    } catch {
      toast.error('File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !user) return;
    setSubmitting(true);
    try {
      await ticketApi.create({ ...form, buyerId: user.id, attachments });
      toast.success('Ticket created successfully!');
      router.push('/buyer/tickets');
    } catch {
      toast.error('Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const priorityOptions = [
    { value: 'LOW', label: '🟢 Low — Not urgent' },
    { value: 'MEDIUM', label: '🟡 Medium — Normal priority' },
    { value: 'HIGH', label: '🟠 High — Needs attention soon' },
    { value: 'CRITICAL', label: '🔴 Critical — Immediate action required' },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Create New Ticket"
        subtitle="Submit a support request and we'll get back to you"
      />

      <div className="max-w-2xl">
        <Card className="p-7">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Ticket Title"
              placeholder="Brief summary of your issue..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              error={errors.title}
            />

            <Textarea
              label="Description"
              placeholder="Please describe your issue in detail. Include steps to reproduce, expected behavior, and any relevant information..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={5}
              error={errors.description}
            />

            <Select
              label="Priority"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
              options={priorityOptions}
            />

           
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Attachments (optional)</label>
              <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-white/20 hover:border-brand-500/50 cursor-pointer transition-colors group">
                <RiUploadLine className="text-slate-500 group-hover:text-brand-400 text-lg transition-colors" />
                <div>
                  <p className="text-sm text-slate-400 group-hover:text-slate-300">Click to upload files</p>
                  <p className="text-xs text-slate-600">Any file type accepted</p>
                </div>
                <input type="file" multiple className="hidden" onChange={handleFileUpload} disabled={uploading} />
                {uploading && (
                  <div className="ml-auto w-4 h-4 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                )}
              </label>
              {attachments.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  {attachments.map((att, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/8">
                      <div className="flex items-center gap-2">
                        <RiCheckLine className="text-emerald-400 text-sm" />
                        <span className="text-xs text-slate-300 font-mono truncate max-w-xs">{att}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAttachments(attachments.filter((_, j) => j !== i))}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <RiCloseLine />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={submitting} size="lg">
                Submit Ticket
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => router.push('/buyer/tickets')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
