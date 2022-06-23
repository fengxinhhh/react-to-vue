class Stack {
  constructor() {
    this.items = [];
  }

  // 添加元素到栈顶
  unshift(element) {
    this.items.unshift(element);
  }

  // 出栈，删除栈顶元素
  shift() {
    return this.items.shift();
  }

  // 删除栈底的元素
  pop() {
    return this.items.pop();
  }

  // 返回栈顶的元素
  peek() {
    return this.items[0];
  }

  // 判断栈里还有没有元素
  isEmpty() {
    return this.items.length === 0;
  }

  // 移除栈里所有的元素
  clear() {
    this.items = [];
  }

  // 返回栈里的元素个数
  size() {
    return this.items.length;
  }
}

module.exports = { Stack }
