import { NavLink, useNavigate } from "react-router-dom";
import { queryClient } from "../main";
import useUser from "../hooks/useUser";
import { toast } from "react-toastify";

const NavBar = () => {
    const navigate = useNavigate();
    const {data:user} = useUser()

    const logout = () => {
        const confirmed = window.confirm("Are you sure you want to log out?");
        if (!confirmed) return;
        localStorage.removeItem("access_token");
        queryClient.removeQueries({queryKey:["user"]})
        toast.success("Logged out successfully.");
        navigate("/login");
    };

    return (
        <nav className="navBar" aria-label="Main navigation">
            <div className="navContent">
                <NavLink className="navBrand" to="/">Task Manager</NavLink>
                <div className="navLinks">
                    {user ? (
                        <>
                        <NavLink end className={({ isActive }) => `navLink${isActive ? " active" : ""}`} to="/">Tasks</NavLink>
                        <NavLink className={({ isActive }) => `navLink${isActive ? " active" : ""}`} to="/chat">Chat</NavLink>
                        <button className="navLink logoutButton" type="button" onClick={logout}>Logout</button>
                        </>
                    ) : (
                        <NavLink className={({ isActive }) => `navLink${isActive ? " active" : ""}`} to="/login" replace>Login</NavLink>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
