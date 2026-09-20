import { AxiosError } from 'axios';

export interface Product {
    name: string;
    price: number;
    category: Category;
    description: string;
    image_thumbnail: string;
    image_details: string[];
    createdAt: Date;
    updatedAt: Date;
    _id: string;
}

export interface Category {
    name: string;
    _id: string;
}

export interface ProductPost {
    name: string;
    price: number;
    category: string;
    description: string;
    image_thumbnail: File | string;
    image_details: File[] | string[];
}

export interface LoginPost {
    email: string;
    password: string;
}

export interface NameProviderType {
    name: string;
    setName: (name: string) => void;
}

export interface ResponsFetchProducts {
    count: number;
    page: number;
    products: Product[];
}

export interface LoginResponse {
    token: string;
    accessToken?: string;
    refreshToken?: string;
    name: string;
    role: string;
}

export interface OrderResponse {
    count: number;
    orders: Order[];
    page: number;
}

export interface Chart {
    _id: string;
    total: number;
}

export interface DashboardResponse {
    totalProducts: number;
    resultTotal: number;
    totalOrders: number;
    totalUsers: number;
    dataChart: Chart[];
}

export interface OrderItem {
    _id: {
        _id?: string;
        name?: string;
        price?: number;
        image_thumbnail?: string;
        category?: any;
    } | string;
    name: string;
    price: number;
    quantity: number;
}

export interface Order {
    _id: string;
    user?: {
        _id?: string;
        name?: string;
        email?: string;
        avatar?: string;
    } | string;
    tax: number;
    createdAt: Date;
    updatedAt: Date;
    status_delivery: string;
    payment_method: string;
    payment_details?: any;
    shipping: number;
    delivery_address: {
        provinsi: string;
        kabupaten: string;
        name: string;
        kecamatan: string;
        kelurahan: string;
        detail: string;
    };
    discount: number;
    total: number;
    status_payment: string;
    order_items?: OrderItem[];
    url_redirect?: string;
}

export interface Search extends React.FormEvent<HTMLFormElement> {
    target: EventTarget & {
        search: { value: string };
    };
}

export interface DashboardUser {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    createdAt: string;
    updatedAt: string;
}

export interface UserListResponse {
    total: number;
    totalAdmins: number;
    totalRegularUsers: number;
    users: DashboardUser[];
}

export interface DashboardVoucher {
    _id: string;
    code: string;
    title: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minPurchase: number;
    maxDiscount?: number;
    isPublic: boolean;
    isActive: boolean;
    validUntil: string;
    usageLimit: number;
    usedCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface VoucherListResponse {
    total: number;
    totalPublic: number;
    totalPrivate: number;
    vouchers: DashboardVoucher[];
}

declare module '@tanstack/react-query' {
    interface Register {
        DefaultError: AxiosError
    }
}


