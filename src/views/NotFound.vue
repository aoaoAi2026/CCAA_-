<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center px-4">
    <div class="text-center max-w-md">
      <div class="text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">404</div>
      <h1 class="text-2xl font-bold text-gray-800 mb-3">页面迷路了</h1>
      <p class="text-gray-600 mb-6">
        你要找的页面可能已被移动或从未存在。让我们回到首页继续学习吧！
      </p>
      <router-link
        to="/"
        class="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition"
      >返回首页</router-link>
    </div>
  </div>
</template>
