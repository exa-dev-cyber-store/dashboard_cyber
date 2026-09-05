import { login } from "@/app/api/auth";
import { NameProvider } from "@/context";
import { LoginPost } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

export default function useLogin({ onError }: { onError: () => void }) {
    const [, setCookie] = useCookies(['token', 'admin_name']);
    const nameContext = useContext(NameProvider);
    const { setName } = nameContext!;
    const navigate = useNavigate();
    return useMutation({
        mutationFn: async (data: LoginPost) => await login(data),
        onSuccess: (data) => {
            console.log(data)
            if (data.role !== 'admin') {
                onError();
                return false;
            }
            const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
            setCookie('token', data.token, { path: '/', sameSite: 'lax', secure: isSecure });
            setCookie('admin_name', data.name, { path: '/', sameSite: 'lax', secure: isSecure });
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('token', data.token);
                localStorage.setItem('admin_name', data.name);
            }
            setName(data.name);
            navigate('/');
        },
        onError: () => {
            onError()
            return false;
        },
    })
};