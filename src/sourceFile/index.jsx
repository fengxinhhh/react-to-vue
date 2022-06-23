import React, {useState} from 'react';
import './index.module.less';

export default function Index() {
  const [name, setName] = useState('冯昕');
  const [newList, setNewList] = useState([1, 2, 3]);

  return (
    <div>
      {name}
    </div>
  )
}
