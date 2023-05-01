<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from 'vue-router'
import { firebaseApp } from "@/utils/firebase";
import { getFirestore, query, where, doc, addDoc, updateDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import type { Task } from "@/utils/interfaces";
import IconCheck from '@/components/IconCheck.vue'
import IconCross from '@/components/IconCross.vue'
import useColor from '@/composables/useColor'
import { getTaskElement, getTaskID, getTaskIndex } from '@/utils/helper'
const route = useRoute()
const db = getFirestore(firebaseApp);
const { getBackgroundColor } = useColor(354, 100, 46)
const tasks = ref<Task[]>([])
const newTaskShow = ref(false)
const taskText = ref<string>('')
const taskIndex = ref<number>()
const shiftY = ref(0)
const longPressTimer = ref<NodeJS.Timeout>()
const groupId = ref(route.params.id as string)

const ulStyles = computed(() => {
    return taskIndex.value ? { transform: `translate3d(0px, -${52 * taskIndex.value}px, 0px)` } : ''
})

async function getTasks() {
    const q = query(collection(db, "tasks"), where("groupId", "==", groupId.value));
    const querySnapshot = await getDocs(q);
    tasks.value = []
    querySnapshot.forEach((doc) => {
        // console.log('task', {id: doc.id, data: doc.data()});
        const taskData = doc.data() as Task
        const task = { ...taskData, id: doc.id }
        tasks.value.push(task)
    })
}
function pageClickHandler(event: Event) {
    const target = event.target as HTMLElement
    if (!target) return false;
    if (taskIndex.value) {
        taskIndex.value = undefined
    } else newTaskShow.value = true

    console.log('pageClickHandler', event, target.closest('ul'));
}
function addTask() {
    newTaskShow.value = true
}
async function updateTask(event: Event) {
    const taskID = getTaskID(event)
    if (!taskID || !event.target) return false
    const docRef = doc(db, "tasks", taskID);
    await updateDoc(docRef, {
        name: (event.target as HTMLInputElement).value
    });
    taskIndex.value = undefined
    taskText.value = ''
    getTasks()
}
async function completeTask(event: Event) {
    const taskID = getTaskID(event)
    if (!taskID) return false
    const docRef = doc(db, "tasks", taskID);
    await updateDoc(docRef, {
        completedAt: serverTimestamp()
    });
}
async function removeTask(event: Event) {
    const taskID = getTaskID(event)
    if (!taskID) return false
    const docRef = doc(db, "tasks", taskID);
    await updateDoc(docRef, {
        deletedAt: serverTimestamp()
    });
}

async function saveNewTask() {
    await addDoc(collection(db, "tasks"), {
        name: taskText.value,
        groupId: groupId.value,
        createdAt: serverTimestamp()
    });
    newTaskShow.value = false
    taskIndex.value = undefined
    taskText.value = ''
    getTasks()
}
function dragStartHandler(event: DragEvent) {
    const taskElement = getTaskElement(event)
    event.dataTransfer.setDragImage(taskElement, 0 ,0);
    setTimeout(() => taskElement.classList.add('dragging'), 0);
    console.log('dragStartHandler', { taskElement: taskElement });
}
function dragOverHandler(event: DragEvent) {
    const taskElement = getTaskElement(event)
    sortList(event)
    // console.log('dragOverHandler', {taskElement: taskElement});
}
function dragEndHandler(event: Event) {
    const taskElement = getTaskElement(event)
    taskElement.classList.remove('dragging')
    console.log('dragEndHandler', { taskElement: taskElement });
}
function sortList(event: DragEvent) {
    event.preventDefault();
    const sortableList = document.querySelector(".list");
    const items = sortableList?.querySelectorAll(".task");
    const draggingItem = document.querySelector(".dragging");
    if (!sortableList || !items || !draggingItem) return false;
    const siblings = [...sortableList.querySelectorAll(".task:not(.dragging)")] as HTMLElement[];
    const nextSibling = siblings.find(sibling => {
        return event.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
    });
    // console.log('sortList', {draggingItem:draggingItem, nextSibling:nextSibling, siblings: siblings});
    if (nextSibling) {
        sortableList.insertBefore(draggingItem, nextSibling)
    } else {
        sortableList.append(draggingItem)
    };
}

getTasks()

</script>
<template>
    <div class="min-h-full" @click.self="pageClickHandler">
        <input v-if="newTaskShow" class="bg-blue-300 p-3 w-full" autofocus type="text" v-model="taskText"
            @change="saveNewTask">
        <ul class="list relative" :style="ulStyles">
            <li :id="task.id" draggable="true" :data-index="index" v-for="(task, index) in tasks" :key="task.id"
                @dragstart="dragStartHandler" @dragover="dragOverHandler" @dragend="dragEndHandler"
                class="task  w-full text-xl font-bold ">
                <div class="details w-full flex flex-row flex-nowrap relative">
                    <div class="absolute left-0 top-0">
                        <IconCheck />
                    </div>
                    <div class="w-full z-10 flex flex-row"
                        :style="{ 'background-color': getBackgroundColor(index, tasks.length) }">
                        <input v-if="index === taskIndex" :autofocus="index === taskIndex" class="bg-inherit p-3 flex-1"
                            type="text" :value="task.name" @change="updateTask">
                        <div v-else class="py-3 px-4 flex-1">{{ task.name }}</div>
                    </div>
                    <div class="absolute right-0 top-0">
                        <IconCross />
                    </div>
                </div>
            </li>
        </ul>
    </div>
</template>
<style lang="scss">
.dragging {
    box-shadow: 0 2px 16px rgba(0, 0, 0, .25);
    // opacity: 0.6;

    .details {
        // opacity: 0;
        transform: scale(1.05);
    }
}

.hide {
    transition: 0.01s;
    transform: translateX(-9999px);
}
</style>