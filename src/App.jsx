import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'

// Placeholder pages
const Login = () => <div className="p-10">Login Page</div>
const SignUp = () => <div className="p-10">Sign Up Page</div>
const ProductDetails = () => <div className="p-10">Product Details</div>
const Cart = () => <div className="p-10">Cart</div>
const Profile = () => <div className="p-10">Profile</div>

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<SignUp />} />
            <Route path="product/:id" element={<ProductDetails />} />
            <Route path="cart" element={<Cart />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
