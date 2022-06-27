import React, {useState, useEffect} from 'react';
import './index.module.less';

const Index = () => {
  const [name, setName] = useState('小明');
  const [newList, setNewList] = useState({
    age: 20,
    hobby: '学习'
  });
  const [job, setJob] = useState('code');
  const [personList, setPersonList] = useState([
    {
      name: 'fx',
      age: 20,
    },
    {
      name: 'mjw',
      age: 45,
    },
    {
      name: 'tc',
      age: 22,
    },
    {
      name: 'gcy',
      age: 38,
    },
  ]);

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
      <span className="name">{name}123</span>
      {
        personalList.map((item, index) => {
          return (
            <div key={index}>
              <span>{item.name}</span>
              <b>{item.age}</b>
            </div>
          )
        })
      }
    </div>
  )
}

export default Index;
