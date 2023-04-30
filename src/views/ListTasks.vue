<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter, useRoute } from 'vue-router'
import { firebaseApp } from "@/utils/firebase";
import { getFirestore, query, where, doc, addDoc, updateDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import type { Task } from "@/utils/interfaces";
import IconCheck from '@/components/IconCheck.vue'
import IconCross from '@/components/IconCross.vue'
import useColor from '@/composables/useColor'

const router = useRouter()
const route = useRoute()
const db = getFirestore(firebaseApp);
const { getBackgroundColor } = useColor(354, 100, 46)
const tasks = ref<Task[]>([])
const taskName = ref<string>()
const newTaskShow = ref(false)
const editableTask = ref<string>('')
const editableTaskIndex = ref<number>()
const draggedElement = ref<HTMLElement>()
const groupId = ref(route.params.id as string)

const ulStyles = computed(() => {
    return editableTaskIndex.value ? { transform: `translate3d(0px, -${52 * editableTaskIndex.value}px, 0px)` } : ''
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
    if (editableTaskIndex.value) {
        editableTaskIndex.value = undefined
    } else newTaskShow.value = true

    console.log('pageClickHandler', event, target.closest('ul'));
}
function addTask() {
    newTaskShow.value = true
}
async function updateTask(event: Event) {
    const target = event.target as HTMLInputElement
    console.log('updateTask', { event: event });

    const docRef = doc(db, "tasks", editableTask.value);
    await updateDoc(docRef, {
        name: target.value
    });
    editableTask.value = ''
    editableTaskIndex.value = undefined
    getTasks()
}
async function completeTask(event: Event) {
    const docRef = doc(db, "tasks", editableTask.value);
    await updateDoc(docRef, {
        completedAt: serverTimestamp()
    });
}
async function removeTask(event: Event) {
    const docRef = doc(db, "tasks", editableTask.value);
    await updateDoc(docRef, {
        deletedAt: serverTimestamp()
    });
}
function clickTaskHandler(event: Event) {
    const target = event.target as HTMLElement
    const liElement = target.closest('.task')
    if(liElement) liElement.classList.add('draggable')
    // console.log('clickTaskHandler', { event: event });
}
function leaveHandler(event: Event) {
    const target = event.target as HTMLElement
    const liElement = target.closest('.task')
    if(liElement) liElement.classList.remove('draggable')
    // console.log('leaveHandler', { event: event });
}
function startEditTask(taskId: string, index: number) {
    editableTask.value = taskId
    editableTaskIndex.value = index
}
async function saveNewTask() {
    await addDoc(collection(db, "tasks"), {
        name: taskName.value,
        groupId: groupId.value,
        createdAt: serverTimestamp()
    });
    getTasks()
}
function moveDragElement(liElement:HTMLElement, pageX: number, pageY: number) {
    // liElement.style.left = pageX - liElement.offsetWidth / 2 + 'px';
    liElement.style.top = pageY - liElement.offsetHeight / 2 + 'px';
}
function mouseMoveHandler(event: MouseEvent) {
    const target = event.target as HTMLElement
    const liElement = target.closest('li')
    // console.log('mouseMoveHandler', {event:event});
    if(liElement) moveDragElement(liElement, event.pageX, event.pageY);
}
function dragStartHandler(event: DragEvent) {
    const target = event.target as EventTarget
    const liElement = target.closest('.task')
    const plug = document.createElement('li')
    plug.id = 'plug'
    plug.style.height = '52px'
    plug.style.width = '100%'
    // plug.style.position = 'absolute'
    plug.style.display = 'none'
    liElement.after(plug)
    liElement.classList.add('hide')

    const storageElement = document.getElementById('storage')
    storageElement.append(liElement)
    console.log('dragStartHandler', { event: event });
}
function dragEndHandler(event: DragEvent) {
    const target = event.target as EventTarget
    const liElement = target.closest('.task')
    document.getElementById('plug').remove()
    console.log('dragEndHandler', { event: event, plug: document.getElementById('plug') });
    liElement.classList.remove('hide');

}
function dragOverHandler(event: DragEvent) {
    const target = event.target as HTMLElement
    const liElement = target.closest('.task')
    const targetIndex = liElement ? Number(liElement.dataset.index) : undefined
    if(liElement && liElement.classList.contains('task')){
        const plug = document.getElementById('plug')
        liElement.after(plug)
        plug.style.display = 'block'
    }
    // if(targetLiElement) moveDragElement(targetLiElement, event.pageX, event.pageY);
    console.log('dragOverHandler', { event: event, targetIndex: targetIndex });
}

getTasks()

</script>
<template>
    <div class="min-h-full" @click.self="pageClickHandler">
        <input v-if="newTaskShow" class="bg-blue-300 p-3 w-full" autofocus type="text" v-model="taskName"
            @change="saveNewTask">
        <ul class="list relative" :style="ulStyles">
            <li :id="`task-index-${index}`" :data-index="index" v-for="(task, index) in tasks" :key="task.id"
                draggable="true" @dragstart="dragStartHandler" @dragend="dragEndHandler" @dragover.prevent="dragOverHandler"
                @mousedown="clickTaskHandler" @mouseleave="leaveHandler"
                class="task flex flex-row flex-nowrap w-full text-xl font-bold relative">
                <div class="absolute left-0 top-0">
                    <IconCheck />
                </div>
                <div class="w-full z-10 flex flex-row"
                    :style="{ 'background-color': getBackgroundColor(index, tasks.length) }">
                    <input v-if="task.id === editableTask" :autofocus="task.id === editableTask"
                        class="bg-inherit p-3 flex-1" type="text" :value="task.name" @change="updateTask">
                    <div v-else class="p-3 flex-1">{{ task.name }}</div>
                </div>
                <div class="absolute right-0 top-0">
                    <IconCross />
                </div>
            </li>
        </ul>
    </div>
</template>
<style>
.draggable {
    box-shadow: 0 2px 16px rgba(0,0,0,.25);
}
.hide {
  transition: 0.01s;
  transform: translateX(-9999px);
}
</style>