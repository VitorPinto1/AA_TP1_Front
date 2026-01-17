import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout/Layout'
import Landing from './pages/Landing'
import Spectacles from './pages/Spectacles'
import Orders from './pages/Orders'
import User from './pages/User'
import Dashboard from './pages/Dashboard'
import Creation from './pages/Creation'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/programmation" element={<Spectacles />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/creation" element={<Creation />} />
            <Route path="/user" element={<User />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

