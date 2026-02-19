'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

type LessonRow = {
  id: string;
  title: string;
  description: string;
  order: number;
  xpReward: number;
  type: string;
  unitId: string;
  exerciseCount: number;
};

export default function AdminLessonsPage() {
  const params = useParams();
  const unitId = params?.unitId as string;
  const { data: session, status } = useSession();
  const router = useRouter();
  const [unitTitle, setUnitTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formOrder, setFormOrder] = useState('');
  const [formXpReward, setFormXpReward] = useState('10');
  const [formType, setFormType] = useState<'lesson' | 'practice' | 'story'>('lesson');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin ?? false;

  useEffect(() => {
    if (status === 'loading') return;
    if (!isAdmin) {
      router.replace('/learn');
      return;
    }
    if (!unitId) return;
    (async () => {
      try {
        const [unitRes, lessonsRes] = await Promise.all([
          fetch(`/api/admin/units/${unitId}`),
          fetch(`/api/admin/lessons?unitId=${encodeURIComponent(unitId)}`),
        ]);
        if (unitRes.ok) {
          const unitData = await unitRes.json();
          setUnitTitle(unitData.title || 'Unit');
          setCourseId(unitData.courseId || '');
        }
        if (lessonsRes.ok) {
          setLessons(await lessonsRes.json());
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [status, isAdmin, unitId, router]);

  const fetchLessons = async () => {
    if (!unitId) return;
    try {
      const res = await fetch(`/api/admin/lessons?unitId=${encodeURIComponent(unitId)}`);
      if (res.ok) setLessons(await res.json());
    } catch {
      // ignore
    }
  };

  const openAdd = () => {
    setFormTitle('');
    setFormDescription('');
    setFormOrder('');
    setFormXpReward('10');
    setFormType('lesson');
    setError(null);
    setShowAddModal(true);
  };

  const openEdit = (l: LessonRow) => {
    setEditingId(l.id);
    setFormTitle(l.title);
    setFormDescription(l.description ?? '');
    setFormOrder(String(l.order));
    setFormXpReward(String(l.xpReward));
    setFormType((l.type as 'lesson' | 'practice' | 'story') || 'lesson');
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
      const res = await fetch('/api/admin/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitId,
          title: formTitle.trim(),
          description: formDescription.trim(),
          order: formOrder.trim() ? parseInt(formOrder, 10) : undefined,
          xpReward: parseInt(formXpReward, 10) || 10,
          type: formType,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create lesson');
        return;
      }
      closeModals();
      await fetchLessons();
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
      const res = await fetch(`/api/admin/lessons/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle.trim(),
          description: formDescription.trim(),
          order: formOrder.trim() ? parseInt(formOrder, 10) : undefined,
          xpReward: parseInt(formXpReward, 10) || 10,
          type: formType,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update lesson');
        return;
      }
      closeModals();
      await fetchLessons();
    } catch {
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lessonId: string) => {
    setDeletingId(lessonId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to delete lesson');
        return;
      }
      closeModals();
      await fetchLessons();
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

  const unitsHref = courseId ? `/admin/courses/${courseId}/units` : '/admin/courses';

  return (
    <div className="min-h-screen bg-panel py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-4 text-sm text-muted">
          <Link href="/admin/courses" className="hover:text-primary">← Courses</Link>
          {courseId && (
            <>
              <span className="mx-2">·</span>
              <Link href={unitsHref} className="hover:text-primary">Units</Link>
            </>
          )}
          {unitTitle && (
            <>
              <span className="mx-2">·</span>
              <span>{unitTitle}</span>
            </>
          )}
        </div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-text">Lessons</h1>
          <Button variant="primary" onClick={openAdd}>
            Add lesson
          </Button>
        </div>

        <Card>
          {loading ? (
            <div className="space-y-2">
              <div className="h-12 rounded-lg bg-panel animate-pulse" />
              <div className="h-12 rounded-lg bg-panel animate-pulse" />
            </div>
          ) : lessons.length === 0 ? (
            <p className="text-muted">No lessons yet. Add one to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 font-semibold text-text">Order</th>
                    <th className="pb-3 font-semibold text-text">Title</th>
                    <th className="pb-3 font-semibold text-text">Type</th>
                    <th className="pb-3 font-semibold text-text">XP</th>
                    <th className="pb-3 font-semibold text-text">Exercises</th>
                    <th className="pb-3 font-semibold text-text">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.map((l) => (
                    <tr key={l.id} className="border-b border-border/50">
                      <td className="py-3 text-muted">{l.order}</td>
                      <td className="py-3 text-text font-medium">{l.title}</td>
                      <td className="py-3 text-muted">{l.type}</td>
                      <td className="py-3 text-muted">{l.xpReward}</td>
                      <td className="py-3 text-muted">{l.exerciseCount}</td>
                      <td className="py-3 flex gap-2 flex-wrap">
                        <Link href={`/admin/lessons/${l.id}/exercises`}>
                          <Button variant="tertiary" size="sm">Exercises</Button>
                        </Link>
                        <Button variant="tertiary" size="sm" onClick={() => openEdit(l)}>Edit</Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="border-danger text-danger hover:bg-danger hover:text-white"
                          onClick={() => {
                            if (confirm(`Delete "${l.title}"? This removes all exercises.`)) {
                              handleDelete(l.id);
                            }
                          }}
                          disabled={deletingId === l.id}
                        >
                          {deletingId === l.id ? 'Deleting...' : 'Delete'}
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

      <Modal isOpen={showAddModal} onClose={closeModals} title="Add lesson" showCloseButton={!saving}>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Title</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-border rounded-lg"
              placeholder="e.g. Greetings"
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Order (optional)</label>
              <input
                type="number"
                min={1}
                value={formOrder}
                onChange={(e) => setFormOrder(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">XP reward</label>
              <input
                type="number"
                min={0}
                value={formXpReward}
                onChange={(e) => setFormXpReward(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Type</label>
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value as 'lesson' | 'practice' | 'story')}
              className="w-full px-4 py-2 border border-border rounded-lg"
            >
              <option value="lesson">Lesson</option>
              <option value="practice">Practice</option>
              <option value="story">Story</option>
            </select>
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="tertiary" onClick={closeModals} disabled={saving}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Creating...' : 'Create lesson'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!editingId} onClose={closeModals} title="Edit lesson" showCloseButton={!saving}>
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
          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-text mb-1">XP reward</label>
              <input
                type="number"
                min={0}
                value={formXpReward}
                onChange={(e) => setFormXpReward(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Type</label>
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value as 'lesson' | 'practice' | 'story')}
              className="w-full px-4 py-2 border border-border rounded-lg"
            >
              <option value="lesson">Lesson</option>
              <option value="practice">Practice</option>
              <option value="story">Story</option>
            </select>
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
