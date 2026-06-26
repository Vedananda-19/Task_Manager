import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import api from "../apis/api";
import { queryClient } from "../main";
import { toast } from "react-toastify";

const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const navigate = useNavigate()
    const location = useLocation()

    const resetForm = () => {
        setUsername("");
        setPassword("");
    };

    const handleLogin = async(e:React.FormEvent) => {
        e.preventDefault()
        const formData = new URLSearchParams();
        formData.append("username", username);
        formData.append("password", password);
        try {
            const response = await api.post("/auth/login", formData, {
                headers: {
                    "Content-type": "application/x-www-form-urlencoded",
                },
            });
            localStorage.setItem("access_token", response.data.access_token);
            queryClient.invalidateQueries({queryKey:["user"]})
            setErrorMsg("")
            toast.success("Logged in successfully.");
            if (location.state?.from) navigate(location.state.from);
            else navigate("/");
        } catch (error: unknown) {
            const detail = axios.isAxiosError(error) ? error.response?.data?.detail : undefined;
            const message = typeof detail === "string" ? detail : "An error occurred";
            setErrorMsg(message);
            toast.error(message);
        }
        finally{
            resetForm()
        }
    };

    return (
        <div className="backgroundDiv">
            <div className="centerCard">
                <form className="authForm" onSubmit={handleLogin}>
                    <div className="formHeading">
                        <h1>Welcome back</h1>
                        <p>Sign in to manage your tasks.</p>
                    </div>
                    <input
                        type="text"
                        placeholder="Username"
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        required
                        autoFocus
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        required
                    />
                    <button type="submit">Login</button>
                    {errorMsg && <p className="errorMessage">{errorMsg}</p>}
                    <Link className="authLink" to="/register">
                        New user? Create an account
                    </Link>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
