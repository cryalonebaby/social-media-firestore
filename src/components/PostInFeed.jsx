import { CircularProgress } from "@mui/material";
import { collection, query, where, getDocs, orderBy, doc, deleteDoc, getDoc, updateDoc, increment, arrayUnion, arrayRemove} from "firebase/firestore";
import React, { useEffect, useState } from 'react'
import { db } from "../firebase";
import Post from "./Post";
import {useNavigate} from 'react-router-dom'

const PostInFeed = ({profile, userId, isAuth}) => {

  // INITIAL VALUE FOR STATE
  const item = JSON.parse(localStorage.getItem('user')) || null

	// STATE OF LOCAL STORAGE
	const [state, setState] = useState(item)

  // STATE FOR LOADING
  const [loading, setLoading] = useState(false)

  // STATE FOR POSTS ARRAY
  const [postsArr, setPostsArr] = useState([])

  const navigate = useNavigate()

  // WHEN PROFILE BOOLEAN CHANGE, QUERY POSTS FROM FIRESTORE
  useEffect(() => {
    const getQuery = async () => {
      let q = query(collection(db, 'posts'), orderBy('date'))
      if(profile) {
        q = query(collection(db, 'posts'), where('author', '==', state.id), orderBy('date'))
      }
      if(userId) {
        q = query(collection(db,'posts'), where('author', '==', userId), orderBy('date'))
      }
      const querySnapshot = await getDocs(q)
      querySnapshot.forEach((doc) => {
        setPostsArr(prev => [...prev, doc.data()])
      })
    }
    getQuery()
  }, [profile])

  // DELETE FIRESTORE DOC
  const deleteTheDoc = async (name) => {
    const docRef = doc(db, 'posts', name)
    console.log(name);

    await deleteDoc(docRef)
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

  // UPDATE FIRESTORE DOC
	const updateTheAmountInDoc = async () => {
    try {
			
			// THE PATH TO THE DOC
			const docRef = doc(db, 'users', state.id)
			
			// UPDATE THE DOC
			await updateDoc(docRef, {
				amount: increment(-1)
			})

      await reloadDoc(state.id)
		} catch (e) {
			console.error("Error updating document: ", e);
		}
  }

  // UPDATE PEOPLE LIKES ARRAY IN DOC
  const updateTheLikesArray = async (postId, like) => {
    try {
      // THE PATH TO THE DOC
			const docRef = doc(db, 'posts', postId)

      // UPDATE THE DOC
      if (like) {
        await updateDoc(docRef, {
          peopleLikes: arrayUnion(state.id),
          likes: increment(1)
        })
        console.log('Updated');
      } else {
        await updateDoc(docRef, {
          peopleLikes: arrayRemove(state.id),
          likes: increment(-1)
        })
      }
    } catch (e) {
			console.error("Error updating document: ", e);
		}
  }

  const removePost = async (id) => {
    setLoading(true)
    await deleteTheDoc(id)
    await updateTheAmountInDoc()
    setLoading(false)
    window.location.reload()
  }

  const handleNotAuth = () => {
    if(isAuth) return
    navigate('/auth')
  }

  return (
    <>
    {postsArr.map((post, indx) => {
      const isMe = state ? post.peopleLikes.find(item => item === state?.id) : false
      return (
        <div key={indx} onClick={handleNotAuth}>
          {loading && <CircularProgress color="secondary" />}
          <Post
            profileImg={state?.img}
            profileName={state?.name}
            profileId={state?.id}
            authorId={post.author}
            name={post.name}
            date={post.date}
            img={post.img}
            text={post.text}
            comments={post.comments}
            likes={post.likes}
            avatar={post.avatar}
            profile={profile}
            postId={post.id}
            commentsArr={post.peopleComments}
            isMe={!!isMe}
            removePost={removePost}
            updateTheLikesArray={updateTheLikesArray}
          />
      </div>
      )
    }).reverse()}
    </>
  )
}

export default PostInFeed