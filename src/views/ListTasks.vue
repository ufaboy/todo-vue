<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useRoute } from 'vue-router'
import { firebaseApp } from '@/utils/firebase';
import { documentId, getFirestore, query, where, doc, addDoc, updateDoc, deleteDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import useColor from '@/composables/useColor'
import { getTaskElement, getTaskID, getTaskIndex, resetEditElements } from '@/utils/helper'
import type { Task, Group } from '@/utils/interfaces';

import IconCheck from '@/components/IconCheck.vue'
import IconCross from '@/components/IconCross.vue'

interface Props {
    tasks: Task[]
}
const props = defineProps<Props>()
const emit = defineEmits(['get-tasks',])
const route = useRoute()
const db = getFirestore(firebaseApp);
const { getBackgroundColor } = useColor(354, 100, 46)
const newTaskShow = ref(false)
const taskText = ref<string>('')
const taskIndex = ref<number>()
const longPressTimer = ref<NodeJS.Timeout>()
const groupId = ref(route.params.id as string)

const mouseMoveX = ref(0)

const ulStyles = computed(() => {
    return taskIndex.value ? { transform: `translate3d(0px, -${52 * taskIndex.value}px, 0px)` } : ''
})

function pageClickHandler(event: Event) {
    const target = event.target as HTMLElement
    if (!target) return false;
    if (Number.isInteger(taskIndex.value)) {
        taskIndex.value = undefined
        resetEditElements()
    } else if (newTaskShow.value) {
        newTaskShow.value = false
    } else newTaskShow.value = true
    console.log('pageClickHandler', { event: event });
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
}
async function completeTask(event: Event) {
    const taskIndex = getTaskIndex(event)
    resetSliderStyle(event)
    const taskID = getTaskID(event)
    // console.log('completeTask', { event: event, taskID: taskID });
    if (!taskID) return false
    const docRef = doc(db, "tasks", taskID);
    await updateDoc(docRef, {
        completedAt: serverTimestamp()
    });
    if (props.tasks) {
        const x = [...props.tasks]
        const splicedArr = x.splice(taskIndex, 1)
        const orderedTasks = [...x, ...splicedArr].map(item => item.id)
        console.log('completeTask', { splicedArr: splicedArr, orderedTasks: orderedTasks });
        await saveOrderTasks(orderedTasks)
    }
    emit('get-tasks')
}
async function deleteTask(event: Event) {
    resetSliderStyle(event)
    const taskElement = getTaskElement(event)
    const taskID = getTaskID(event)
    taskElement.style.backgroundColor = ''
    if (!taskID) return false
    const docRef = doc(db, "tasks", taskID);
    await deleteDoc(docRef);
    emit('get-tasks')
}

async function saveNewTask() {
    const result = await addDoc(collection(db, "tasks"), {
        name: taskText.value,
        groupId: groupId.value,
        createdAt: serverTimestamp()
    });
    const docRef = doc(db, "groups", groupId.value);
    await updateDoc(docRef, {
        tasks: [...props.tasks.map(item => item.id), result.id]
    });
    newTaskShow.value = false
    taskIndex.value = undefined
    taskText.value = ''
    emit('get-tasks')
}
function getOrderTasksInGroup() {
    const orderedTasks: string[] = []
    const taskElements = document.querySelectorAll(".task");
    taskElements.forEach(item => orderedTasks.push(item.id))
    return orderedTasks
}
async function saveOrderTasks(orderedTasks: string[]) {
    const groupRef = doc(db, "groups", groupId.value);
    await updateDoc(groupRef, {
        tasks: orderedTasks
    });
}

function dragStartHandler(event: DragEvent) {
    const taskElement = getTaskElement(event)
    event.dataTransfer?.setDragImage(taskElement, 0, 0);
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
    const orderedTasks = getOrderTasksInGroup()
    saveOrderTasks(orderedTasks)
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

function mouseDownHandler(event: MouseEvent) {
    const taskElement = getTaskElement(event)
    mouseMoveX.value = event.screenX
    console.log('mouseDownHandler', { taskElement: taskElement });
    longPressTimer.value = setTimeout(() => {
        taskElement.draggable = true
    }, 500)
    taskElement.addEventListener('mouseup', mouseUpHandler)
    taskElement.addEventListener('mousemove', mouseMoveHandler)
}
function mouseUpHandler(event: MouseEvent) {
    const taskElement = getTaskElement(event)
    clearTimeout(longPressTimer.value)
    const index = Number(taskElement.dataset.index)
    if (Number.isInteger(taskIndex.value) && index !== taskIndex.value) {
        taskIndex.value = undefined
        resetEditElements()
    } else {
        taskIndex.value = Number(taskElement.dataset.index)
        taskElement.classList.add('edit')
        nextTick(() => {
            const inputElement = taskElement.querySelector('input') as HTMLElement
            inputElement.focus()
        })
    }
}
function mouseMoveHandler(event: MouseEvent) {
    const taskElement = getTaskElement(event)
    const sliderElement = (event.target as HTMLElement).closest('.slider') as HTMLElement
    taskElement.removeEventListener('mouseup', mouseUpHandler)
    const diffX = event.screenX - mouseMoveX.value
    if (diffX > 40) {
        sliderElement.style.backgroundColor = 'green'
        taskElement.addEventListener('mouseup', completeTask)
        taskElement.addEventListener('mouseleave', completeTask)
    } else if (diffX < -40) {
        taskElement.addEventListener('mouseup', deleteTask)
        taskElement.addEventListener('mouseleave', deleteTask)
    }
    sliderElement.style.transform = `translate3d(${diffX}px, 0px, 0px)`
    console.log('mouseMoveHandler', { diffX: diffX });
}
function resetSliderStyle(event: Event) {
    const taskElement = getTaskElement(event)
    taskElement.removeEventListener('mouseup', mouseUpHandler)
    taskElement.removeEventListener('mousemove', mouseMoveHandler)
    taskElement.removeEventListener('mouseleave', completeTask)
    const sliderElement = taskElement.querySelector('.slider') as HTMLElement
    sliderElement.style.transform = ''
}
function getSliderClassObj(task: Task) {
    return { 'line-through bg-black text-gray-500': task.completedAt }
}
function getSliderStyleObj(task: Task, index: number) {
    return !task.completedAt ? { 'background-color': getBackgroundColor(index, props.tasks.length) } : {}
}
// watch(() => groupTasks.value, newValue => {
//     if (newValue && newValue.length) {
//         getTasks()
//     }
// })
// if (groupTasks.value && groupTasks.value.length) getTasks()

</script>
<template>
    <div class="min-h-full" @click.self="pageClickHandler">
        <input v-if="newTaskShow" class="bg-blue-300 p-3 w-full" autofocus type="text" v-model="taskText"
            @change="saveNewTask">
        <ul id="task-list" class="list relative" :class="{ 'shade': taskIndex !== undefined }" :style="ulStyles">
            <li :id="task.id" :data-index="index" v-for="(task, index) in tasks" :key="task.id"
                @dragstart="dragStartHandler" @dragover="dragOverHandler" @dragend="dragEndHandler"
                @mousedown="mouseDownHandler" class="task w-full text-xl font-bold ">
                <div class="details w-full flex flex-row flex-nowrap relative">
                    <div class="absolute left-0 top-0">
                        <IconCheck />
                    </div>
                    <div class="slider w-full z-10 flex flex-row text-xl" :class="getSliderClassObj(task)"
                        :style="getSliderStyleObj(task, index)">
                        <input v-if="index === taskIndex" class="bg-inherit p-3 flex-1" type="text" :value="task.name"
                            @change="updateTask">
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
.shade {
    .details {
        opacity: 0.15;
    }

    .task.edit .details {
        opacity: 1;
    }
}

.dragging {
    overflow: hidden;
    // opacity: 0.6;

    .details {
        // opacity: 0;
        box-shadow: 0 2px 16px rgba(0, 0, 0, .25);
        // transform: scale(1.05);
        border-top: 1px solid;
        border-bottom: 1px solid;
    }
}

.hide {
    transition: 0.01s;
    transform: translateX(-9999px);
}
</style>