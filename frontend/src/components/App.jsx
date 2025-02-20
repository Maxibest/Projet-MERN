import {Routes, Route } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Protected from './Welcome';
import Profile from './Profile';
import EmailVerify from './VerifEmail';
import Request from './ResetPasswordRequest';
import Verif from './CodeVerif';
import NewPassword from './NewPassword';
import Users from './Users';
import AddClient from './AddClient';
import Project from './Project';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Signup />} />
      <Route path='/login' element={<Login />} />
      <Route path='/protected' element={<Protected />} />
      <Route path="/profile" element={<Profile/>} />
      <Route path="/confirm-email" element={<EmailVerify/>} />
      <Route path="/request" element={<Request/>} />
      <Route path="/codeVerif" element={<Verif/>} />
      <Route path="/newPassword" element={<NewPassword/>} />
      <Route path="/users" element={<Users/>} />
      <Route path="/add-client" element={<AddClient/>} />
      <Route path="/project/:projectId" element={<Project/>} />
    </Routes>
  );
}

export default App;
