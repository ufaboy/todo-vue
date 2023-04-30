<script setup lang="ts">
import { ref } from "vue";
import { firebaseApp } from "@/utils/firebase";
import { query, getFirestore, where, doc, addDoc, updateDoc, collection, getDocs, serverTimestamp, getCountFromServer } from "firebase/firestore";
import type { Group, Task } from "@/utils/interfaces";

const db = getFirestore(firebaseApp);

const groups = ref<Group[]>([])
const tasks = ref<Task[]>([])

async function getGroups() {
  const taskColl = collection(db, "tasks");
  const querySnapshot = await getDocs(collection(db, "groups"));
  querySnapshot.forEach(async (doc) => {
    const groupData = doc.data() as Group
    const q = query(taskColl, where("groupId", "==", doc.id));
    const snapshot = await getCountFromServer(q);
    const group = { ...groupData, id: doc.id, taskCount: snapshot.data().count }
    // console.log('getGroups', task);
    groups.value.push(group)
  })
}
async function getAllTasks() {
  const querySnapshot = await getDocs(collection(db, "tasks"));
  querySnapshot.forEach((doc) => {
    // console.log('task', {id: doc.id, data: doc.data()});
    const taskData = doc.data() as Task
    const task = { ...taskData, id: doc.id }
    tasks.value.push(task)
  })
}
getGroups()
// getAllTasks()
</script>

<template>
  <div class="flex justify-center min-h-full">
    <router-view class="container" :groups="groups" :tasks="tasks" />
  </div>
</template>
