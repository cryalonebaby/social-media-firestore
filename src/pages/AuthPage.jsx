import { Paper, Tab, Tabs } from "@mui/material"
import { useState } from "react"
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Login from "../components/Login";
import Register from "../components/Register";
import { getAuth } from "firebase/auth";
import { Navigate } from "react-router-dom";

const AuthPage = () => {

	// MUI TAB SYSTEM
	const [value, setValue] = useState(0)

	const handleChange = (event, newValue) => {
		setValue(newValue)
	}

	function TabPanel(props) {
		const { children, value, index, ...other } = props;
	
		return (
			<div
				role="tabpanel"
				hidden={value !== index}
				id={`simple-tabpanel-${index}`}
				aria-labelledby={`simple-tab-${index}`}
				{...other}
			>
				{value === index && (
					<Box>
						<Typography component={'span'}>{children}</Typography>
					</Box>
				)}
			</div>
		);
	}

	const paperStyle = {width: 300, height: 380, margin: '100px auto'}

  return (
		<Paper sx={paperStyle} elevation={20}>
			<Tabs value={value} onChange={handleChange} aria-label="disabled tabs example" variant="fullWidth">
				<Tab label="Sign In" />
				<Tab label="Sign Up" />
			</Tabs>
			<TabPanel value={value} index={0}>
				<Login/>
			</TabPanel>
			<TabPanel value={value} index={1}>
				<Register/>
			</TabPanel>
		</Paper>
  )
}

export default AuthPage