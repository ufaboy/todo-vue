<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useRoute } from 'vue-router'
import { firebaseApp } from "@/utils/firebase";
import { documentId, query, getFirestore, where, collection, getDocs, getCountFromServer } from "firebase/firestore";
import type { Group, Task } from "@/utils/interfaces";

const route = useRoute()
const db = getFirestore(firebaseApp);

const groups = ref<Group[]>([])
const tasks = ref<Task[]>([])
const groupID = computed(() => route.params.id as string)
const group = computed(() => {
  return groups.value && groups.value.find(item => item.id === groupID.value)
})
const groupTasks = computed(() => {
  return group.value && group.value.tasks
})
async function getGroups() {
  return getDocs(collection(db, "groups")).then(querySnapshot=> {
    const groupArray: Group[] = []
    querySnapshot.forEach((doc) => {
    const groupData = doc.data() as Group
    const group = { ...groupData, id: doc.id, taskCount: groupData.tasks ? groupData.tasks.length : 0 }
    groupArray.push(group)
    })
    console.log('getGroups', groupArray);
    return groupArray
  });
}
async function getTasks(groupID: string) {
  const q = query(collection(db, "tasks"), where("groupId", "==", groupID));    
  const querySnapshot = await getDocs(q);
  let taskArray: Task[] = []
  querySnapshot.forEach((doc) => {
    const taskData = doc.data() as Task
    const task = { ...taskData, id: doc.id }
    taskArray.push(task)
  })
  return taskArray
}
function sortTasks(unsortedTasks: Task[]) {
  console.log('sortTasks', groups.value?.length);
  
  if (groupTasks.value) {
    let arr = []
    for (const t of groupTasks.value) {
      const x = unsortedTasks.find(element => element.id === t) as Task
      if (x) arr.push(x)
    }
    return arr
  } else return []
}
async function init() {
  const groupID = route.params.id as string
  console.log('route watch', route.params.id);
  groups.value = await getGroups()
  if(groupID) {
    const tasksResult = await getTasks(groupID)
    tasks.value = sortTasks(tasksResult)
  }
}
watch(() => route.name, async() => {
  
  init()
})
</script>

<template>
  <div class="flex justify-center min-h-full">
    <router-view class="container" :groups="groups" :tasks="tasks" @get-tasks="init" />
  </div>
</template>
