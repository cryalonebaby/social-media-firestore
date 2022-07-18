import { Button, Grid, Paper, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'
import {getAuth, createUserWithEmailAndPassword} from 'firebase/auth'
import {setDoc, doc} from 'firebase/firestore'
import {db} from '../firebase'
import { Navigate } from 'react-router-dom'

const Register = () => {

  // CREATE COPY OF AUTH
	const auth = getAuth()

	// CHECK IF USER LOGGED IN
	const [item, setItem] = useState(localStorage.getItem('user'))

  // INITIAL LOCAL STATE FOR INPUTS
  const [values, setValues] = useState({
    email: '',
		password: '',
    name: ''
  })

	// CHANGE LOCAL STATE ON INPUTS CHANGE
  const handleInput = (e) => {
    const {name, value} =  e.target
    setValues({
      ...values,
      [name]: value
    })
  }

	// ADD DOC IN FIRESTORE NAMED BY THE USER ID
	const addNewDoc = async (id, data) => {
		try {
			// SAVE PATH FOR OUT FIRESTORE DOC
			const docRef = doc(db, 'users', id)
			await setDoc(docRef, data)
		} catch (e) {
			console.error("Error adding document: ", e);
		}
	}

	// REGISTER THE USER
	const handleRegister = (e) => {
		// STOP AUTO REFRESH PAGE
		e.preventDefault()

		// REGISTER USER ON FIREBASE
		createUserWithEmailAndPassword(auth, values.email, values.password)
		.then(({user}) => {

			// LOCAL DATA FOR LOCAL STORAGE
			const data = {
				email: values.email,
				name: values.name,
				id: user.uid,
        amount: 0,
        followers: [],
        following: []
			}

			// CREATE LOCAL STORAGE ITEM 
			localStorage.setItem('user', JSON.stringify(data))

			// SET STATE BY NEW CREATED ITEM
			setItem(localStorage.getItem('user'))

			// CALL THE CREATION OF FIRESTORE DOC
			addNewDoc(user.uid, data)

			// RESET INPUTS STATE
			setValues({
				email: '',
				password: '',
				name: ''
			})
		})
		.catch((e) => {
			console.error(e);
		})
	}

	if(item) {
		return <Navigate to={'/'}/>
	}

  return (
    <Grid container>
        <Paper elevation={20} sx={{p: 5, width: '280px', m: '0 auto'}}>
            <Grid textAlign={'center'} item>
                <Typography variant='h4'>Sign Up</Typography>
            </Grid>  
                <form onSubmit={handleRegister}>
                    <TextField 
                        sx={{mb: 6, mt: 6}} 
                        label='Email' 
                        placeholder='Enter your email' 
                        type={'email'} 
                        fullWidth 
                        required
                        value={values.email}
                        onChange={handleInput}
                        name={'email'}
                    />  
                    <TextField 
                        sx={{mb: 6}} 
                        label='Password' 
                        placeholder='Enter your password' 
                        type={'password'} 
                        fullWidth 
                        required
                        value={values.password}
                        onChange={handleInput}
                        name={'password'}
                    />  
                    <TextField 
                        sx={{mb: 6}} 
                        label='Name' 
                        placeholder='Enter your name' 
                        type={'text'} 
                        fullWidth 
                        required
                        value={values.name}
                        onChange={handleInput}
                        name={'name'}
                    /> 
                    <Button sx={{p: 2}} type='submit' variant='contained' color='primary' fullWidth>Submit</Button>
                </form>
        </Paper>
    </Grid>
  )
}

export default Register