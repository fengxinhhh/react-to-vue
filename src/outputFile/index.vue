<template>
<div>
{{name}}
</div>
</template>

<script setup>
import{ref,reactive}from'vue'
const name=ref('冯昕')
const newList=reactive([1,2,3])
</script>

<style lang="less" scoped>
.hello {
  color: "red";
}
</style>