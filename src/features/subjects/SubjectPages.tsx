import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Archive, ArrowLeft, BookOpen, Plus, Trash2 } from 'lucide-react'
import { z } from 'zod'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../auth/useAuth'
import {
  statusLabels,
  subjectSchema,
  topicSchema,
  topicStatuses,
  type TopicStatus,
} from './subjects'

type Subject = {
  id: string
  name: string
  color: string | null
  priority: number
  weekly_target_minutes: number | null
  exam_date: string | null
  is_archived: boolean
}
type Topic = {
  id: string
  subject_id: string
  name: string
  status: TopicStatus
  is_difficult: boolean
}
const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100'

function SubjectForm({
  initial,
  onCancel,
  onSaved,
}: {
  initial?: Subject
  onCancel: () => void
  onSaved: () => void
}) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const raw = Object.fromEntries(new FormData(event.currentTarget))
    const parsed = subjectSchema.safeParse(raw)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Check the form fields.')
      return
    }
    setBusy(true)
    const value = parsed.data
    const payload = {
      name: value.name,
      color: value.color || null,
      priority: value.priority,
      weekly_target_minutes:
        value.weekly_target_minutes === '' ? null : Number(value.weekly_target_minutes),
      exam_date: value.exam_date || null,
    }
    const result = initial
      ? await supabase.from('subjects').update(payload).eq('id', initial.id)
      : await supabase.from('subjects').insert(payload)
    setBusy(false)
    if (result.error) {
      setError(result.error.message)
      return
    }
    onSaved()
  }
  return (
    <form
      onSubmit={submit}
      className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2"
    >
      <label className="text-sm font-medium text-slate-700 sm:col-span-2">
        Subject name
        <input
          name="name"
          required
          maxLength={100}
          defaultValue={initial?.name ?? ''}
          className={`${inputClass} mt-1.5`}
          placeholder="e.g. Biology"
        />
      </label>
      <label className="text-sm font-medium text-slate-700">
        Color
        <input
          name="color"
          type="color"
          defaultValue={initial?.color ?? '#8b5cf6'}
          className={`${inputClass} mt-1.5 h-11 p-1.5`}
        />
      </label>
      <label className="text-sm font-medium text-slate-700">
        Priority
        <select
          name="priority"
          defaultValue={initial?.priority ?? 3}
          className={`${inputClass} mt-1.5`}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} — {n < 3 ? 'Lower' : n > 3 ? 'Higher' : 'Normal'}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium text-slate-700">
        Weekly target (minutes)
        <input
          name="weekly_target_minutes"
          type="number"
          min="1"
          max="10080"
          defaultValue={initial?.weekly_target_minutes ?? ''}
          className={`${inputClass} mt-1.5`}
          placeholder="Optional"
        />
      </label>
      <label className="text-sm font-medium text-slate-700">
        Exam date
        <input
          name="exam_date"
          type="date"
          defaultValue={initial?.exam_date ?? ''}
          className={`${inputClass} mt-1.5`}
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-700 sm:col-span-2">
          {error}
        </p>
      )}
      <div className="flex gap-2 sm:col-span-2">
        <button disabled={busy} className="button-primary">
          {busy ? 'Saving…' : initial ? 'Save changes' : 'Add subject'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-4 text-sm text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export function SubjectsPage() {
  const [items, setItems] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [creating, setCreating] = useState(false)
  const { user } = useAuth()
  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error: loadError } = await supabase
      .from('subjects')
      .select('id,name,color,priority,weekly_target_minutes,exam_date,is_archived')
      .eq('user_id', user.id)
      .eq('is_archived', showArchived)
      .order('name')
    if (loadError) setError(loadError.message)
    else {
      setError('')
      setItems(data ?? [])
    }
    setLoading(false)
  }, [user, showArchived])
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])
  async function toggleArchive(subject: Subject) {
    const { error: actionError } = await supabase
      .from('subjects')
      .update({ is_archived: !subject.is_archived })
      .eq('id', subject.id)
    if (actionError) setError(actionError.message)
    else void load()
  }
  async function remove(subject: Subject) {
    if (!window.confirm(`Permanently delete ${subject.name} and its topics?`)) return
    const { error: actionError } = await supabase
      .from('subjects')
      .delete()
      .eq('id', subject.id)
    if (actionError) setError(actionError.message)
    else void load()
  }
  return (
    <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
            Your learning space
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">My subjects</h1>
          <p className="mt-2 text-sm text-slate-500">
            Organize what you’re learning and keep each next step visible.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-700"
          >
            {showArchived ? 'Active subjects' : 'Archived'}
          </button>
          <button onClick={() => setCreating(!creating)} className="button-primary">
            <Plus size={16} /> Add subject
          </button>
        </div>
      </div>
      {creating && (
        <div className="mt-6">
          <SubjectForm
            onCancel={() => setCreating(false)}
            onSaved={() => {
              setCreating(false)
              void load()
            }}
          />
        </div>
      )}
      {error && (
        <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {loading ? (
        <p className="py-12 text-center text-sm text-slate-500">Loading subjects…</p>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <BookOpen className="mx-auto text-violet-500" size={26} />
          <h2 className="mt-4 font-semibold">
            {showArchived ? 'No archived subjects' : 'Start with a subject'}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {showArchived
              ? 'Archived subjects will appear here.'
              : 'Add just a name to begin. You can fill in goals and topics whenever you’re ready.'}
          </p>
          {!showArchived && (
            <button className="button-primary mt-5" onClick={() => setCreating(true)}>
              <Plus size={16} /> Add your first subject
            </button>
          )}
        </div>
      ) : (
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((subject) => (
            <article
              key={subject.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <span
                  className="flex size-10 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: `${subject.color ?? '#8b5cf6'}20`,
                    color: subject.color ?? '#8b5cf6',
                  }}
                >
                  <BookOpen size={19} />
                </span>
                <span className="text-xs text-slate-400">
                  Priority {subject.priority}
                </span>
              </div>
              <Link
                to={`/subjects/${subject.id}`}
                className="mt-4 block text-lg font-semibold hover:text-violet-700"
              >
                {subject.name}
              </Link>
              <p className="mt-1 text-sm text-slate-500">
                {subject.weekly_target_minutes
                  ? `${Math.round((subject.weekly_target_minutes / 60) * 10) / 10} hours / week`
                  : 'No weekly target set'}
                {subject.exam_date
                  ? ` · Exam ${new Date(`${subject.exam_date}T00:00:00`).toLocaleDateString()}`
                  : ''}
              </p>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => void toggleArchive(subject)}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                >
                  <Archive size={14} /> {showArchived ? 'Restore' : 'Archive'}
                </button>
                <button
                  onClick={() => void remove(subject)}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-red-700 hover:bg-red-50"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export function SubjectDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [subject, setSubject] = useState<Subject | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [addingTopic, setAddingTopic] = useState(false)
  const load = useCallback(async () => {
    if (!user || !z.string().uuid().safeParse(id).success) {
      setError('Subject not found.')
      setLoading(false)
      return
    }
    const [subjectResult, topicResult] = await Promise.all([
      supabase
        .from('subjects')
        .select('id,name,color,priority,weekly_target_minutes,exam_date,is_archived')
        .eq('id', id)
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('topics')
        .select('id,subject_id,name,status,is_difficult')
        .eq('subject_id', id)
        .eq('user_id', user.id)
        .order('position'),
    ])
    if (subjectResult.error) setError(subjectResult.error.message)
    else if (!subjectResult.data) setError('Subject not found.')
    else {
      setSubject(subjectResult.data)
      setError('')
    }
    if (topicResult.error) setError(topicResult.error.message)
    else setTopics(topicResult.data ?? [])
    setLoading(false)
  }, [user, id])
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])
  async function addTopic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return
    const form = event.currentTarget
    const parsed = topicSchema.safeParse({ name: new FormData(form).get('name') })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Enter a topic name.')
      return
    }
    const { error: insertError } = await supabase.from('topics').insert({
      subject_id: id,
      user_id: user.id,
      name: parsed.data.name,
      position: topics.length,
    })
    if (insertError) setError(insertError.message)
    else {
      setAddingTopic(false)
      form.reset()
      void load()
    }
  }
  async function patchTopic(
    topic: Topic,
    patch: Partial<Pick<Topic, 'status' | 'is_difficult'>>,
  ) {
    const { error: updateError } = await supabase
      .from('topics')
      .update(patch)
      .eq('id', topic.id)
      .eq('subject_id', id)
    if (updateError) setError(updateError.message)
    else void load()
  }
  async function deleteTopic(topic: Topic) {
    const { error: deleteError } = await supabase
      .from('topics')
      .delete()
      .eq('id', topic.id)
      .eq('subject_id', id)
    if (deleteError) setError(deleteError.message)
    else void load()
  }
  if (loading) return <div className="p-10 text-sm text-slate-500">Loading subject…</div>
  if (!subject)
    return (
      <section className="mx-auto max-w-4xl px-5 py-10">
        <p role="alert" className="text-sm text-red-700">
          {error || 'Subject not found.'}
        </p>
        <Link className="mt-4 inline-block text-sm text-violet-700" to="/subjects">
          Back to subjects
        </Link>
      </section>
    )
  return (
    <section className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-10">
      <button
        onClick={() => navigate('/subjects')}
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-violet-700"
      >
        <ArrowLeft size={16} /> All subjects
      </button>
      {editing ? (
        <SubjectForm
          initial={subject}
          onCancel={() => setEditing(false)}
          onSaved={() => {
            setEditing(false)
            void load()
          }}
        />
      ) : (
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
              Subject detail
            </p>
            <h1 className="mt-2 text-3xl font-semibold">{subject.name}</h1>
            <p className="mt-2 text-sm text-slate-500">
              {subject.weekly_target_minutes
                ? `${subject.weekly_target_minutes} minutes weekly`
                : 'No weekly target'}
              {subject.exam_date ? ` · Exam ${subject.exam_date}` : ''}
            </p>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
          >
            Edit subject
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="mt-8 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Chapters & topics</h2>
          <p className="mt-1 text-sm text-slate-500">
            Track progress and flag topics to revisit.
          </p>
        </div>
        <button onClick={() => setAddingTopic(!addingTopic)} className="button-primary">
          <Plus size={16} /> Add topic
        </button>
      </div>
      {addingTopic && (
        <form
          onSubmit={addTopic}
          className="mt-4 flex gap-2 rounded-2xl border border-slate-200 bg-white p-4"
        >
          <input
            name="name"
            required
            maxLength={120}
            placeholder="Topic or chapter name"
            className={inputClass}
          />
          <button className="button-primary">Add</button>
        </form>
      )}
      {topics.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="font-medium">No topics yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Break this subject into chapters or topics when you’re ready.
          </p>
        </div>
      ) : (
        <ul className="mt-5 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
          {topics.map((topic) => (
            <li key={topic.id} className="flex flex-wrap items-center gap-3 p-4">
              <span className="min-w-0 flex-1 font-medium">
                {topic.name}
                {topic.is_difficult && (
                  <span className="ml-2 rounded-full bg-amber-50 px-2 py-1 text-[11px] text-amber-800">
                    Revisit
                  </span>
                )}
              </span>
              <select
                aria-label={`Status for ${topic.name}`}
                value={topic.status}
                onChange={(event) =>
                  void patchTopic(topic, { status: event.target.value as TopicStatus })
                }
                className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
              >
                {topicStatuses.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
              <button
                onClick={() =>
                  void patchTopic(topic, { is_difficult: !topic.is_difficult })
                }
                className={`rounded-lg border px-2.5 py-1.5 text-xs ${topic.is_difficult ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-slate-200 text-slate-600'}`}
              >
                {topic.is_difficult ? 'Marked difficult' : 'Mark difficult'}
              </button>
              <button
                aria-label={`Delete ${topic.name}`}
                onClick={() => void deleteTopic(topic)}
                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
