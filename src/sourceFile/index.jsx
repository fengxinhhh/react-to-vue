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

  const showName = (name, age) => {
    if(name) {
      console.log(name);
    } else {
      console.log('hello')
    }
  }

  return (
    <div className="hello" onClick={showName} onChange={showName} onFocus={() => showName('gcy', 3533)} onBlur={() => showName('gcy', 3533)}>
      <span className="name">{name}123</span>
      {
        personalList.map((item, index) => {
          return (
            item.age > 20
            ?
            <div key={index} onClick={showName('fx',1555)}>
              <span onClick={showName('fx',1)}  onChange={() => showName('fx',2)} onBlur={() => showName('gcy', 333)}>{item.name}</span>
            </div>
            :
            <div key={index}>
              <span>{item.name}</span>
              <b>1</b>
            </div>
          )
        })
      }
    </div>
  )
}

export default Index;
