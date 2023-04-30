interface BaseTask {
  name: string
  groupId: string
}

interface Task extends BaseTask {
  id: string
  createdAt: string
  completedAt: string
  deletedAt: string
}
interface BaseGroup {
  name: string
}
interface Group extends BaseGroup {
  id: string
  taskCount: number
  createdAt: string
  deletedAt: string
}

export type { BaseTask, BaseGroup, Task, Group }
