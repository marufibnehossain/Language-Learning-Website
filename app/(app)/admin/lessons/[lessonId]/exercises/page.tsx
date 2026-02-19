'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

type ExerciseRow = {
  id: string;
  type: string;
  prompt: string;
  question: string;
  optionsJson: string;
  answer: string;
  explanation: string | null;
  lessonId: string;
};

export default function AdminExercisesPage() {
  const params = useParams();
  const lessonId = params?.lessonId as string;
  const { data: session, status } = useSession();
  const router = useRouter();
  const [lessonTitle, setLessonTitle] = useState('');
  const [unitId, setUnitId] = useState('');
  const [exercises, setExercises] = useState<ExerciseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formType, setFormType] = useState<'mcq' | 'fill_blank' | 'match_pairs'>('mcq');
  const [formPrompt, setFormPrompt] = useState('');
  const [formQuestion, setFormQuestion] = useState('');
  const [formOptionsText, setFormOptionsText] = useState(''); // one per line for mcq
  const [formAnswer, setFormAnswer] = useState('');
  const [formExplanation, setFormExplanation] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin ?? false;

  useEffect(() => {
    if (status === 'loading') return;
    if (!isAdmin) {
      router.replace('/learn');
      return;
    }
    if (!lessonId) return;
    (async () => {
      try {
        const [lessonRes, exercisesRes] = await Promise.all([
          fetch(`/api/admin/lessons/${lessonId}`),
          fetch(`/api/admin/exercises?lessonId=${encodeURIComponent(lessonId)}`),
        ]);
        if (lessonRes.ok) {
          const lessonData = await lessonRes.json();
          setLessonTitle(lessonData.title || 'Lesson');
          setUnitId(lessonData.unitId || '');
        }
        if (exercisesRes.ok) {
          setExercises(await exercisesRes.json());
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [status, isAdmin, lessonId, router]);

  const fetchExercises = async () => {
    if (!lessonId) return;
    try {
      const res = await fetch(`/api/admin/exercises?lessonId=${encodeURIComponent(lessonId)}`);
      if (res.ok) setExercises(await res.json());
    } catch {
      // ignore
    }
  };

  const optionsTextToJson = (text: string): string => {
    const lines = text
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    return JSON.stringify(lines);
  };

  const optionsJsonToText = (json: string): string => {
    try {
      const arr = JSON.parse(json || '[]');
      return Array.isArray(arr) ? arr.join('\n') : '';
    } catch {
      return '';
    }
  };

  const openAdd = () => {
    setFormType('mcq');
    setFormPrompt('');
    setFormQuestion('');
    setFormOptionsText('');
    setFormAnswer('');
    setFormExplanation('');
    setError(null);
    setShowAddModal(true);
  };

  const openEdit = (e: ExerciseRow) => {
    setEditingId(e.id);
    setFormType((e.type as 'mcq' | 'fill_blank' | 'match_pairs') || 'mcq');
    setFormPrompt(e.prompt);
    setFormQuestion(e.question);
    setFormOptionsText(optionsJsonToText(e.optionsJson));
    setFormAnswer(e.answer);
    setFormExplanation(e.explanation ?? '');
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
      const optionsJson = formType === 'mcq' ? optionsTextToJson(formOptionsText) : '[]';
      const res = await fetch('/api/admin/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          type: formType,
          prompt: formPrompt.trim(),
          question: formQuestion.trim(),
          optionsJson,
          answer: formAnswer.trim(),
          explanation: formExplanation.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create exercise');
        return;
      }
      closeModals();
      await fetchExercises();
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
      const optionsJson = formType === 'mcq' ? optionsTextToJson(formOptionsText) : '[]';
      const res = await fetch(`/api/admin/exercises/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formType,
          prompt: formPrompt.trim(),
          question: formQuestion.trim(),
          optionsJson,
          answer: formAnswer.trim(),
          explanation: formExplanation.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update exercise');
        return;
      }
      closeModals();
      await fetchExercises();
    } catch {
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (exerciseId: string) => {
    setDeletingId(exerciseId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/exercises/${exerciseId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to delete exercise');
        return;
      }
      closeModals();
      await fetchExercises();
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
          {unitId && (
            <>
              <span className="mx-2">·</span>
              <Link href={`/admin/units/${unitId}/lessons`} className="hover:text-primary">Lessons</Link>
            </>
          )}
          {lessonTitle && (
            <>
              <span className="mx-2">·</span>
              <span>{lessonTitle}</span>
            </>
          )}
        </div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-text">Exercises</h1>
          <Button variant="primary" onClick={openAdd}>
            Add exercise
          </Button>
        </div>

        <Card>
          {loading ? (
            <div className="space-y-2">
              <div className="h-12 rounded-lg bg-panel animate-pulse" />
              <div className="h-12 rounded-lg bg-panel animate-pulse" />
            </div>
          ) : exercises.length === 0 ? (
            <p className="text-muted">No exercises yet. Add one to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 font-semibold text-text">Type</th>
                    <th className="pb-3 font-semibold text-text">Prompt</th>
                    <th className="pb-3 font-semibold text-text">Question</th>
                    <th className="pb-3 font-semibold text-text">Answer</th>
                    <th className="pb-3 font-semibold text-text">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {exercises.map((ex) => (
                    <tr key={ex.id} className="border-b border-border/50">
                      <td className="py-3 text-muted">{ex.type}</td>
                      <td className="py-3 text-text max-w-[180px] truncate">{ex.prompt}</td>
                      <td className="py-3 text-muted max-w-[180px] truncate">{ex.question}</td>
                      <td className="py-3 text-muted max-w-[120px] truncate">{ex.answer}</td>
                      <td className="py-3 flex gap-2 flex-wrap">
                        <Button variant="tertiary" size="sm" onClick={() => openEdit(ex)}>Edit</Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="border-danger text-danger hover:bg-danger hover:text-white"
                          onClick={() => {
                            if (confirm('Delete this exercise?')) {
                              handleDelete(ex.id);
                            }
                          }}
                          disabled={deletingId === ex.id}
                        >
                          {deletingId === ex.id ? 'Deleting...' : 'Delete'}
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

      <Modal isOpen={showAddModal} onClose={closeModals} title="Add exercise" showCloseButton={!saving}>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Type</label>
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value as 'mcq' | 'fill_blank' | 'match_pairs')}
              className="w-full px-4 py-2 border border-border rounded-lg"
            >
              <option value="mcq">Multiple choice (mcq)</option>
              <option value="fill_blank">Fill in the blank</option>
              <option value="match_pairs">Match pairs</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Prompt</label>
            <input
              type="text"
              value={formPrompt}
              onChange={(e) => setFormPrompt(e.target.value)}
              required
              className="w-full px-4 py-2 border border-border rounded-lg"
              placeholder="e.g. Choose the correct translation:"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Question</label>
            <input
              type="text"
              value={formQuestion}
              onChange={(e) => setFormQuestion(e.target.value)}
              required
              className="w-full px-4 py-2 border border-border rounded-lg"
              placeholder="e.g. Good morning"
            />
          </div>
          {formType === 'mcq' && (
            <div>
              <label className="block text-sm font-medium text-text mb-1">Options (one per line)</label>
              <textarea
                value={formOptionsText}
                onChange={(e) => setFormOptionsText(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-border rounded-lg font-mono text-sm"
                placeholder="Buenos días&#10;Buenas noches&#10;Gracias"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-text mb-1">Correct answer</label>
            <input
              type="text"
              value={formAnswer}
              onChange={(e) => setFormAnswer(e.target.value)}
              required
              className="w-full px-4 py-2 border border-border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Explanation (optional)</label>
            <textarea
              value={formExplanation}
              onChange={(e) => setFormExplanation(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-border rounded-lg"
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="tertiary" onClick={closeModals} disabled={saving}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Creating...' : 'Create exercise'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!editingId} onClose={closeModals} title="Edit exercise" showCloseButton={!saving}>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Type</label>
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value as 'mcq' | 'fill_blank' | 'match_pairs')}
              className="w-full px-4 py-2 border border-border rounded-lg"
            >
              <option value="mcq">Multiple choice (mcq)</option>
              <option value="fill_blank">Fill in the blank</option>
              <option value="match_pairs">Match pairs</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Prompt</label>
            <input
              type="text"
              value={formPrompt}
              onChange={(e) => setFormPrompt(e.target.value)}
              required
              className="w-full px-4 py-2 border border-border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Question</label>
            <input
              type="text"
              value={formQuestion}
              onChange={(e) => setFormQuestion(e.target.value)}
              required
              className="w-full px-4 py-2 border border-border rounded-lg"
            />
          </div>
          {formType === 'mcq' && (
            <div>
              <label className="block text-sm font-medium text-text mb-1">Options (one per line)</label>
              <textarea
                value={formOptionsText}
                onChange={(e) => setFormOptionsText(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-border rounded-lg font-mono text-sm"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-text mb-1">Correct answer</label>
            <input
              type="text"
              value={formAnswer}
              onChange={(e) => setFormAnswer(e.target.value)}
              required
              className="w-full px-4 py-2 border border-border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Explanation (optional)</label>
            <textarea
              value={formExplanation}
              onChange={(e) => setFormExplanation(e.target.value)}
              rows={2}
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
