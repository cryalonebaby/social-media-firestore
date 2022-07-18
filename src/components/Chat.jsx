import { Avatar, Box, Button, FormControl, Input, TextField, Typography } from '@mui/material'
import { addDoc, collection, doc, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import React, { useEffect } from 'react'
import { useState, useRef } from 'react'
import { db } from '../firebase'
import { Navigate } from 'react-router-dom';
import getAnotherId from '../utils/getAnotherId';

const Topbar = ({email}) => {
  return (
    <Box display='flex' bgcolor='lightblue' width='100%' p={3} alignItems='center' borderBottom='1px solid' borderColor='gray'>
      <Avatar src='' sx={{marginRight: 3, width: 56, height: 56}}/>
      <Typography variant='h4'>{email}</Typography>
    </Box>
  )
}

const Bottombar = ({id, user}) => {
  const [inp, setInp] = useState('')

  const sendMessage = async (e) => {
    e.preventDefault()

    setInp('')
    await addDoc(collection(db, 'chats', id, 'messages'), {
      text: inp,
      sender: user.email,
      timestamp: serverTimestamp()
    })
  }
  return (
    <form onSubmit={sendMessage}>
      <TextField
        value={inp}
        onChange={(e) => setInp(e.target.value)}
        autoComplete='off'
        sx={{marginBottom: 3}}
        id="filled-multiline-static"
        fullWidth
        placeholder='Type a message'
        rows={2}
        variant="filled"
      />
      <Button type='submit' sx={{display: 'none'}}>Submit</Button>
    </form>
  )
}

const Chat = ({id}) => {
  let q = null
  let chatQ = null
  if(id) {
    q = query(collection(db, 'chats', id, 'messages'), orderBy('timestamp'))
    chatQ = doc(db, 'chats', id)
  }
  const [messages] = useCollectionData(q);
  const bottomOfChat = useRef()
  const [chat] = useDocumentData(chatQ)

  // INITIAL VALUE FOR STATE
  const item = JSON.parse(localStorage.getItem('user')) || null

  // STATE OF LOCAL STORAGE
  const [user, setUser] = useState(item)

  const getMessages = () =>
    messages?.map(msg => {
      const meSender = msg.sender === user.email
      return (
      <Box key={msg.timestamp} minWidth='100px' bgcolor={meSender ? 'lightgreen' : 'lightblue'} p={3} m={1} borderRadius={10} height='20px' alignSelf={meSender ? 'flex-end' : 'flex-start'}>
        <Typography fontWeight={700}>{msg.text}</Typography>
      </Box>
      )
    })

  useEffect(() => {
    setTimeout(
      bottomOfChat.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      }), 100)
  }, [messages])

  if(!user) {
    return <Navigate to={'/'}/>
  }
  return (
    <Box display='flex' flexDirection='column' flex={1} >
      <Topbar email={getAnotherId(chat?.participants, user.email)}/>

      <Box display='flex' flex={1} flexDirection='column' pt={4} mx={5} overflow='scroll' sx={{'&::-webkit-scrollbar': {width: '0'}}}>
        {getMessages()}
        <div ref={bottomOfChat}></div>
      </Box>

      <Bottombar id={id} user={user}/>
    </Box>
  )
}

export default Chat