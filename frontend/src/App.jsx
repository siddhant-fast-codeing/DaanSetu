import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Dashboard from './pages/Dashboard'
import Ngolist from './pages/Ngolist'

function App() {


  return (
    <>
        
       <BrowserRouter>
        <Routes>
          
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path='/search' element={<Ngolist />} />
          
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
