import React, {useState, useEffect} from 'react'
import {AppBar, Toolbar, Typography, InputBase, Badge, Avatar, Button, Menu, MenuItem, Tooltip, IconButton } from '@mui/material'
import AcUnitIcon from '@mui/icons-material/AcUnit';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Box, styled } from '@mui/system';
import {Link, useNavigate} from 'react-router-dom'
import { getAuth, onAuthStateChanged, signOut} from 'firebase/auth';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';

const StyledToolbar = styled(Toolbar)({
    display: 'flex',
    justifyContent: 'space-between',
})
const Search = styled('div')(({theme}) => ({
    padding: '0 10px',
    backgroundColor: "white",
    borderRadius: theme.shape.borderRadius,
    width: "40%"
}))
const Icons = styled(Box)(({theme}) => ({
    display: "none",
    gap: "20px",
    alignItems: "center",
    [theme.breakpoints.up("sm")]: {
        display: "flex"
    }
}))
const UserBox = styled(Box)(({theme}) => ({
    display: 'flex',
    alignItems: 'center',
    gap: "10px",
    [theme.breakpoints.up("sm")]: {
        display: "none"
    }
}))

const Navbar = () => {

  // MUI HANDLE PROFILE SYSTEM
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false)

  const handleClick = (event) => {
    setOpen(true)
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(false)
    setAnchorEl(null);
  }; 

  // CREATE COPY OF AUTH
	const auth = getAuth()

  // CREATE COPY OF NAVIGATE
  const navigate = useNavigate()

  // INITIAL STATE FOR USER
	const [user, setUser] = useState()

  // SET WATCHER ONLY IF AUTH CHANGES
	useEffect(() => {
		onAuthStateChanged(auth, (user) => {
			setUser(user)
		})
	}, [auth])

  // INITIAL VALUE FOR STATE
  const item = JSON.parse(localStorage.getItem('user')) || null

	// STATE OF LOCAL STORAGE
	const [state, setState] = useState(item)

  const [values, setValues] = useState({
		name: state?.name,
		email: state?.email,
		password: ''
	})

  // REMOVE ITEM AND RESET THE STATE
	const removeItem = () => {
		signOut(auth).then(() => console.log('Sign Out Successfully'))
		localStorage.removeItem('user')
		setState(null)
    window.location.reload()
	}

  // NAVIGATE TO PROFILE PAGE
  const navigateTo = (location) => {
    navigate(`/${location}`)
  }

  return (
    <>
    <AppBar position='sticky'>
        <StyledToolbar>
            <Box onClick={() => navigateTo('')}>
              <AcUnitIcon sx={{display: {xs: 'block', sm: 'none'}}}/>
              <Typography sx={{display: {xs: 'none', sm: 'block'}}}>Logo</Typography>
            </Box>
            <Search><InputBase placeholder='Search...'/></Search>
            {state !== null ? (
                <Box>
                    <Icons>
                        <Badge color='error' badgeContent={0}>
                            <MailIcon/>
                        </Badge>
                        <Tooltip title="Account settings">
                            <IconButton
                                onClick={handleClick}
                                size="small"
                                sx={{ ml: 2 }}
                                aria-controls={open ? 'account-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={open ? 'true' : undefined}
                            >
                                <Avatar sx={{ width: 32, height: 32 }} src={state.img}/>
                            </IconButton>
                        </Tooltip>
                        <Typography>{values.name}</Typography>
                    </Icons>
                    <UserBox >
                      <Tooltip title="Account settings">
                        <IconButton
                            onClick={handleClick}
                            size="small"
                            sx={{ ml: 2 }}
                            aria-controls={open ? 'account-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined}
                        >
                            <Avatar sx={{ width: 32, height: 32 }} src={state.img}/>
                        </IconButton>
                      </Tooltip>
                      <Typography>{values.name}</Typography>
                    </UserBox>
                </Box>
            ) : (
                <Box>
                    <Link to={'/auth'} style={{textDecoration:'none'}}>
                        <Button variant='contained'>
                            SignUp
                        </Button>
                    </Link>
                </Box>
            )}   
        </StyledToolbar>
        <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => navigateTo('profile')}>
          <Avatar /> Profile
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => navigateTo('profile/settings')}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={removeItem}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </AppBar>
  </>
  )
}

export default Navbar