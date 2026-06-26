import { useQuery } from "@tanstack/react-query"
import api from "../apis/api"

const useUser = () => {
    const token = localStorage.getItem("access_token");
    return useQuery({
        queryKey: ["user"],
        enabled: Boolean(token),
        queryFn: async () => {
            const response = await api.get("/user/me");
            return response.data;
        },

        retry: false,
        staleTime: 1000 * 60 * 5,
    });
};


export default useUser