import { NavLink, useNavigate } from "react-router-dom";
import { queryClient } from "../main";
import useUser from "../hooks/useUser";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";

const NavBar = () => {
    const navigate = useNavigate();
    const {data:user} = useUser()
    const [darkMode, setDarkMode] = useState(() =>
        window.matchMedia("(prefers-color-scheme: dark)").matches
    );

    useEffect(() => {
        localStorage.setItem("theme", darkMode ? "dark" : "light");
        document.documentElement.classList.toggle("dark", darkMode);
    }, [darkMode]);

    const logout = () => {
        const confirmed = window.confirm("Are you sure you want to log out?");
        if (!confirmed) return;
        localStorage.removeItem("access_token");
        queryClient.removeQueries({queryKey:["user"]})
        toast.success("Logged out successfully.");
        navigate("/login");
    };

    return (
        <nav className="navBar">
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
                <button
                        className="navLink"
                        type="button"
                        onClick={() => setDarkMode((prev) => !prev)}
                    >
                        {darkMode ? "light" : "dark"}
                    </button>
            </div>
        </nav>
    );
};

export default NavBar;
