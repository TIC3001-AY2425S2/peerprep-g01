import Header from './Header'
import Footer from './Footer'
import Home from '../pages/Home'
import Contact from '../pages/Contact'
import Login from '../pages/Login'
import SignUp from '../pages/SignUp'
import ProductDetails from '../pages/ProductDetails'
import QuestionService from '../pages/QuestionService'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
//import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'

export default function Router() {
    const Layout = () => {
        return (
            <>
            <Header />
            <div className="content"><Outlet /></div>
            <Footer />
            </>
        )
    }

    const BrowserRoutes = () => {
        return (
            <BrowserRouter>
                <Routes>
                <Route path="/" element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    {/* <Route path="contact-us" element={<Contact />} /> */}
                   
                    <Route path="QuestionService" element={<QuestionService />} />
                    <Route path="login" element={<Login />} />
                    <Route path="SignUp" element={<SignUp />} />
                </Route>
                </Routes>
            </BrowserRouter>
        )
    }

    // this code shows how to program out the router using createBrowserRouter
    // const BrowserRoutes = createBrowserRouter([
    //     {
    //         path: "/",
    //         element: <Layout />,
    //         children: [
    //             {
    //                 path: "/",
    //                 element: <Home />
    //             },
    //             {
    //                 path: "/contact-us",
    //                 element: <Contact />
    //             }
    //         ]
    //     }
    // ])

    // add this RouterProvider in the return statement if you plan on using the createBrowserRouter
    // <RouterProvider router={BrowserRoutes} />

    return (
        <BrowserRoutes />
    )
}