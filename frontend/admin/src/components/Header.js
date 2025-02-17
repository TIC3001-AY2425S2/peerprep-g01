import logo from '../assets/images/react-logo.png'
import './Header.css'
import { useContext } from 'react'
import Context from './Context'

export default function Header() {
    // const userData = useContext(Context)

    
    return (
        <nav className="nav-bar">
        <p><a href="/"><img src={logo} alt="logo" height="50" /></a></p>
        <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/QuestionService">Question Service</a></li>
            <li><a href="/contact-us">Contact</a></li>
            <li><a href="/login">Login</a></li>
            <li><a href="/signup">Sign Up</a></li>
            {/* <li>Hello {userData.name}</li>
            <li>Cart: {userData.cartItems}</li> */}
        </ul>
        </nav>
    )
    
}
