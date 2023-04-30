<script setup lang="ts">
import { ref } from "vue";
import { firebaseApp } from "@/utils/firebase";
import { getFirestore, doc, setDoc, collection, getDocs } from "firebase/firestore";

interface Task {
    id: string
    name: string
    created_at: string
    completed_at: string
}
const db = getFirestore(firebaseApp);
const tasks = ref<Task[]>([])

async function getGroups() {
    const querySnapshot = await getDocs(collection(db, "groups"));
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
        const taskData = doc.data() as {name: string, created_at: string, completed_at: string}
        const task = {...taskData, id: doc.id}
        tasks.value.push(task)
    })
}
async function addTask() {
    await setDoc(doc(db, "tasks", "LA"), {
        name: "Los Angeles",
        state: "CA",
        country: "USA"
    });
}

getGroups()
</script>
<template>
    <div>
        <ul>
            <li v-for="task in tasks" :key="task.id">
                <span>{{ task.name }}</span>
            </li>
        </ul>
    </div>
</template>