import { Box, Stack } from '@mui/material'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import React, { useEffect, useState } from 'react'
import Feed from '../components/Feed'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

const HomePage = () => {

  // CREATE COPY OF AUTH
	const auth = getAuth()

  // INITIAL STATE FOR USER
	const [user, setUser] = useState()

  // SET WATCHER ONLY IF AUTH CHANGES
	useEffect(() => {
		onAuthStateChanged(auth, (user) => {
			setUser(user)
		})
	}, [auth])

  return (
    <Box>
        <Navbar/>
        <Stack direction={'row'} justifyContent="space-between">
            <Feed/>
        </Stack>
    </Box>
  )
}

export default HomePage