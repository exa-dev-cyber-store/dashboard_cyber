import { getProducts } from "@/app/api/products";
import { ResponsFetchProducts } from "@/types";
import { useQuery } from "@tanstack/react-query";


export default function useFetchProducts({ onError, currentPage, search }: { onError: () => void, currentPage: number, search: string }) {
    return useQuery<ResponsFetchProducts>({
        queryKey: ["products", currentPage, search],
        queryFn: async () => await getProducts(currentPage, search),
        throwOnError() {
            onError()
            return false;
        },
        retry: 1,
    }
    );
}