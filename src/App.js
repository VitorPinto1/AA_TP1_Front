import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Landing from './pages/Landing'
import Spectacles from './pages/Spectacles'
import Representations from './pages/Representations'
import Orders from './pages/Orders'
import User from './pages/User'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/spectacles" element={<Spectacles />} />
          <Route path="/representations" element={<Representations />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/user" element={<User />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App

