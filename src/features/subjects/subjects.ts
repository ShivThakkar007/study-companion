import { z } from 'zod'

export const subjectSchema = z.object({
  name: z.string().trim().min(1, 'Enter a subject name.').max(100),
  color: z.union([z.literal(''), z.string().regex(/^#[0-9a-fA-F]{6}$/)]).optional(),
  priority: z.coerce.number().int().min(1).max(5),
  weekly_target_minutes: z
    .union([z.literal(''), z.coerce.number().int().min(1).max(10080)])
    .optional(),
  exam_date: z.string().optional(),
})
export type SubjectInput = z.infer<typeof subjectSchema>
export const topicStatuses = [
  'not_started',
  'in_progress',
  'completed',
  'needs_revision',
] as const
export type TopicStatus = (typeof topicStatuses)[number]
export const topicSchema = z.object({
  name: z.string().trim().min(1, 'Enter a topic name.').max(120),
})
export const statusLabels: Record<TopicStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  completed: 'Completed',
  needs_revision: 'Needs revision',
}
