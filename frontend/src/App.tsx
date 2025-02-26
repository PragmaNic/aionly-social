import './App.css'
import { Web3Provider } from './contexts/Web3Context'
import Header from './components/layout/Header'
import VerificationPage from './pages/VerificationPage'

function App() {
  return (
    <Web3Provider>
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <main>
          <VerificationPage />
        </main>
      </div>
    </Web3Provider>
  )
}

export default App