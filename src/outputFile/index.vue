<template>
  <div
    class="hello"
    @click="showName"
    @change="showName"
    @focus="showName('gcy', 3533)"
    @blur="showName('gcy', 3533)"
  >
    <span class="name">{{ name }}123</span>
    <div v-for="(item, index) in personalList" :key="index">
      <div key="index" @click="showName('fx', 1555)" v-if="item.age > 20">
        <span
          @click="showName('fx', 1)"
          @change="showName('fx', 2)"
          @blur="showName('gcy', 333)"
          >{{ item.name }}</span
        >
      </div>
      <div key="index" v-else>
        <span>{{ item.name }}</span>
        <b>1</b>
      </div>
    </div>
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
const personList = reactive([
  { name: "fx", age: 20 },
  { name: "mjw", age: 45 },
  { name: "tc", age: 22 },
  { name: "gcy", age: 38 },
])

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
const showName = (name, age) => {
  if (name) {
    console.log(name)
  } else {
    console.log("hello")
  }
}
</script>

<style lang="less" scoped>
.hello {
  color: "red";
  .name {
    font-size: 20px;
  }
}
</style>
