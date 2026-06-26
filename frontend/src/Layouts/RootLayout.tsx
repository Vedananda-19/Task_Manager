import NavBar from "../Components/NavBar"
import {Outlet} from "react-router-dom"

const RootLayout = () => {
  return (
    <div>
        <NavBar />
        <Outlet />
    </div>
  )
}

export default RootLayout