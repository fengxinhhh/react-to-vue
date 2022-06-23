<template>
  <div class="hello">
    <span class="name">{{ name }}</span>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, onUnmounted } from "vue"
const name = ref("小明")
const newList = reactive({
  age: 20,
  hobby: "学习",
})
const job = ref("code")

onMounted(() => {
  name.value = name.value === "小明" ? "帅哥" : "丑男"
})

onUnmounted(() => {
  console.log("组件销毁")
})

watch([name, newList], ([oldValue0, newValue0], [oldValue1, newValue1]) => {
  console.log("组件watch监听")
  job.value = job.value === "code" ? "eat" : "job"
})
</script>

<style lang="less" scoped>
.hello {
  color: "red";
  .name {
    font-size: 20px;
  }
}
</style>
