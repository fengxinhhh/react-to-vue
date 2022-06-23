const fs = require('fs');
const path = require('path');
const { readFileFromLine } = require('./write');

const transformOptions = {
  sourcePath: path.resolve(__dirname, 'sourceFile', 'index.jsx'),
  outputPath: path.resolve(__dirname, 'outputFile', 'index.vue'),
  styleType: 'less'
}
const mapList = [           //react关键字列表
  'importReact,{useState}',
  'return('
]
const vueTemplateList = [];               //vue模板内容
const vueScriptList = [];                 //vue script内容
let fsContent = [];                       //react源文件
let startTemplateOutput = false;          //开始记录模板的状态值
const reactFileHasStateType = [];         //1为基本数据类型ref，2为引用数据类型reactive
let resultFileTotalLine = 0;

readFileFromLine(transformOptions.sourcePath, (res) => {
  fsContent = res;
  fsContent = fsContent.filter(line => line !== "");
  fsContent.forEach(lineItem => {
    lineItem = lineItem.replace(/\s*/g, "");
    if (lineItem === ')') {                 //模板输出结束
      startTemplateOutput = false;
    }
    else if (startTemplateOutput) {             //插入模板中
      if (lineItem.includes('{') && lineItem.includes('}')) {        //带状态的模板
        let startIndex = lineItem.indexOf('{');
        let endIndex = lineItem.indexOf('}');
        lineItem = lineItem.split('');
        lineItem.splice(startIndex + 1, 0, '{');
        lineItem.splice(endIndex + 2, 0, '}');
        lineItem = lineItem.join('');
      }
      vueTemplateList.push(lineItem);
    }
    else if (lineItem === 'return(') {        //开始输出模板
      startTemplateOutput = true;
    }

    else if (lineItem.startsWith('const[') && lineItem.includes('useState')) {      //如果是状态声明
      //处理useState hook
      const stateKey = lineItem.split('[')[1].split(',')[0];
      const stateVal = lineItem.split('useState(')[1].split(')')[0];        //状态值
      //判断state 类型，保存
      if (stateVal.startsWith('[') || stateVal.startsWith('{')) {
        vueScriptList.push(`const ${stateKey}=reactive(${stateVal})`);
        if (!reactFileHasStateType.includes(2)) {
          reactFileHasStateType.push(2);
        }
      } else {
        vueScriptList.push(`const ${stateKey}=ref(${stateVal})`);
        if (!reactFileHasStateType.includes(1)) {
          reactFileHasStateType.push(1);
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
    vueScriptList.splice(1, 0, `import{${importVal}}from'vue'`);
  }

  resultFileTotalLine += 4 + vueTemplateList.length + vueScriptList.length;

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
      resultFileTotalLine += res.length + 1;
      //保存文件
      fs.writeFile(transformOptions.outputPath, resultFile, (err) => {
        if (!err) {
          console.log('转换完成，vue文件共有', resultFileTotalLine - 1, '行代码!');
          return
        }
      })
    }
  }))

});






