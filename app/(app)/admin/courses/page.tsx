'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

type CourseRow = {
  id: string;
  title: string;
  description: string;
  language: string;
  unitCount: number;
};

export default function AdminCoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLanguage, setFormLanguage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin ?? false;

  useEffect(() => {
    if (status === 'loading') return;
    if (!isAdmin) {
      router.replace('/learn');
      return;
    }
    fetchCourses();
  }, [status, isAdmin, router]);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/admin/courses');
      if (!res.ok) return;
      const data = await res.json();
      setCourses(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setFormTitle('');
    setFormDescription('');
    setFormLanguage('');
    setError(null);
    setShowAddModal(true);
  };

  const openEdit = (c: CourseRow) => {
    setEditingId(c.id);
    setFormTitle(c.title);
    setFormDescription(c.description ?? '');
    setFormLanguage(c.language);
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
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle.trim(),
          description: formDescription.trim(),
          language: formLanguage.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create course');
        return;
      }
      closeModals();
      await fetchCourses();
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
      const res = await fetch(`/api/admin/courses/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle.trim(),
          description: formDescription.trim(),
          language: formLanguage.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update course');
        return;
      }
      closeModals();
      await fetchCourses();
    } catch {
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (courseId: string) => {
    setDeletingId(courseId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to delete course');
        return;
      }
      closeModals();
      await fetchCourses();
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-text">Manage courses</h1>
          <Button variant="primary" onClick={openAdd}>
            Add course
          </Button>
        </div>

        <Card>
          {loading ? (
            <div className="space-y-2">
              <div className="h-12 rounded-lg bg-panel animate-pulse" />
              <div className="h-12 rounded-lg bg-panel animate-pulse" />
            </div>
          ) : courses.length === 0 ? (
            <p className="text-muted">No courses yet. Add one to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 font-semibold text-text">Language</th>
                    <th className="pb-3 font-semibold text-text">Title</th>
                    <th className="pb-3 font-semibold text-text">Units</th>
                    <th className="pb-3 font-semibold text-text">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => (
                    <tr key={c.id} className="border-b border-border/50">
                      <td className="py-3 text-text font-medium">{c.language}</td>
                      <td className="py-3 text-muted">{c.title}</td>
                      <td className="py-3 text-muted">{c.unitCount}</td>
                      <td className="py-3 flex gap-2 flex-wrap">
                        <Link href={`/admin/courses/${c.id}/units`}>
                          <Button variant="tertiary" size="sm">
                            Units
                          </Button>
                        </Link>
                        <Button variant="tertiary" size="sm" onClick={() => openEdit(c)}>
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="border-danger text-danger hover:bg-danger hover:text-white"
                          onClick={() => {
                            if (confirm(`Delete "${c.title}"? This removes all units, lessons, and exercises.`)) {
                              handleDelete(c.id);
                            }
                          }}
                          disabled={deletingId === c.id}
                        >
                          {deletingId === c.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <p className="mt-4 text-sm text-muted">
          Click <strong>Units</strong> on a course to manage its units, then lessons and exercises.
        </p>
      </div>

      {/* Add course modal */}
      <Modal isOpen={showAddModal} onClose={closeModals} title="Add course" showCloseButton={!saving}>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Language</label>
            <input
              type="text"
              value={formLanguage}
              onChange={(e) => setFormLanguage(e.target.value)}
              required
              className="w-full px-4 py-2 border border-border rounded-lg"
              placeholder="e.g. Spanish"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Title</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-border rounded-lg"
              placeholder="e.g. Spanish for Beginners"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Description (optional)</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-border rounded-lg"
              placeholder="Short description for the language grid"
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="tertiary" onClick={closeModals} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Creating...' : 'Create course'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit course modal */}
      <Modal isOpen={!!editingId} onClose={closeModals} title="Edit course" showCloseButton={!saving}>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Language</label>
            <input
              type="text"
              value={formLanguage}
              onChange={(e) => setFormLanguage(e.target.value)}
              required
              className="w-full px-4 py-2 border border-border rounded-lg"
            />
          </div>
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
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="tertiary" onClick={closeModals} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
