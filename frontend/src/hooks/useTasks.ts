import { useQuery } from "@tanstack/react-query"
import api from "../apis/api";

type Task = {
    id: string;
    title: string;
    description: string;
    priority: number;
    deadline: string | null;
    tags: string[];
    completed: boolean;
    timestamp?: string;
};
type PageData = {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
}


const useTasks = (params?:URLSearchParams) => {
    const getTasks = async (params?:URLSearchParams):Promise<{tasks:Task[],page_data:PageData}> =>{
        const response = await api.get("/user/get-tasks",{params:params});
        return response.data
    }

    return useQuery({queryKey:['tasks',params?.toString() ?? ""],
        queryFn:() => getTasks(params)})
}

export default useTasks