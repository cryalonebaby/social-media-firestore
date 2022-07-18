import { Avatar, Box, Button, Container, IconButton, Stack, Typography } from '@mui/material'
import React, { useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PostInFeed from '../components/PostInFeed';
import { useEffect } from 'react';
import { arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const UserPage = () => {

  // INITIAL VALUE FOR STATE
  const item = JSON.parse(localStorage.getItem('user')) || null

	// STATE OF LOCAL STORAGE
	const [state, setState] = useState(item)

  const [noUser, setNoUser] = useState(false)

  // GET USER ID FROM QUERY PARAMS
  const {id} = useParams()

  // INITIAL STATE FOR USER
  const [user, setUser] = useState({})

  // READ AN EXISTING DOC BY ID
  const readDoc = async (id) => {
    const docRef = doc(db, 'users', id)
    const query = await getDoc(docRef)

    if (query.exists()) {
      return query.data()
    } else {
      console.log('No such document!');
      setNoUser(true)
    }
  }

  useEffect(() => {

    readDoc(id).then(result => setUser(result))
    readDoc(id).then(result => setFollowed(result.followers.find(id => id === state.id)))

  }, [])

  // STATE OF FOLLOW
  const [followed, setFollowed] = useState(user.followers?.find(id => id === state.id))

  // UPDATE FIRESTORE DOC
  const updateTheDoc = async () => {
    try {
			
			// THE PATH1 TO THE DOC
			const docRef1 = doc(db, 'users', user.id)

      // THE PATH2 TO THE DOC
			const docRef2 = doc(db, 'users', state.id)
			
			// UPDATE THE DOC
			await updateDoc(docRef1, {
				followers: arrayUnion(state.id)
			})

      // UPDATE THE DOC
			await updateDoc(docRef2, {
				following: arrayUnion(user.id)
			})

		} catch (e) {
			console.error("Error updating document: ", e);
		}
  }

  // RELOAD FIRESTORE DOC
	const reloadDoc = async (id) => {
		// READ NEW DOC AND RE-SET LOCAL STORAGE ITEM
		const result = await readDoc(id)
    localStorage.setItem('user', JSON.stringify(result))

    // SET STATE BY NEW CREATED ITEM
    setState(JSON.parse(localStorage.getItem('user')))
	}

  // FOLLOW USER
  const followUser = async () => {
    setFollowed(true)
    await updateTheDoc()
    await reloadDoc(state.id)
  }

  if(!state) {
    return <Navigate to={'/'}/>
  }

  if(noUser) {
    return <Navigate to={'/'}/>
  }

  return (
    <Box>
      <Navbar/>
      <Container>
        <Box sx={{textAlign: 'center'}}>
          <Box>
            <Box sx={{display: 'flex', justifyContent: 'center', marginTop: 6}}>
              <Avatar src={user.img} sx={{ width: 100, height: 100, borderRadius: 1, boxShadow: '0 4px 8px 1px rgba(0, 0, 0, 0.2)' }}/>
            </Box>
            <Typography mt={3} variant='h4' fontWeight={500}>{user.name}</Typography>
            <Typography variant='h6' fontWeight={100}>{user.email}</Typography>
          </Box>
        </Box>
          <Stack direction={'row'} spacing={{xs: 1, sm: 8}} sx={{justifyContent: 'center', marginTop: 2, alignItems: 'center'}}>
            {!!followed ? 
              <Typography>Followed</Typography> : 
              <Button variant='contained' sx={{height: 40}} onClick={followUser}>Follow</Button>
            }
            <IconButton sx={{display: 'block', color: 'black'}}>
              <CommentOutlinedIcon sx={{fontSize: {xs: 22, sm: 30}}}/>
              <Typography>Message</Typography>
            </IconButton>
          </Stack>
          <Stack direction={'column'} spacing={2} mt={2}>
            <Box display={'flex'} gap={4}>
              <WorkOutlineOutlinedIcon fontSize='medium'/>
              <Typography fontWeight={600}>Programmer</Typography>
            </Box>
            <Box display={'flex'} gap={4}>
              <HomeOutlinedIcon fontSize='medium'/>
              <Typography fontWeight={600}>Lives in Kyiv, Ukraine</Typography>
            </Box>
            <Box display={'flex'} gap={4}>
              <LocationOnOutlinedIcon fontSize='medium'/>
              <Typography fontWeight={600}>From Lviv</Typography>
            </Box>
          </Stack>
          <Box textAlign={'center'}>
            <Typography variant='h5' mt={3} fontWeight={400}>User's Posts</Typography>
          </Box>
            <Box sx={{display: 'flex', justifyContent: 'center'}}>
              <Box>
                <PostInFeed profile={false} userId={id}/>
              </Box>
            </Box>
      </Container>
    </Box>
  )
}

export default UserPage