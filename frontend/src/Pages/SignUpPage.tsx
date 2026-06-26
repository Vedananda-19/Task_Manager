import { useState } from "react";
import axios from "axios";
import api from "../apis/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const SignUpPage = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
    });
    const [serverError, setServerError] = useState("");
    const navigate = useNavigate();
    const validationError =
        formData.confirmPassword &&
        formData.password !== formData.confirmPassword
            ? "Passwords do not match"
            : "";

    const handleRegister = async (event: React.FormEvent) => {
        event.preventDefault();
        if (validationError) {
            toast.error(validationError);
            return;
        }
        setServerError("");
        try {
            await api.post("/auth/register", formData);
            toast.success("Account created. Please log in.");
            navigate("/login");
        } catch (error: unknown) {
            const detail = axios.isAxiosError(error)
                ? error.response?.data?.detail
                : undefined;
            const message =
                typeof detail === "string"
                    ? detail
                    : "An error occurred while registering.";
            setServerError(message);
            toast.error(message);
        }
    };

    return (
        <div className="backgroundDiv">
            <div className="centerCard">
                <form className="authForm" onSubmit={handleRegister}>
                    <div className="formHeading">
                        <h1>Create account</h1>
                        <p>Start managing your tasks.</p>
                    </div>
                    <input
                        type="text"
                        placeholder="Username"
                        value={formData.username}
                        onChange={(e) =>
                            setFormData((v) => ({
                                ...v,
                                username: e.target.value,
                            }))
                        }
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) =>
                            setFormData((v) => ({
                                ...v,
                                password: e.target.value,
                            }))
                        }
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                            setFormData((v) => ({
                                ...v,
                                confirmPassword: e.target.value,
                            }))
                        }
                        required
                    />
                    <button type="submit" disabled={Boolean(validationError)}>
                        Register
                    </button>
                    {(validationError || serverError) && (
                        <p className="errorMessage">
                            {validationError || serverError}
                        </p>
                    )}
                    <button
                        type="button"
                        className="authSecondaryButton"
                        onClick={() => navigate("/login")}
                    >
                        Back to login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignUpPage;
