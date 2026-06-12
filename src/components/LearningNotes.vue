<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-800 flex items-center">
        <BookOpen class="w-5 h-5 mr-2 text-blue-600" />
        学习笔记
      </h3>
      <button 
        @click="showAddNote = !showAddNote"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
      >
        <Plus class="w-4 h-4 mr-2" />
        添加笔记
      </button>
    </div>

    <!-- 添加笔记表单 -->
    <div v-if="showAddNote" class="mb-6 p-4 bg-gray-50 rounded-lg">
      <textarea
        v-model="newNote.content"
        placeholder="记录你的学习笔记..."
        class="w-full h-24 p-3 border-2 border-gray-200 rounded-lg resize-none focus:outline-none focus:border-blue-500"
      ></textarea>
      <input
        v-model="newNote.chapter"
        type="text"
        placeholder="章节（可选）"
        class="w-full mt-3 p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
      />
      <div class="flex justify-end mt-3 space-x-2">
        <button 
          @click="cancelAddNote"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          取消
        </button>
        <button 
          @click="addNote"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          保存
        </button>
      </div>
    </div>

    <!-- 笔记列表 -->
    <div v-if="notes.length > 0" class="space-y-4">
      <div 
        v-for="(note, index) in notes" 
        :key="index"
        class="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
      >
        <div class="flex items-center justify-between mb-2">
          <span v-if="note.chapter" class="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
            {{ note.chapter }}
          </span>
          <span class="text-xs text-gray-400">{{ formatDate(note.createdAt) }}</span>
        </div>
        <p class="text-gray-700">{{ note.content }}</p>
        <div class="flex justify-end mt-2">
          <button 
            @click="deleteNote(index)"
            class="text-red-500 hover:text-red-700 text-sm flex items-center"
          >
            <Trash2 class="w-4 h-4 mr-1" />
            删除
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8 text-gray-500">
      <FileText class="w-12 h-12 mx-auto mb-3 text-gray-300" />
      <p>暂无学习笔记，点击上方按钮添加</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { BookOpen, Plus, Trash2, FileText } from 'lucide-vue-next'
import { useAuthStore } from '../stores/index.js'

const showAddNote = ref(false)
const notes = ref([])
const newNote = ref({
  content: '',
  chapter: '',
  createdAt: ''
})

function getNotesKey() {
  try {
    const auth = useAuthStore()
    return 'learning_notes_' + (auth.user?.id || 'guest')
  } catch (e) {
    return 'learning_notes_guest'
  }
}

onMounted(() => {
  const saved = localStorage.getItem(getNotesKey())
  if (saved) {
    notes.value = JSON.parse(saved)
  }
})

const addNote = () => {
  if (!newNote.value.content.trim()) {
    alert('请输入笔记内容')
    return
  }
  notes.value.unshift({
    content: newNote.value.content,
    chapter: newNote.value.chapter,
    createdAt: new Date().toISOString()
  })
  saveNotes()
  cancelAddNote()
}

const cancelAddNote = () => {
  showAddNote.value = false
  newNote.value = { content: '', chapter: '', createdAt: '' }
}

const deleteNote = (index) => {
  notes.value.splice(index, 1)
  saveNotes()
}

const saveNotes = () => {
  localStorage.setItem(getNotesKey(), JSON.stringify(notes.value))
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
}
</script>
