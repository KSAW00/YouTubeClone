// Main App - sets up routing and theme
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import Layout from './components/layout'
import HomePage from './pages/HomePage'
import VideoPage from './pages/VideoPage'
import RegisterPage from './pages/RegisterPage'
import UploadPage from './pages/UploadPage'
import ChannelPage from './pages/ChannelPage'
import CreateChannelPage from './pages/CreateChannelPage'
import EditPage from './pages/EditPage'
import './styles/theme.css'

function App() {
  return (
    // Router wraps everything for navigation
    <Router>
      <Routes>
        {/* Every route gets the Layout wrapper */}
        <Route path="/edit/:id" element={<Layout><EditPage /></Layout>} />
        <Route path="/channel/:channelId" element={<Layout><ChannelPage /></Layout>} />
        <Route path="/video/:id" element={<Layout><VideoPage /></Layout>} />
        <Route path="/create-channel" element={<Layout><CreateChannelPage /></Layout>} />  
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/upload" element={<Layout><UploadPage /></Layout>} />
        <Route path="/login" element={<Layout><LoginPage /></Layout>} />
        <Route path="/register" element={<Layout><RegisterPage /></Layout>} />
      </Routes>
    </Router>
  )
}

export default App;
