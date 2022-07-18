import { Box } from '@mui/material'
import React from 'react'
import { useState } from 'react'
import Chat from '../components/Chat'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

const ChatPage = () => {
  const [chatId, setChatId] = useState()
  const handleChatId = (id) => {
    setChatId(id)
  }
  return (
    <Box display='flex' flexDirection='column' height='100vh'>
      <Navbar/>
      <Box display='flex' sx={{'&::-webkit-scrollbar': {width: '0'}}} overflow='scroll' flex={1}>
        <Sidebar
          handleChatId={handleChatId}
        />
        <Chat id={chatId}/>
      </Box>
      {/* <Box display='flex' flex={1} bgcolor='lightcoral' width='100%'></Box> */}
    </Box>
  )
}

export default ChatPage