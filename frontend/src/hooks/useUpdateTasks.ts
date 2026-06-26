import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../apis/api";
import { toast } from "react-toastify";

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

type TaskInput = Omit<Task, "id" | "timestamp"> & { id?: string };


const useUpdateTasks = (searchParams:URLSearchParams) => {
    const queryClient = useQueryClient()

    const editTask = async (task: Task) =>{
        const response = await api.post("/user/edit-task", task);
        return response.data
    }
    const addTask = async (task: TaskInput) =>{
        const response = await api.post("/user/add-task", task);
        return response.data
    }
    const deleteTask = async (id: string) =>{
        const response = await api.get(`/user/delete-task/${id}`);
        return response.data
    }
    const checkTask = async (id: string) => {
        const response = await api.get(`/user/check-task/${id}`);
        return response.data
    }

    const refreshTasks = () => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
    const mutationError = () => {
        toast.error("Task update failed. Please try again.");
    }
    const createMutation = useMutation({
        mutationFn: addTask,
        onSuccess: () => {
            refreshTasks();
            toast.success("Task created.");
        },
        onError: mutationError,
    });

    const updateMutation = useMutation({
        mutationFn: editTask,
        onSuccess: () => {
            refreshTasks();
            toast.success("Task updated.");
        },
        onError: mutationError,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteTask,
        onSuccess: () => {
            refreshTasks();
            toast.success("Task deleted.");
        },
        onError: mutationError,
    });

    const checkMutation = useMutation({
        mutationFn:checkTask,
        onSettled: () => {
            refreshTasks();
            toast.success("Task status updated.");
        },
        onMutate: async (newId:string) =>{//Optimistic Update
            await queryClient.cancelQueries({queryKey:["tasks"]})
            const previous = queryClient.getQueryData(["tasks",searchParams.toString()])
            queryClient.setQueryData(
                ["tasks",searchParams.toString()],
                (prev: { tasks: Task[]; page_data: any } | undefined) =>
                    prev ? {
                            ...prev,
                            tasks: prev.tasks.map((task) =>
                                task.id === newId
                                    ? { ...task, completed: !task.completed }
                                    : task
                            ),
                        }: prev
                )
            return {previous}
        },
        onError: (_,__,context) => {
            queryClient.setQueryData(["tasks",searchParams.toString()], context?.previous)
            mutationError()
        }
    })

    return {createMutation,updateMutation,deleteMutation,checkMutation}
}

export default useUpdateTasks
