import React from 'react'
import HomePage from './components/HomePage'
import Login from './components/client/Login'
import CustomButtom from './templates/CustomButtom'
import AdminDashboard from './components/admin/AdminDashboard'
import { Route, Routes } from 'react-router-dom'
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
import AdminClient from './components/admin/AdminClient'
import AdminProject from './components/admin/AdminProject'
import AdminNotes from './components/admin/AdminNotes'
import AdminTemplates from './components/admin/AdminTemplates'
import AdminMaterial from './components/admin/AdminMaterial'
import WorkerLogin from './worker/WorkerLogin'
import WorkerDashboard from './worker/WorkerDashboard'
import AdminWorker from './components/admin/AdminWorker'
import AdminApproval from './components/admin/AdminApproval'
import ClientApproval from './components/client/ClientApproval'
import ClientProfile from './components/client/ClientProfile'
import AdminProfile from './components/admin/AdminProfile'
import WorkerProfile from './worker/WorkerProfile'
import AdminPayment from './components/admin/AdminPayment'
import AdminAR from './components/admin/AdminAR'
import ClientChat from './components/client/ClientChat'
import AdminChat from './components/admin/AdminChat'

const App = () => {
  return (
    <div className=' w-screen max-h-[100vh] '>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/user/login" element={<Login />} />
        <Route path='/admin/profile' element={<AdminDashboard />} />
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
            <Route path='/admin/client' element={<AdminClient />} />
            <Route path='/admin/project' element={<AdminProject />} />
            <Route path='/admin/notes' element={<AdminNotes />} />
            <Route path='/admin/templates' element={<AdminTemplates />} />
            <Route path='/admin/material' element={<AdminMaterial />} />
            <Route path='/worker/login' element={<WorkerLogin />} />
            <Route path='/worker/profile' element={<WorkerDashboard />} />
            <Route path='/admin/worker' element={<AdminWorker />} />
            <Route path='/admin/approval' element={<AdminApproval />} />
            <Route path='/user/approval' element={<ClientApproval />} />
            <Route path='/user/account' element={<ClientProfile />} />
            <Route path='/admin/account' element={<AdminProfile />} />
            <Route path='/worker/account' element={<WorkerProfile />} />
            <Route path='/admin/payments' element={<AdminPayment />} />
            <Route path='/admin/ar' element={<AdminAR />} />
            <Route path='/user/support' element={<ClientChat />} />
            <Route path='/admin/chat' element={<AdminChat />} />
      </Routes>
     

    </div>
  )
}

export default App