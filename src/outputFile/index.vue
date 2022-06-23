<template>
  <div>
    {{ name }}
  </div>
  )
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from "vue"
const name = ref("冯昕")
const newList = reactive({
  age: 20,
  hobby: "学习",
})

onMounted(() => {
  name.value = name.value === "冯昕" ? "帅哥冯昕" : "丑男冯昕"
})

onUnmounted(() => {
  console.log("组件销毁")
})
</script>

<style lang="less" scoped>
.hello {
  color: "red";
}
</style>
