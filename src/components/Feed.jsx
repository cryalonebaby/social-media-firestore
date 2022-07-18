import React, { useRef, useState } from 'react'
import { Box } from '@mui/system'
import PostInFeed from './PostInFeed'
import { Avatar, Button, CircularProgress, Container, IconButton, Stack, TextField } from '@mui/material'
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import SendIcon from '@mui/icons-material/Send';
import { addDoc, collection, Timestamp, doc, setDoc, increment, updateDoc, getDoc } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

const Feed = () => {

  // INITIAL VALUE FOR STATE
  const item = JSON.parse(localStorage.getItem('user')) || null

	// STATE OF LOCAL STORAGE
	const [state, setState] = useState(item)

  // STATE FOR TEXT INPUT
  const [postText, setPostText] = useState('')

  // STATE FOR LOADING
  const [loading, setLoading] = useState(false)

  // // STATE FOR FIRESTORE IMG URL
  // const [postImg, setPostImg] = useState('')

  // TEXT INPUT ONCHANGE
  const handleInput = (e) => {
    setPostText(e.target.value)
  }

  // INIT REF FOR INPUT
	const inputFile = useRef(null)

	// DEFINE TWO STATES (FOR FILE URL AND FOR FILE OBJECT)
	// URL FOR PREVIEW
	const [selectedFile, setSelectedFile] = useState();

	// OBJECT FOR UPLOADING
  const [theFile, setTheFile] = useState();

	// CONNECT A CLICK TO REF ELEMENT
	const onImageClick = () => {
		inputFile.current.click()
	}	

	// HANDLER FOR SELECTED FILE
	const changeFileHandler = (e) => {
		const [img] = e.target.files
		setTheFile(img)
		setSelectedFile(URL.createObjectURL(img))
	}

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

  // RELOAD FIRESTORE DOC
	const reloadDoc = async (id) => {
		// READ NEW DOC AND RE-SET LOCAL STORAGE ITEM
		const result = await readDoc(id)
    localStorage.setItem('user', JSON.stringify(result))

    console.log(result)

    // SET STATE BY NEW CREATED ITEM
    setState(JSON.parse(localStorage.getItem('user')))
	}

  // ADD POST DOC TO FIRESTORE
  const addPostDoc= async (data) => {
    try {
      const docRef = doc(db, 'posts', `${state.amount}${state.id}`)
      await setDoc(docRef, data)
    } catch (e) {
      console.error("Error adding post: ", e);
    }
  }

  // UPDATE FIRESTORE DOC
	const updateTheAmountInDoc = async () => {
    try {
			
			// THE PATH TO THE DOC
			const docRef = doc(db, 'users', state.id)
			
			// UPDATE THE DOC
			await updateDoc(docRef, {
				amount: increment(1)
			})

      await reloadDoc(state.id)
		} catch (e) {
			console.error("Error updating document: ", e);
		}
  }

  // UPLOAD THE IMAGE AND UPDATE THE DOC
	const uploadImageAndPost = async () => {

		// WORKING CODE!
		if(!theFile) return

		try {
      setLoading(true)
			const imgRef = ref(storage, `posts/${theFile.name + state.id}`)

      console.log('Uploading Started');

			const snapshot = await uploadBytes(imgRef, theFile)
      console.log('Get snapshot');
			const url = await getDownloadURL(snapshot.ref)
      console.log('Get url', url);

      const data = {
        author: state.id,
        name: state.name,
        avatar: state.img,
        comments: 0,
        date: Timestamp.now(),
        img: url,
        likes: 0,
        peopleLikes: [],
        text: postText,
        id: `${state.amount}${state.id}`
      }

      await addPostDoc(data)
      await updateTheAmountInDoc()
      console.log('Added Post');
      setLoading(false)
      window.location.reload()

		} catch (e) {
			console.error(e);
		}
	}

  // SAVE POST WITH INPUTS AND CALL ADD POST DOC 
  const savePost = async () => {
    if(postText === '' || !theFile) return

    await uploadImageAndPost()
  }

  return (
    <Box flex={10} p={2}>
      {
        state && (
          <Container>
          <Box width='90%'>
            <Box sx={{display: 'flex', gap: 3}}>
              <Avatar src={state.img}/>
              <TextField
                value={postText}
                onChange={handleInput} 
                fullWidth 
                sx={{flex: 5}}
                id="standard-multiline-static"
                label="What's on your mind?"
                multiline
                rows={4}
                variant="standard"
              />
            </Box>
            {selectedFile && (
              <Box mt={2} textAlign='center'>
                <img src={selectedFile} style={{width: '50vw'}}/>
              </Box>
            )}
            <Box mt={2}>
              <Stack direction={'row'} justifyContent='flex-end' gap={10}>
                <IconButton onClick={onImageClick}>
                  <ImageSearchIcon color='success'/>
                  <input
                    type={'file'}
                    ref={inputFile}
                    onChange={changeFileHandler}
                    style={{display: 'none'}}
                  />
                </IconButton>
                {loading ? 
                  <Button variant='contained' color='primary'>
                    <CircularProgress color="inherit" />
                  </Button> : 
                  <Button onClick={savePost} variant='contained' color='primary' startIcon={<SendIcon/>}>
                    Upload
                  </Button>
                }
                
              </Stack>
            </Box>
          </Box>
          
        </Container>
        )
      }
      <PostInFeed profile={false} isAuth={state}/>
    </Box>
  )
}

export default Feed