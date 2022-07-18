import { Favorite, FavoriteBorder } from "@mui/icons-material"
import { Avatar, Button, Card, CardActions, CardContent, CardHeader, CardMedia, Checkbox, Collapse, IconButton, styled, TextField, Typography } from "@mui/material"
import DeleteIcon from '@mui/icons-material/Delete';
import CommentIcon from '@mui/icons-material/Comment';
import { useState } from "react";
import { Box } from "@mui/system";
import SendIcon from '@mui/icons-material/Send';
import { arrayRemove, arrayUnion, doc, increment, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const Post = ({name, date, img, text, comments, likes, avatar, profile, postId, removePost, isMe, updateTheLikesArray, commentsArr, profileImg, profileName, profileId, authorId}) => {

  // PARSE FIRESTORE TIMESTAMP TO NORMAL DATE
  const dateStr = date.toDate().toDateString()
  const dateTime = date.toDate().toLocaleTimeString('en-US')
  const timeArr = dateTime.split(':')
  const dateArr = dateStr.split(' ')
  
  const month = dateArr[1]
  const day = dateArr[2]
  const year = dateArr[3]
  const hours = timeArr[0]
  const minutes = timeArr[1]
  const parOfDay = dateTime.split(' ')[1]

	// INITIAL STATE FOR POST LIKE BY ME OR NOT
	const [isMyLike, setIsMyLike] = useState(isMe)

	// INITIAL STATE FOR POST LIKES
	const [likesAmount, setLikesAmount] = useState(likes)

	// INITIAL STATE FOR POST LIKES
	const [commentsAmount, setCommentsAmount] = useState(comments)

	// INITIAL STATE FOR POST LIKEB BY ME OR NOT
	const [expanded, setExpanded] = useState(false)

	// INITIAL STATE FOR POST COMMENTS ARRAY
	const [postComments, setPostComments] = useState(commentsArr || [])

	// INITIAL STATE FOR POST LIKEB BY ME OR NOT
	const [commentInp, setCommentInp] = useState('')

	const navigate = useNavigate()

	// HANDLE EXPAND COMMENT CLICK
	const handleExpandClick = () => {
    setExpanded(!expanded);
  };

	// HANDLE COMMENT INPUT CHANGE
	const handleCommentChange = (e) => {
    setCommentInp(e.target.value)
  };

	const handleLike = async (e) => {

		// IF CHECKBOX TRUE OR FALSE
		const isLike = e.target.checked
		if (isLike) {	
			setIsMyLike(true)
			setLikesAmount(prev => prev + 1)
			await updateTheLikesArray(postId, true)
		} else {
			setIsMyLike(false)
			setLikesAmount(prev => prev - 1)
			await updateTheLikesArray(postId, false)
		}
	}

	// UPDATE PEOPLE COMMENTS ARRAY IN DOC
  const updateTheCommentsArray = async () => {
		if (!commentInp) return

    try {
      // THE PATH TO THE DOC
			const docRef = doc(db, 'posts', postId)

			const data = {
				date: Timestamp.now(),
				personId: profileId,
				name: profileName,
				avatar: profileImg,
				text: commentInp
			}

      // UPDATE THE DOC
      await updateDoc(docRef, {
				peopleComments: arrayUnion(data),
				comments: increment(1)
			})	

			// UPDATE LOCAL STATE
			setPostComments(prev => [...prev, data])
			setCommentsAmount(prev => prev + 1)
			setCommentInp('')
			console.log('Updated');

    } catch (e) {
			console.error("Error updating document: ", e);
		}
  }

	// DELETE PEOPLE COMMENTS ARRAY IN DOC
  const deleteTheCommentsArray = async (dataToRemove, indx) => {
    try {
      // THE PATH TO THE DOC
			const docRef = doc(db, 'posts', postId)

      // UPDATE THE DOC
      await updateDoc(docRef, {
				peopleComments: arrayRemove(dataToRemove),
				comments: increment(-1)
			})	

			// UPDATE LOCAL STATE
			setPostComments((comments) => comments.filter((_, index) => index !== indx))
			setCommentsAmount(prev => prev - 1)
			console.log('Deleted');

    } catch (e) {
			console.error("Error updating document: ", e);
		}
  }

	const navigateToAccount = () => {
		authorId === profileId ? navigate('/profile') : navigate(`/user/${authorId}`)
	}

  return (
    <Card sx={{margin: 5, width: '80vw'}} elevation={10}>
			{
				profile ? 
				<CardHeader
					avatar={
					<Avatar src={avatar} aria-label="recipe"/>
					}
					action={
					<IconButton aria-label="settings" onClick={() => removePost(postId)}>
							<DeleteIcon color="error"/>
					</IconButton>
					}
					title={name}
					subheader={`${month} ${day}, ${hours}:${minutes}${parOfDay}, ${year}`}
				/> :
				<CardHeader
					avatar={
					<Avatar onClick={navigateToAccount} src={avatar} aria-label="recipe"/>
					}
					title={name}
					subheader={`${month} ${day}, ${hours}:${minutes}${parOfDay}, ${year}`}
				/>
			}
			<CardMedia
					component="img"
					height="10%"
					image={img}
					alt="Post Img"
			/>
			<CardContent>
					<Typography variant="body2" color="text.secondary" fontSize={20}>
					{text}
					</Typography>
			</CardContent>
			<CardActions disableSpacing>
					<IconButton aria-label="add to favorites">
						<Checkbox checked={isMyLike} onChange={handleLike} icon={<FavoriteBorder />} checkedIcon={<Favorite sx={{color: 'red'}}/>} />
						<Typography>{likesAmount}</Typography>
					</IconButton>
					<ExpandMore
						expand={expanded}
						onClick={handleExpandClick}
						aria-expanded={expanded}
						aria-label="show more"
        	>
						<CommentIcon />
						<Typography>{commentsAmount}</Typography>
					</ExpandMore>
			</CardActions>
			<Collapse in={expanded} timeout="auto" unmountOnExit>
				<CardContent>
					<Box sx={{display: 'flex', gap: 2, marginBottom: 6}}>
						<Avatar src={profileImg}/>
						<TextField
							value={commentInp}
							onChange={handleCommentChange}
							fullWidth 
							id="standard-multiline-static"
							label="Comment the post"
							multiline
							rows={3}
							variant="standard"
						/>
						<Button onClick={updateTheCommentsArray} sx={{height: 40, display: 'flex', alignSelf: 'flex-end'}} variant='contained' color='primary' startIcon={<SendIcon/>}>
							Comment
						</Button>
					</Box>
					<Box>
						{
							postComments?.map((comment, indx) => {
								const dataToRemove = {
									avatar: comment.avatar,
									date: comment.date,
									name: comment.name,
									personId: comment.personId,
									text: comment.text
								}
								return (
									<Box sx={{display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'flex-start'}} key={indx}>
										<CardHeader
											avatar={
												<Avatar src={comment.avatar ? comment.avatar : null}/>
											}
											title={comment.name}
										/>
										<CardContent>
											<Typography variant="body2" color="text.primary" fontSize={15}>
												{comment.text}
											</Typography>
										</CardContent>
										{comment.personId === profileId && 
											<CardActions sx={{marginLeft: 'auto'}}>
												<IconButton onClick={() => deleteTheCommentsArray( dataToRemove, indx)}>
													<DeleteIcon color="error"/>
												</IconButton>
											</CardActions>
										}
										
									</Box>
								)
							}).reverse()
						}
					</Box>
				</CardContent>
			</Collapse>
    </Card>
  )
}

export default Post
