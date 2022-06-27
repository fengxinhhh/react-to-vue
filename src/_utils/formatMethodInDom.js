const formatMethodInDom = (lineItem) => {           //改变一行代码中的onChange -> @change格式转换
  const endTagIndex = lineItem.indexOf('>');
  if (lineItem.includes('on') && endTagIndex > lineItem.indexOf('on')) {
    lineItem = lineItem.replaceAll('on', ' @');
    lineItem = lineItem.split('@');
    for (let i = 1; i < lineItem.length; i++) {
      const equalIndex = lineItem[i].indexOf('=');
      const key = lineItem[i].substr(0, equalIndex);
      const value = lineItem[i].substr(equalIndex + 1);
      if (value.includes('=>')) {     //react模板函数传参
        let _andIndex;
        let endTag = value.includes('</') ? false : true;         //如果整个元素在一行，需要从后往前查找第二个>标签
        for (let i = value.length - 1; i >= 0; i--) {
          if (value[i] === '>' && endTag) {
            _andIndex = i;
            break;
          }
          if (value[i] === '>') endTag = true;
        }
        const template = value.substr(_andIndex);
        const params = value.split('(')[2].split(')')[0];
        const functionName = value.split('=>')[1].split('(')[0];
        lineItem[i] = `${key.toLowerCase()}="${functionName}(${params})" `;
        console.log(lineItem[i])
        if (i === lineItem.length - 1) {
          lineItem[i] += template;
        }

      } else {
        lineItem[i] = key.toLowerCase() + '=' + value;
      }
    }
    lineItem = lineItem.join('@');

  }
  return lineItem;
}

module.exports = {
  formatMethodInDom
}