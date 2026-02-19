'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

const DAILY_REMINDER_KEY = 'langapp_daily_reminder';

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completedLessonsCount, setCompletedLessonsCount] = useState(0);
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Settings state
  const [displayName, setDisplayName] = useState('');
  const [displayNameSaving, setDisplayNameSaving] = useState(false);
  const [displayNameMessage, setDisplayNameMessage] = useState<'success' | 'error' | null>(null);
  const [dailyReminder, setDailyReminder] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progressRes, attemptsRes] = await Promise.all([
          fetch('/api/progress'),
          fetch('/api/attempts/recent'),
        ]);

        if (progressRes.ok) {
          const progress = await progressRes.json();
          setXp(progress.xp ?? 0);
          setStreak(progress.streak ?? 0);
          const completedLessons: string[] = progress.completedLessons ?? [];
          setCompletedLessonsCount(completedLessons.length);
        }

        if (attemptsRes.ok) {
          const attempts = await attemptsRes.json();
          setRecentAttempts(attempts);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Load profile for settings and daily reminder from localStorage
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setDisplayName(data.name ?? '');
        }
      } catch {
        // ignore
      }
    };
    loadProfile();

    try {
      const stored = localStorage.getItem(DAILY_REMINDER_KEY);
      setDailyReminder(stored === 'true');
    } catch {
      // ignore
    }
  }, []);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisplayNameSaving(true);
    setDisplayNameMessage(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: displayName.trim() || '' }),
      });
      if (res.ok) {
        setDisplayNameMessage('success');
        updateSession?.({ name: displayName.trim() || undefined });
      } else {
        setDisplayNameMessage('error');
      }
    } catch {
      setDisplayNameMessage('error');
    } finally {
      setDisplayNameSaving(false);
    }
  };

  const handleDailyReminderChange = (checked: boolean) => {
    setDailyReminder(checked);
    try {
      localStorage.setItem(DAILY_REMINDER_KEY, String(checked));
    } catch {
      // ignore
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'delete') return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' });
      if (res.ok) {
        signOut({ callbackUrl: '/login' });
        return;
      }
      const data = await res.json().catch(() => ({}));
      setDeleteError(data.error || 'Failed to delete account');
    } catch {
      setDeleteError('Something went wrong. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const userEmail = session?.user?.email as string | undefined;

  return (
    <div className="min-h-screen bg-panel py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-text">Profile</h1>
          <Button
            variant="secondary"
            onClick={() => {
              signOut({ callbackUrl: '/login' });
            }}
          >
            Log out
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="text-center">
              <div className="text-4xl mb-2">⭐</div>
              {loading ? (
                <div className="h-8 w-16 mx-auto rounded-lg bg-panel animate-pulse mb-1" />
              ) : (
                <p className="text-3xl font-bold text-text mb-1">{xp}</p>
              )}
              <p className="text-muted">Total XP</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="text-4xl mb-2">🔥</div>
              {loading ? (
                <div className="h-8 w-16 mx-auto rounded-lg bg-panel animate-pulse mb-1" />
              ) : (
                <p className="text-3xl font-bold text-text mb-1">{streak}</p>
              )}
              <p className="text-muted">Day Streak</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="text-4xl mb-2">✓</div>
              {loading ? (
                <div className="h-8 w-16 mx-auto rounded-lg bg-panel animate-pulse mb-1" />
              ) : (
                <p className="text-3xl font-bold text-text mb-1">{completedLessonsCount}</p>
              )}
              <p className="text-muted">Lessons Completed</p>
            </div>
          </Card>
        </div>

        <Card>
          <h2 className="text-2xl font-bold text-text mb-4">Recent Attempts</h2>
          {loading ? (
            <div className="space-y-3">
              <div className="h-16 rounded-lg bg-panel animate-pulse" />
              <div className="h-16 rounded-lg bg-panel animate-pulse" />
            </div>
          ) : recentAttempts.length === 0 ? (
            <p className="text-muted">No attempts yet. Start learning!</p>
          ) : (
            <div className="space-y-4">
              {recentAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="bg-panel p-4 rounded-lg border border-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-text">
                      {attempt.lessonTitle || 'Unknown Lesson'}
                    </h3>
                    <Badge variant="primary">+{attempt.xpEarned} XP</Badge>
                  </div>
                  <p className="text-sm text-muted">
                    {attempt.accuracy}% accuracy •{' '}
                    {new Date(attempt.completedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {userEmail && (
          <Card className="mt-6">
            <h2 className="text-xl font-bold text-text mb-2">Account</h2>
            <p className="text-muted">
              <strong>Email:</strong> {userEmail}
            </p>
          </Card>
        )}

        {(session?.user as { isAdmin?: boolean } | undefined)?.isAdmin && (
          <Card className="mt-6">
            <h2 className="text-xl font-bold text-text mb-2">Admin</h2>
            <p className="text-muted text-sm mb-4">
              Add, edit, or remove courses. Only visible to admins.
            </p>
            <Link href="/admin/courses">
              <Button variant="primary">Manage courses</Button>
            </Link>
          </Card>
        )}

        <Card className="mt-6">
          <h2 className="text-xl font-bold text-text mb-4">Settings</h2>

          <form onSubmit={handleSaveName} className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-text mb-2">
                Display name
              </label>
              <div className="flex gap-2">
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={100}
                  className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Your name"
                />
                <Button type="submit" variant="primary" disabled={displayNameSaving}>
                  {displayNameSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
              {displayNameMessage === 'success' && (
                <p className="mt-1 text-sm text-green-600">Name updated.</p>
              )}
              {displayNameMessage === 'error' && (
                <p className="mt-1 text-sm text-danger">Failed to update name.</p>
              )}
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={dailyReminder}
                onChange={(e) => handleDailyReminderChange(e.target.checked)}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-text font-medium">Daily reminder</span>
            </label>
            <p className="text-sm text-muted mt-1 ml-8">
              Get a reminder to practice (saved on this device only).
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="text-lg font-semibold text-text mb-2">Danger zone</h3>
            <p className="text-sm text-muted mb-3">
              Deleting your account will remove all your data (progress, attempts, credits) and cannot be undone.
            </p>
            <Button
              variant="secondary"
              className="border-danger text-danger hover:bg-danger hover:text-white"
              onClick={() => {
                setShowDeleteModal(true);
                setDeleteConfirm('');
                setDeleteError(null);
              }}
            >
              Delete my account
            </Button>
          </div>
        </Card>

        <Modal
          isOpen={showDeleteModal}
          onClose={() => !deleting && setShowDeleteModal(false)}
          title="Delete account?"
          showCloseButton={!deleting}
        >
          <p className="text-muted mb-4">
            This will permanently delete your account and all your data. Type <strong>delete</strong> below to confirm.
          </p>
          <input
            type="text"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="Type delete"
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4"
            disabled={deleting}
          />
          {deleteError && (
            <p className="text-sm text-danger mb-4">{deleteError}</p>
          )}
          <div className="flex gap-2 justify-end">
            <Button
              variant="tertiary"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="bg-danger hover:bg-red-700 focus:ring-danger"
              onClick={handleDeleteAccount}
              disabled={deleteConfirm !== 'delete' || deleting}
            >
              {deleting ? 'Deleting...' : 'Delete account'}
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
