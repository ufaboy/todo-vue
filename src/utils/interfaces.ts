import type { Timestamp } from "firebase/firestore"

interface BaseTask {
  name: string
  groupId: string
}

interface Task extends BaseTask {
  id: string
  createdAt: Timestamp
  completedAt: Timestamp
}
interface BaseGroup {
  name: string
}
interface Group extends BaseGroup {
  id: string
  tasks?: string[]
  taskCount: number
  createdAt: Timestamp
}

export type { BaseTask, BaseGroup, Task, Group }
