import React from 'react'
import Login from './components/client/Login'
import CustomButtom from './templates/CustomButtom'
import AdminDashboard from './components/admin/AdminDashboard'
import { Route, Routes } from 'react-router-dom'
import OngoingProject from './components/admin/OngoingProject'
import CompletedProject from './components/admin/CompletedProject'
import ProjectView from './components/common/ProjectView'
import ClientDashboard from './components/client/ClientDashboard'
import Update from './components/client/Update'
import Report from './components/client/Report'
import Ticket from './components/client/Ticket'
import Task from './components/admin/Task'
import AdminLogin from './components/admin/AdminLogin'
import Chatbot from './components/client/Chatbot'
import AdminUpdate from './components/admin/AdminUpdate'
import AdminTickets from './components/admin/AdminTickets'
import Gallery from './components/client/Gallery'

const App = () => {
  return (
    <div className=' w-screen max-h-[100vh] '>
      <Routes>
        <Route path="/user/login" element={<Login />} />
        <Route path='/admin/profile' element={<AdminDashboard />} />
        <Route path='/admin/profile/ongoing' element={<OngoingProject />} />
        <Route path='/admin/profile/completed' element={<CompletedProject />} />
        <Route path='/user/projectview' element={<ProjectView />} />
         <Route path='/user/profile' element={<ClientDashboard />} />
         <Route path='/user/update' element={<Update />} />
          <Route path='/user/report' element={<Report />} />
            <Route path='/user/ticket' element={<Ticket />} />
            <Route path='/admin/task' element={<Task />} />
            <Route path='/admin/login' element={<AdminLogin />} />
            <Route path='/user/chat' element={<Chatbot />} />
            <Route path='/admin/updates' element={<AdminUpdate />} />
            <Route path='/admin/tickets' element={<AdminTickets />} />
            <Route path='/user/gallery' element={<Gallery />} />
      </Routes>
     

    </div>
  )
}

export default App