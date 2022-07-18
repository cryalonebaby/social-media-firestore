import { Avatar, Button, styled, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { addDoc, collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { db } from '../firebase';
import getAnotherId from '../utils/getAnotherId';

const ChatBox = styled(Box)({
  '&:hover': {
    backgroundColor: 'lightgray',
    cursor: 'pointer'
  }
})

const Sidebar = ({handleChatId}) => {

  // INITIAL VALUE FOR STATE
  const item = JSON.parse(localStorage.getItem('user')) || null

  // STATE OF LOCAL STORAGE
  const [user, setUser] = useState(item)

  // INITIAL STATE FOR CHATS

  const [chatsSnapshot, loading, error] = useCollection(collection(db, 'chats'))
  const [usersSnapshot, usersLoading, usersError] = useCollection(collection(db, 'users'))

  const chats = chatsSnapshot?.docs.map(doc => ({id: doc.id, ...doc.data()}))
  const chatUsers = usersSnapshot?.docs.map(doc => ({id: doc.id, ...doc.data()}))

  // useEffect(() => {
  // const getChats = async () => {
  //   const querySnapshot = await getDocs(collection(db, "chats"));
  //   setSnapshot(querySnapshot)
  // }
  // const getUsers = async () => {
  //   const querySnapshot = await getDocs(collection(db, 'users'))
  //   setAllUsers(querySnapshot)
  // }
  // getChats()
  // getUsers()
  // }, [])

  const chatList = () => {
    return (
      chats?.filter(chat => chat.participants.includes(user.email))
      .map(
        chat => {
          const chatUser = chatUsers.find(item => item.email === getAnotherId(chat.participants, user.email))
          return (
            <ChatBox key={chat.id} display='flex' alignItems='center' p={2} onClick={() => handleChatId(chat.id)}>
              <Avatar src={chatUser?.img} sx={{marginRight: 2}}/>
              <Typography>{chatUser?.name}</Typography>
            </ChatBox>
          )
        }
      )
    )
  }

  const chatExists = (email) => chats?.find(chat => (chat.participants.includes(user.email) && chat.participants.includes(email)))

  const newChat = async () => {
    const input = prompt('Enter the email')

    if(!chatExists(input)) {
      await addDoc(collection(db, 'chats'), {participants: [user.email, input]})
    }
  }

  return (
    <Box width='320px' height='100%' borderRight='1px solid' borderColor='gray' sx={{display: 'flex', flexDirection: 'column'}}>
      <Button sx={{margin: 2}} variant='contained' onClick={newChat}>Add Chat</Button>
      <Box display='flex' flexDirection='column' overflow='scroll' sx={{'&::-webkit-scrollbar': {width: '0'}}} flex={1}>
        {chatList()}
      </Box>
    </Box>
  )
}

export default Sidebar