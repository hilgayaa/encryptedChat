import axios from 'axios';
import React, { useEffect, useState } from 'react'

function chatOption() {
  const [ chat,setChat] = useState();
  async function  fetchChat(){
    const result = await axios.get('/api/chat')
    setChat(()=>{result.data});
   }

  useEffect(
   ()=>{
   } ,[]
  )
  return (
    <div>
        {/* add a option to chat  */}
    </div>
  )
}

export default chatOption