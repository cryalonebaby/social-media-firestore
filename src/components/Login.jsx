import { Button, Grid, Paper, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import {getAuth, onAuthStateChanged, signInWithEmailAndPassword} from 'firebase/auth'
import { Navigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'

const Login = () => {

	// CREATE COPY OF AUTH
	const auth = getAuth()

	// CHECK IF USER LOGGED IN
	const [item, setItem] = useState(localStorage.getItem('user'))

  // INITIAL LOCAL STATE FOR INPUTS
  const [values, setValues] = useState({
    email: '',
		password: ''
  })

	// CHANGE LOCAL STATE ON INPUTS CHANGE
  const handleInput = (e) => {
    const {name, value} =  e.target
    setValues({
      ...values,
      [name]: value
    })
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

	// LOGIN USER
	const handleLogin = (e) => {
		// STOP AUTO REFRESH PAGE
		e.preventDefault()

		// SIGN IN THE USER
		signInWithEmailAndPassword(auth, values.email, values.password)
		.then(async ({user}) => {

			// READ DOC AND CREATE LOCAL STORAGE WITH THE DATA
			await readDoc(user.uid).then((result) => {
				localStorage.setItem('user', JSON.stringify(result))
			})

			// SET STATE BY NEW CREATED ITEM
			setItem(localStorage.getItem('user'))

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
                <Typography variant='h4'>Sign In</Typography>
            </Grid>  
				<form onSubmit={handleLogin}>
					<TextField 
						sx={{mb: 6, mt: 10}} 
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
						sx={{mb: 10}} 
						label='Password' 
						placeholder='Enter your password' 
						type={'password'} 
						fullWidth 
						required
						value={values.password}
						onChange={handleInput}
						name={'password'}
					/>  
					<Button sx={{p: 2}} type='submit' variant='contained' color='primary' fullWidth>Submit</Button>
				</form>
        </Paper>
    </Grid>
  )
}

export default Login