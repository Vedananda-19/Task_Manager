import {createBrowserRouter,RouterProvider} from "react-router-dom"
import RootLayout from "./Layouts/RootLayout"
import TasksPage from "./Pages/TasksPage"
import LoginPage from "./Pages/LoginPage"
import SignUpPage from "./Pages/SignUpPage"
import ChatPage from "./Pages/ChatPage"
import ProtectedRoute from "./Layouts/ProtectedRoute"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const router = createBrowserRouter([
  {element:<RootLayout />,children:[
    {element:<ProtectedRoute />,children:[
      {index:true,element:<TasksPage />},
      {path:"/chat",element:<ChatPage />},
    ]},
    {path:"/login",element:<LoginPage />},
    {path:"/register",element:<SignUpPage />}
  ]}
])

function App() {
  return (
    <>
    <RouterProvider router = {router}/>
    <ToastContainer position="top-right" autoClose={2000} newestOnTop  />
    </>
  )
}

export default App
