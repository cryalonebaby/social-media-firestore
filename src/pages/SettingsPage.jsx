import { Avatar, Button, FormControl, Grid, Input, InputLabel, Typography, styled } from '@mui/material'
import { Box, Container } from '@mui/system'
import { EmailAuthProvider, getAuth, reauthenticateWithCredential, updateEmail } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { db, storage } from '../firebase'

const StyledBox = styled(Box)(({theme}) => ({
	"&:hover": {
		cursor: 'pointer'
	}
}))

const SettingsPage = () => {

  // CREATE COPY OF AUTH
	const auth = getAuth()

  // STATE TO CHECK IF EMAIL INPUT WAS CHANGED
	const [emailFlag, setEmailFlag] = useState(false)

  // INITIAL VALUE FOR STATE
  const item = JSON.parse(localStorage.getItem('user')) || null

	// STATE OF LOCAL STORAGE
	const [state, setState] = useState(item)

  const [values, setValues] = useState({
		name: state?.name,
		email: state?.email,
		password: ''
	})

	// INIT REF FOR INPUT
	const inputFile = useRef(null)

	// DEFINE TWO STATES (FOR FILE URL AND FOR FILE OBJECT)

	// URL FOR PREVIEW
	const [selectedFile, setSelectedFile] = useState(state?.img);

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

	// UPLOAD THE IMAGE AND UPDATE THE DOC
	const uploadImage = async (e) => {

		// WORKING CODE!

		if(theFile === null) return

		try {
			const imgRef = ref(storage, `avatars/${theFile.name + state.id}`)

			const snapshot = await uploadBytes(imgRef, theFile)
			const url = await getDownloadURL(snapshot.ref)
			await updateTheImgInDoc(url)
			alert('SUCCESS')
		} catch (e) {
			console.error(e);
		}

		// const imgRef = ref(storage, `avatars/${theFile.name + state.id}`)

		// await uploadBytes(imgRef, theFile)
		// 	.then((snapshot) => {
		// 		console.log('SNAPSHOT', snapshot);
		// 		getDownloadURL(snapshot.ref)
		// 			.then(async (url) => {
		// 				console.log('URL', url);
		// 		// 		await updateTheImgInDoc(url)
		// 		// 		alert('SUCCESS')
		// 			})
		// 	})
	}

  // CHANGE LOCAL STATE ON INPUTS NAME
	const handleChange = (e) => {
		const {name, value} = e.target
    if(name === 'email') {
			setEmailFlag(true)
		}
		setValues({
			...values,
			[name]: value
		})
	}

  // UPDATE AUTH FIREBASE USER EMAIL
	const updateUserEmail = async (email, password) => {

		// GET USER DATA FROM EMAIL PROVIDER
		const credential = EmailAuthProvider.credential(auth.currentUser.email, `${password}`)

		// FORCE REAUTH USER TO BE ABLE TO UPDATE EMAIL OR PASSWORD
		await reauthenticateWithCredential(
			auth.currentUser, 
			credential
		)

		try {
			// CALL UPDATE EMAIL PROMISE
			await updateEmail(auth.currentUser, email)

			console.log('Email Updated')
				
			setEmailFlag(false)
	
		} catch (e) {
			console.error(e)
		}
	}
	// UPDATE FIRESTORE DOC
	const updateTheImgInDoc = async (url) => {
		try {
			
			// THE PATH TO THE DOC
			const docRef = doc(db, 'users', state.id)
			
			// UPDATE THE DOC
			await updateDoc(docRef, {
				img: `${url}`
			})
		} catch (e) {
			console.error("Error updating document: ", e);
		}
	}

  // UPDATE FIRESTORE DOC
	const updateTheNameInDoc = async (id) => {
		try {
			
			// THE PATH TO THE DOC
			const docRef = doc(db, 'users', id)
			
			// UPDATE THE DOC
			await updateDoc(docRef, {
				name: values.name
			})
		} catch (e) {
			console.error("Error updating document: ", e);
		}
	}

  	// UPDATE FIRESTORE DOC
	const updateTheEmailInDoc = async (id) => {
		try {
			
			// THE PATH TO THE DOC
			const docRef = doc(db, 'users', id)
			
			// UPDATE THE DOC
			await updateDoc(docRef, {
				email: values.email
			})

      console.log('Update DOC HERE');

			// UPDATE EMAIL IF EMAIL CHANGED FROM DATABASE BY ADMIN
			await updateUserEmail(values.email, values.password)

		} catch (e) {
			console.error("Error updating document: ", e);
		}
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
	const reloadDoc = (id) => {
		// READ NEW DOC AND RE-SET LOCAL STORAGE ITEM
		readDoc(id).then((result) => {
			localStorage.setItem('user', JSON.stringify(result))

			// SET STATE BY NEW CREATED ITEM
			setState(JSON.parse(localStorage.getItem('user')))

			console.log(result.img);

			// const password = values.password

			// SET STATE FOR NAME
			setValues({
				name: result.name,
				email: result.email,
				password: ''
			})

			setTheFile(null)
			setSelectedFile(result.img)

      window.location.reload()

			// // UPDATE EMAIL IF EMAIL CHANGED FROM DATABASE BY ADMIN
			// updateUserEmail(result.email, password)
			
		})
	}

  // SUBMIT FORM
	const handleEdit = async (e) => {
		// STOP AUTO REFRESH PAGE
    e.preventDefault()

		// CALL THE UPDATE
		await updateTheNameInDoc(state.id)
		
    if(emailFlag) {
      await updateTheEmailInDoc(state.id)
    }

		if(theFile) {
			await uploadImage()
		}

		reloadDoc(state.id)
  }

  if(item === null) {
		return <Navigate to={'/'}/>
	}

  return (
    <Box>
      <Navbar/>
      <Container>
        <Box sx={{textAlign: 'center'}}>
          <Typography variant='h2' fontWeight={200} sx={{fontSize: 50, marginY: 3}}>Profile Settings</Typography>
          <form onSubmit={handleEdit}>
            <Grid container spacing={6} >
							<Grid item xs={12} sm={12} >
								<Box display={'flex'} justifyContent={'center'}>
									<StyledBox sx={{width: 160, height: 160, position: 'relative', overflow: 'hidden', borderRadius: 50}} onClick={onImageClick}>
										<Avatar sx={{width: 160, height: 160, zIndex: -1}} src={selectedFile}/>
										<input
											type={'file'}
											onChange={changeFileHandler}
											ref={inputFile}
											style={{display: 'none'}}
										/>
									</StyledBox>
								</Box>
              </Grid>
              <Grid item xs={12} sm={12} >
                <FormControl variant="standard">
                  <InputLabel>Name</InputLabel>
                  <Input sx={{width: {xs: 200, sm: 300}}} required type='text' value={values.name} onChange={handleChange} name='name'/>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12}>
                <FormControl variant="standard">
                  <InputLabel>Email</InputLabel>
                  <Input sx={{width: {xs: 200, sm: 300}}} required type='email' value={values.email} onChange={handleChange} name='email'/>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12}>
                <FormControl variant="standard">
                  <InputLabel>Password</InputLabel>
                  <Input sx={{width: {xs: 200, sm: 300}}} required type='password' value={values.password} onChange={handleChange} name='password'/>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12} sx={{marginBottom: 5}}>
                <Button type='submit' sx={{paddingX: 5}} variant='contained' color='success'>Save</Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Container>
    </Box>
  )
}

export default SettingsPage