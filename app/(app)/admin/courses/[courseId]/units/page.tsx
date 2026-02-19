'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

type UnitRow = {
  id: string;
  title: string;
  description: string;
  order: number;
  courseId: string;
  lessonCount: number;
};

export default function AdminUnitsPage() {
  const params = useParams();
  const courseId = params?.courseId as string;
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courseTitle, setCourseTitle] = useState('');
  const [units, setUnits] = useState<UnitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formOrder, setFormOrder] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin ?? false;

  useEffect(() => {
    if (status === 'loading') return;
    if (!isAdmin) {
      router.replace('/learn');
      return;
    }
    if (!courseId) return;
    (async () => {
      try {
        const [courseRes, unitsRes] = await Promise.all([
          fetch(`/api/courses/${courseId}`),
          fetch(`/api/admin/units?courseId=${encodeURIComponent(courseId)}`),
        ]);
        if (courseRes.ok) {
          const courseData = await courseRes.json();
          setCourseTitle(courseData.title || 'Course');
        }
        if (unitsRes.ok) {
          const unitsData = await unitsRes.json();
          setUnits(unitsData);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [status, isAdmin, courseId, router]);

  const fetchUnits = async () => {
    if (!courseId) return;
    try {
      const res = await fetch(`/api/admin/units?courseId=${encodeURIComponent(courseId)}`);
      if (res.ok) setUnits(await res.json());
    } catch {
      // ignore
    }
  };

  const openAdd = () => {
    setFormTitle('');
    setFormDescription('');
    setFormOrder('');
    setError(null);
    setShowAddModal(true);
  };

  const openEdit = (u: UnitRow) => {
    setEditingId(u.id);
    setFormTitle(u.title);
    setFormDescription(u.description ?? '');
    setFormOrder(String(u.order));
    setError(null);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setEditingId(null);
    setDeletingId(null);
    setError(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          title: formTitle.trim(),
          description: formDescription.trim(),
          order: formOrder.trim() ? parseInt(formOrder, 10) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create unit');
        return;
      }
      closeModals();
      await fetchUnits();
    } catch {
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/units/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle.trim(),
          description: formDescription.trim(),
          order: formOrder.trim() ? parseInt(formOrder, 10) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update unit');
        return;
      }
      closeModals();
      await fetchUnits();
    } catch {
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (unitId: string) => {
    setDeletingId(unitId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/units/${unitId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to delete unit');
        return;
      }
      closeModals();
      await fetchUnits();
    } catch {
      setError('Something went wrong');
    } finally {
      setDeletingId(null);
    }
  };

  if (status === 'loading' || !isAdmin) {
    return (
      <div className="min-h-screen bg-panel flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-panel py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-4 text-sm text-muted">
          <Link href="/admin/courses" className="hover:text-primary">← Courses</Link>
          {courseTitle && <span className="mx-2">·</span>}
          <span>{courseTitle || 'Units'}</span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-text">Units</h1>
          <Button variant="primary" onClick={openAdd}>
            Add unit
          </Button>
        </div>

        <Card>
          {loading ? (
            <div className="space-y-2">
              <div className="h-12 rounded-lg bg-panel animate-pulse" />
              <div className="h-12 rounded-lg bg-panel animate-pulse" />
            </div>
          ) : units.length === 0 ? (
            <p className="text-muted">No units yet. Add one to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 font-semibold text-text">Order</th>
                    <th className="pb-3 font-semibold text-text">Title</th>
                    <th className="pb-3 font-semibold text-text">Lessons</th>
                    <th className="pb-3 font-semibold text-text">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((u) => (
                    <tr key={u.id} className="border-b border-border/50">
                      <td className="py-3 text-muted">{u.order}</td>
                      <td className="py-3 text-text font-medium">{u.title}</td>
                      <td className="py-3 text-muted">{u.lessonCount}</td>
                      <td className="py-3 flex gap-2 flex-wrap">
                        <Link href={`/admin/units/${u.id}/lessons`}>
                          <Button variant="tertiary" size="sm">Lessons</Button>
                        </Link>
                        <Button variant="tertiary" size="sm" onClick={() => openEdit(u)}>Edit</Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="border-danger text-danger hover:bg-danger hover:text-white"
                          onClick={() => {
                            if (confirm(`Delete "${u.title}"? This removes all lessons and exercises.`)) {
                              handleDelete(u.id);
                            }
                          }}
                          disabled={deletingId === u.id}
                        >
                          {deletingId === u.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal isOpen={showAddModal} onClose={closeModals} title="Add unit" showCloseButton={!saving}>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Title</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-border rounded-lg"
              placeholder="e.g. Unit 1: Basics"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Description (optional)</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Order (optional)</label>
            <input
              type="number"
              min={1}
              value={formOrder}
              onChange={(e) => setFormOrder(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg"
              placeholder="Auto"
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="tertiary" onClick={closeModals} disabled={saving}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Creating...' : 'Create unit'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!editingId} onClose={closeModals} title="Edit unit" showCloseButton={!saving}>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Title</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Description (optional)</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Order</label>
            <input
              type="number"
              min={1}
              value={formOrder}
              onChange={(e) => setFormOrder(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg"
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="tertiary" onClick={closeModals} disabled={saving}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
