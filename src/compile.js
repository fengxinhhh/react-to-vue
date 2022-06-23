const { formatUseStateAction } = require('./_utils/formatuseState')

const formatStateInTemplate = (lineItem) => {         //编译模板中的{{state}}
  let startIndex = lineItem.indexOf('{');
  let endIndex = lineItem.indexOf('}');
  lineItem = lineItem.split('');
  lineItem.splice(startIndex + 1, 0, '{');
  lineItem.splice(endIndex + 2, 0, '}');
  lineItem = lineItem.join('');
  return lineItem;
}

const saveCodeInUseEffect = (allStateList, lineItem, compileStack) => {             //在useEffect中保存代码片段
  if (lineItem.includes('return()=>')) {             //组件销毁，把任务权先交给销毁
    compileStack.unshift(5);
    return { compileStack, action: 'unmounted' };
  }
  allStateList.forEach((stateType, key) => {
    if (lineItem.includes(key.stateAction)) {       //携带状态的特殊副作用函数语句
      let newState = lineItem.match(/\((.+?)\)/gi)[0].replace(/[(|)]/g, "");
      if (newState.includes(key.state)) {
        newState = newState.replace(key.state, `${key.state}.value`)
      }
      lineItem = `${key.state}${stateType === 'ref' ? '.value' : ''} = ${newState}`;
    }
  })
  return `${lineItem}\n`;
}
const saveCodeInUnmounted = (allStateList, lineItem, compileStack) => {
  console.log('unmounted')
  allStateList.forEach((stateType, key) => {
    if (lineItem.includes(key.stateAction)) {       //携带状态的特殊副作用函数语句
      const newState = lineItem.match(/\((.+?)\)/gi)[0].replace(/[(|)]/g, "");
      lineItem = `${key.state}${stateType === 'ref' ? '.value' : ''} = ${newState}`;
    }
  })

  return `${lineItem}\n`;
}

const saveState = (lineItem, allStateList, compileStack, reactFileHasStateType) => {           //保存状态
  //处理useState hook
  const stateKey = lineItem.split('[')[1].split(',')[0];
  const stateVal = lineItem.split('useState(')[1].split(')')[0];        //状态值
  let returnCodeLine = '';
  if (!lineItem.includes(')')) {
    compileStack.unshift(4);
  }
  //判断state 类型，保存
  if (stateVal.startsWith('[') || stateVal.startsWith('{')) {
    returnCodeLine = `const ${stateKey}=reactive(${stateVal}${compileStack.peek() === 4 ? '' : ')'}`
    allStateList.set({ state: stateKey, stateAction: `set${formatUseStateAction(stateKey)}` }, 'reactive');
    if (!reactFileHasStateType.includes(2)) {
      reactFileHasStateType.push(2);
    }
  } else {
    returnCodeLine = `const ${stateKey}=ref(${stateVal})`;
    allStateList.set({ state: stateKey, stateAction: `set${formatUseStateAction(stateKey)}` }, 'ref');
    if (!reactFileHasStateType.includes(1)) {
      reactFileHasStateType.push(1);
    }
  }
  const returnAllStateList = allStateList;
  const returnCompileStack = compileStack;
  const returnReactFileHasStateType = reactFileHasStateType
  return {
    returnCodeLine,
    returnAllStateList,
    returnCompileStack,
    returnReactFileHasStateType
  }
}



module.exports = {
  formatStateInTemplate,
  saveCodeInUseEffect,
  saveCodeInUnmounted,
  saveState
}