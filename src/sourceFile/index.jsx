import React, {useState, useEffect} from 'react';
import './index.module.less';

const Index = () => {
  const [name, setName] = useState('小明');
  const [newList, setNewList] = useState({
    age: 20,
    hobby: '学习'
  });
  const [job, setJob] = useState('code');

  useEffect(() => {
    setName(name === "小明" ? "帅哥" : "丑男");
    return () => {
      console.log('组件销毁');
    }
  }, [])
  useEffect(() => {
    console.log('组件watch监听');
    setJob(job === 'code' ? 'eat' : 'job');
  }, [name, newList])

  return (
    <div className="hello">
      <span className="name">{name}</span>
    </div>
  )
}

export default Index;
