const fs = require('fs');
const path = require('path');
const { readFileFromLine } = require('./write');
const { Stack } = require('./stack');
const { computeFileLines } = require('./_utils/computeFileLines')

const { formatStateInTemplate, saveCodeInUseEffect, saveCodeInUnmounted, formatWatchToVue, saveState, compileJsxTemplate } = require('./compile');

const transformOptions = {
  sourcePath: path.resolve(__dirname, 'sourceFile', 'index.jsx'),
  outputPath: path.resolve(__dirname, 'outputFile', 'index.vue'),
  styleType: 'less'
}
const vueTemplateList = [];               //vue模板内容
const vueScriptList = [];                 //vue script内容
let fsContent = [];                       //react源文件
let compileStack = new Stack();              //以栈顶值作为优先级最高的编译任务调度，1 -> 常规编译 ，2 -> 副作用函数编译中， 3 -> 模板编译中， 4 -> 引用数据类型状态编译中， 5 -> 组件销毁生命周期， 6 -> 模板中jsx语法编译中
compileStack.unshift(1);
let reactFileHasStateType = [];         //1为基本数据类型ref，2为引用数据类型reactive，3为mounted，4为watch，5为unmounted
let allStateList = new Map();                  //所有状态的列表
let resultFileTotalLine = 0;              //结果文件总行数
let mountedContainer = "";              //mounted临时容器
let unMountedContainer = "";            //unMounted临时容器
let stateContainer = "";                  //复杂state临时容器
let jsxContainer = "";                 //jsx模板临时容器
let jsxCompileParams = {};          //jsx模板解析时的记录信息

readFileFromLine(transformOptions.sourcePath, (res) => {
  fsContent = res;
  fsContent = fsContent.filter(line => line !== "");
  fsContent.forEach(lineItem => {
    if (compileStack.peek() !== 3) {
      lineItem = lineItem.replace(/\s*/g, "");
    }
    if (compileStack.peek() === 1) {               //常规编译，捕捉当前行是否为特殊编译
      if (lineItem === 'return(') {        //开始输出模板
        compileStack.unshift(3);
      }
      else if (lineItem.startsWith('const[') && lineItem.includes('useState')) {      //如果是状态声明
        const {
          returnCodeLine,
          returnAllStateList,
          returnCompileStack,
          returnReactFileHasStateType
        } = saveState(lineItem, allStateList, compileStack, reactFileHasStateType);
        vueScriptList.push(returnCodeLine);
        allStateList = returnAllStateList;
        compileStack = returnCompileStack;
        reactFileHasStateType = returnReactFileHasStateType;
      }
      else if (lineItem.startsWith('useEffect')) {             //副作用函数
        compileStack.unshift(2);
      }
      else {
        //被舍弃的，跳过循环，不做编译，一些特殊react专属语法，如export default function Index()/import './index.module.less';
      }
    }
    else if (compileStack.peek() === 2) {          //副作用函数编译中
      const saveCodeResult = saveCodeInUseEffect(allStateList, lineItem, compileStack)
      if (saveCodeResult.action === 'unmounted') {        //调度到unmounted
        compileStack = saveCodeResult.compileStack;
      } else {                        //仍然在执行mounted任务
        if (lineItem.startsWith('},[])')) {       //mounted结束，批量插入
          mountedContainer = '\nonMounted(() => {\n' + mountedContainer + '})\n';
          vueScriptList.push(mountedContainer);
          vueScriptList.push(unMountedContainer);
          mountedContainer = "";
          unMountedContainer = "";
          compileStack.shift();
          if (!reactFileHasStateType.includes(3)) {
            reactFileHasStateType.push(3);
          }
        } else if (lineItem.startsWith('},[')) {      //编译成watch函数，批量插入
          const params = lineItem.split('[')[1].split(']')[0].split(',');
          vueScriptList.push(formatWatchToVue(params, mountedContainer));
          if (!reactFileHasStateType.includes(4)) {
            reactFileHasStateType.push(4);
          }
          compileStack.shift();
        } else {
          mountedContainer += saveCodeResult;
        }
      }
    }
    else if (compileStack.peek() === 3) {             //模板编译中
      lineItem = lineItem.replace('className', 'class')
      if (lineItem.replaceAll(' ', '') === '{') {            //jsx语法编译开始
        compileStack.unshift(6)                             //jsx语法编译标识符6入栈，作为最高优先级
      }
      else if (lineItem.includes(')') && lineItem.replace(/\s*/g, "") === ')') {                 //模板输出结束
        compileStack.shift();
      }
      else if (lineItem.includes('{') && lineItem.includes('}')) {        //带状态的模板
        vueTemplateList.push(formatStateInTemplate(lineItem));
      }
      else {
        vueTemplateList.push(lineItem);
      }
    }
    else if (compileStack.peek() === 4) {         //复杂状态编译中
      if (lineItem.includes(')')) {         // 编译结束
        stateContainer += `\n${lineItem}`;
        vueScriptList.push(stateContainer);
        stateContainer = '';
        compileStack.shift();
      } else {
        stateContainer += `${lineItem}`;
      }
    }
    else if (compileStack.peek() === 5) {           //unmounted函数编译中
      if (lineItem.startsWith('}')) {         //可能unmounted结束了，需要先判断是否是块作用域
        const startIconNum = unMountedContainer.split('{').filter(item => item === '').length;
        const endIconNum = unMountedContainer.split('}').filter(item => item === '').length;
        if (startIconNum === endIconNum) {         //执行unmounted
          compileStack.shift();
          unMountedContainer = 'onUnmounted(() => {\n' + unMountedContainer + '})\n';
          if (!reactFileHasStateType.includes(5)) {
            reactFileHasStateType.push(5);
          }
        }
      } else {
        unMountedContainer += saveCodeInUnmounted(allStateList, lineItem, compileStack)
      }
    }
    else if (compileStack.peek() === 6) {            //模板中jsx语法编译中
      if (lineItem.replaceAll(' ', '') === '}') {      //jsx编译结束
        //格式化遍历项dom
        const { mapArray, mapFnParams, key, mapDomType } = jsxCompileParams;
        if (!key) {           //遍历元素的key值为必填项，否则会影响渲染
          throw new Error('please setting the map dom key!');
        }
        jsxContainer = jsxContainer.substr(0, jsxContainer.length - (jsxCompileParams.mapDomType.length + 6));
        vueTemplateList.push(`<${mapDomType} v-for='${mapFnParams} in ${mapArray}' ${key && ":key='" + key + "'"}>`);
        vueTemplateList.push(jsxContainer)
        vueTemplateList.push(`</${mapDomType}>`);
        //弹栈，将任务权交回给普通模板编译
        compileStack.shift();
      } else {          //每行代码编译完，更新编译参数集
        const returnParams = compileJsxTemplate(lineItem, jsxCompileParams)
        jsxCompileParams = { ...returnParams.jsxCompileParams };
        if (returnParams.lineItem) {
          jsxContainer += returnParams.lineItem + '\n';
        }
      }
    }
  })

  vueTemplateList.unshift('<template>');
  vueTemplateList.push('</template>\n');
  vueScriptList.unshift('<script setup>');
  vueScriptList.push('</script>\n');

  //处理import ..... from 'vue'  的导入配置
  if (reactFileHasStateType.length) {         //有状态
    let importVal = ''
    if (reactFileHasStateType.includes(1)) {
      importVal = 'ref';
    }
    if (reactFileHasStateType.includes(2)) {
      importVal += ',reactive';
    }
    if (reactFileHasStateType.includes(3)) {
      importVal += ',onMounted';
    }
    if (reactFileHasStateType.includes(4)) {
      importVal += ',watch';
    }
    if (reactFileHasStateType.includes(5)) {
      importVal += ',onUnmounted';
    }
    vueScriptList.splice(1, 0, `import{${importVal}}from'vue'`);
  }

  resultFileTotalLine = computeFileLines(vueTemplateList, vueScriptList);

  let resultFile = '';
  vueTemplateList.forEach(line => {
    resultFile += line + '\n';;
  })
  vueScriptList.forEach(line => {
    resultFile += line + '\n';
  })
  resultFile += `<style lang="${transformOptions.styleType}" scoped>\n`;
  readFileFromLine('./index.module.less', (res => {       //写入样式
    if (res) {
      res.forEach(line => {
        resultFile += line + '\n';
      })
      resultFile += '</style>';
      resultFileTotalLine += res.length + 3;
      //保存文件
      fs.writeFile(transformOptions.outputPath, resultFile, (err) => {
        if (!err) {
          console.log('转换完成，vue文件共有', resultFileTotalLine, '行代码!');
          return
        }
      })
    }
  }))
});






