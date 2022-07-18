import { Avatar, Container, IconButton, ImageList, ImageListItem, Modal, Stack, styled, Typography } from '@mui/material'
import { Box } from '@mui/system'
import React, { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import PermIdentityOutlinedIcon from '@mui/icons-material/PermIdentityOutlined';
import DomainVerificationOutlinedIcon from '@mui/icons-material/DomainVerificationOutlined';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PostInFeed from '../components/PostInFeed'
import { useEffect } from 'react'
import { arrayRemove, doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

const StyledModal = styled(Modal)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
})

const ProfilePage = () => {

  // CREATE COPY OF NAVIGATE
  const navigate = useNavigate()

  // INITIAL VALUE FOR STATE
  const item = JSON.parse(localStorage.getItem('user')) || null

	// STATE OF LOCAL STORAGE
	const [state, setState] = useState(item)

  const [followingOpen, setFollowingOpen] = useState(false)
  const [followersOpen, setFollowersOpen] = useState(false)

  // STATE FOR MODAL
  const [modal, setModal] = useState({
    open: false,
    title: '',
    followings: false
  })

  const [followersList, setFollowersList] = useState([])
  const [followingList, setFollowingList] = useState([])

  // READ AN EXISTING DOC BY ID
  const readDoc = async (id) => {
    const docRef = doc(db, 'users', id)
    const query = await getDoc(docRef)

    if (query.exists()) {
      return query.data()
    } else {
      console.log('No such document!');
    }
  }

  useEffect(() => {

    // LOCAL ARRAYS
    const localFollowers = []
    const localFollowing = []

    // GET ALL FOLLOWINGS
    const getFollowings = async () => {
      for(let i = 0; i < state.following.length; i++) {
        const user = await readDoc(state.following[i])
        localFollowing.push(user)
      }
      setFollowingList(localFollowing)
    }

    // GET ALL FOLLOWERS
    const getFollowers = async () => {
      for(let i = 0; i < state.followers.length; i++) {
        const user = await readDoc(state.followers[i])
        localFollowers.push(user)
      }
      setFollowersList(localFollowers)
    }

    getFollowings()
    getFollowers()

  }, [])

  const openModal = (dataType) => {
    if(dataType === 'followers') {
      setFollowersOpen(true)
    }
    if(dataType === 'followings') {
      setFollowingOpen(true)
    }
  }

  // UPDATE FIRESTORE DOC
  const updateTheDoc = async (followingId) => {
    try {
			
			// THE PATH1 TO THE DOC
			const docRef1 = doc(db, 'users', followingId)

      // THE PATH2 TO THE DOC
			const docRef2 = doc(db, 'users', state.id)
			
			// UPDATE THE DOC
			await updateDoc(docRef1, {
				followers: arrayRemove(state.id)
			})

      // UPDATE THE DOC
			await updateDoc(docRef2, {
				following: arrayRemove(followingId)
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

  const removeFollowing = async (id) => {
    setFollowingList((followings) => followings.filter(item => item.id !== id))
    await updateTheDoc(id)
    await reloadDoc(state.id)
  }

  // NAVIGATE TO PROFILE PAGE
  const navigateTo = (location) => {
    navigate(`/${location}`)
  }

  if(state === null) {
		return <Navigate to={'/'}/>
	}

  return (
    <Box>
      <Navbar/>
      <Container>
        <Box sx={{textAlign: 'center'}}>
          <Typography variant='h2' fontWeight={200} sx={{fontSize: 50}}>ProfilePage</Typography>
          <Box>
            <Box sx={{display: 'flex', justifyContent: 'center', marginTop: 6}}>
              <Avatar src={state.img} sx={{ width: 100, height: 100, borderRadius: 1, boxShadow: '0 4px 8px 1px rgba(0, 0, 0, 0.2)' }}/>
            </Box>
            <Typography mt={3} variant='h4' fontWeight={500}>{state.name}</Typography>
            <Typography variant='h6' fontWeight={100}>{state.email}</Typography>
          </Box>
        </Box>  
        <Stack direction={'row'} spacing={{xs: 1, sm: 8}} sx={{justifyContent: 'center', marginTop: 2}}>
          <IconButton sx={{display: 'block', color: 'black'}} onClick={() => openModal('followers')}>
            <PermIdentityOutlinedIcon sx={{fontSize: {xs: 22, sm: 30}}}/>
            <Typography>Friends</Typography>
          </IconButton>
          <IconButton sx={{display: 'block', color: 'black'}} onClick={() => openModal('followings')}>
            <DomainVerificationOutlinedIcon sx={{fontSize: {xs: 22, sm: 30}}}/>
            <Typography>Following</Typography>
          </IconButton>
          <IconButton sx={{display: 'block', color: 'black'}}>
            <CommentOutlinedIcon sx={{fontSize: {xs: 22, sm: 30}}}/>
            <Typography>Message</Typography>
          </IconButton>
          <IconButton sx={{display: 'block', color: 'black'}} onClick={() => navigateTo('profile/settings')}>
            <SettingsOutlinedIcon sx={{fontSize: {xs: 22, sm: 30}}}/>
            <Typography>Settings</Typography>
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
          <Typography variant='h5' mt={3} fontWeight={400}>My Posts</Typography>
        </Box>
        <Box sx={{display: 'flex', justifyContent: 'center'}}>
          <Box>
            <PostInFeed profile={true}/>
          </Box>
        </Box>
      </Container>
      <StyledModal
        open={followingOpen}
        onClose={() => setFollowingOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
         <Box width={400} height={280} p={3} bgcolor={"white"} color={"black"} borderRadius={5}>
          <Typography variant="h6" color={"gray"} textAlign="center">
            Following
          </Typography>
          {followingList.map((item) => {
            return (
              <Box key={item.id} sx={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginTop: 4}}>
                <Box sx={{display: 'flex', gap: 4, alignItems: 'center'}} onClick={() => navigateTo(`user/${item.id}`)}>
                  <Avatar src={item?.img}/>
                  <Typography fontWeight={600}>{item.name}</Typography>
                </Box>
                <Typography sx={{marginLeft: 'auto'}} fontWeight={400}>{item.email}</Typography>
                  <IconButton onClick={() => removeFollowing(item.id)}>
                    <CancelOutlinedIcon color='error'/>
                  </IconButton>
              </Box>
            )
          })}
         </Box>
      </StyledModal>
      <StyledModal
        open={followersOpen}
        onClose={() => setFollowersOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box width={400} height={280} p={3} bgcolor={"white"} color={"black"} borderRadius={5}>
          <Typography variant="h6" color={"gray"} textAlign="center">
              Followers
          </Typography>
          {followersList.map((item) => {
            return (
              <Box key={item.id} sx={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginTop: 4}}>
                <Box sx={{display: 'flex', gap: 4, alignItems: 'center'}} onClick={() => navigateTo(`user/${item.id}`)}>
                  <Avatar src={item?.img}/>
                  <Typography fontWeight={600}>{item.name}</Typography>
                </Box>
                <Typography sx={{marginLeft: 'auto'}} fontWeight={400}>{item.email}</Typography>
                  <IconButton onClick={() => removeFollowing(item.id)}>
                    <CancelOutlinedIcon color='error'/>
                  </IconButton>
              </Box>
            )
          })}
        </Box>
      </StyledModal>
    </Box>

  )
}

export default ProfilePage