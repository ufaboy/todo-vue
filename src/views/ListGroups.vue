<script setup lang="ts">
import { ref } from "vue";
import { firebaseApp } from "@/utils/firebase";
import useColor from '@/composables/useColor'
import { getFirestore, doc, addDoc, updateDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import type { Group, Task } from "@/utils/interfaces";
import IconCheck from '@/components/IconCheck.vue'
import IconCross from '@/components/IconCross.vue'

const props = defineProps<{
    groups: Group[]
    tasks?: Task[]
}>()
const { getBackgroundColor } = useColor()
const db = getFirestore(firebaseApp);
const groupName = ref<string>()

async function addGroup() {
    await addDoc(collection(db, "groups"), {
        name: groupName.value
    });
}

</script>
<template>
    <div class="">
        <ul>
            <li v-for="(group, index) in groups" :key="group.id"
                class="flex flex-row flex-nowrap w-full text-xl	font-bold relative">
                <div class="absolute left-0 top-0">
                    <IconCheck />
                </div>
                <div class="w-full z-10 flex flex-row">
                    <div class="p-3 flex-1" :style="{ 'background-color': getBackgroundColor(index, groups.length) }">{{
                        group.name }}</div>
                    <RouterLink :to="{ name: 'tasks', params: { id: group.id } }"
                        class="flex items-center justify-center w-14 h-14 bg-blue-400">
                        {{ group.taskCount }}
                    </RouterLink>
                </div>

                <div class="absolute right-0 top-0">
                    <IconCross />
                </div>
            </li>
        </ul>
    </div>
</template>