import useUser from "../hooks/useUser";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = () => {
    const { data: user, isLoading, error } = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    if (isLoading) return <div className="routeState"><h5>Loading...</h5></div>;

    if (
        !user ||
        (axios.isAxiosError(error) && error.response?.status === 401)
    ) {
        return (
            <div className="routeState">
                <h3>Login to View</h3>
                <p>Your session is required before viewing this page.</p>
                <button
                    className="primaryButton"
                    onClick={() =>
                        navigate("/login", {
                            state: { from: location },
                            replace: true,
                        })
                    }
                >
                    Login
                </button>
            </div>
        );
    }
    if (error) {
        return <div className="routeState"><p>An error occurred.</p></div>;
    }
    return <Outlet />;
};

export default ProtectedRoute;
