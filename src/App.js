import {Routes, Route, Navigate} from 'react-router-dom'
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';
import HomePage from "./pages/HomePage";
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import UserPage from './pages/UserPage';

function App() {
  return (
    <Routes>
      <Route exact path="/" element={<HomePage/>}/>
      <Route exact path="/auth" element={<AuthPage/>}/>
      <Route exact path="/profile" element={<ProfilePage/>}/>
      <Route exact path="/profile/settings" element={<SettingsPage/>}/>
      <Route exact path='/user/:id' element={<UserPage/>}/>
      <Route exact path='/chat' element={<ChatPage/>}/>
      <Route path="*" element={<Navigate to="/"/>}/>
    </Routes>
  );
}

export default App;
