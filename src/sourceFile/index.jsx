import React, {useState, useEffect} from 'react';
import './index.module.less';

export default function Index() {
  const [name, setName] = useState('冯昕');
  const [newList, setNewList] = useState({
    age: 20,
    hobby: '学习'
  });

  useEffect(() => {
    setName(name === "冯昕" ? "帅哥冯昕" : "丑男冯昕");
    return () => {
      console.log('组件销毁');
    }
  }, [])

  return (
    <div>
      {name}
    </div>
  )
}
