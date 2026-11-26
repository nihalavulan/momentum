import { addDays, todayISO } from '../../lib/dates.ts'
import type { Move } from './types.ts'

/** Realistic seed data so the Today view has something in it. Temporary. */
export function createSampleMoves(): Move[] {
  const today = todayISO()
  const at = (day: string, time: string) => new Date(`${day}T${time}`).toISOString()

  return [
    {
      id: 'move-1',
      title: 'Send invoice to Studio Nine',
      date: addDays(today, -2),
      done: false,
      doneAt: null,
      createdAt: at(addDays(today, -3), '18:20:00'),
      source: 'app',
    },
    {
      id: 'move-2',
      title: 'Book dentist appointment',
      date: addDays(today, -1),
      done: false,
      doneAt: null,
      createdAt: at(addDays(today, -1), '09:05:00'),
      source: 'app',
    },
    {
      id: 'move-3',
      title: 'Approve label proofs from the printer',
      date: today,
      done: false,
      doneAt: null,
      arcId: 'arc-zawj',
      createdAt: at(addDays(today, -1), '21:10:00'),
      source: 'app',
    },
    {
      id: 'move-4',
      title: 'Gym: upper body',
      date: today,
      done: false,
      doneAt: null,
      createdAt: at(addDays(today, -1), '21:12:00'),
      source: 'app',
    },
    {
      id: 'move-5',
      title: 'Rewrite the about page intro',
      date: today,
      done: false,
      doneAt: null,
      arcId: 'arc-portfolio',
      createdAt: at(today, '08:02:00'),
      source: 'ai',
    },
    {
      id: 'move-6',
      title: 'Order 200 gift boxes',
      date: today,
      done: true,
      doneAt: at(today, '08:40:00'),
      arcId: 'arc-zawj',
      createdAt: at(addDays(today, -2), '10:00:00'),
      source: 'app',
    },
    {
      id: 'move-7',
      title: 'Pay electricity bill',
      date: today,
      done: true,
      doneAt: at(today, '07:55:00'),
      createdAt: at(addDays(today, -1), '20:30:00'),
      source: 'app',
    },
  ]
}
