import * as Yup from 'yup';

export const EditProductsSchema = Yup.object().shape({
    name: Yup.string().min(3, 'Min length name is 3').required("Name is required"),
    price: Yup.number().min(1000, 'Minimal 1000').positive().required("Price is required"),
    category: Yup.string().required("Category is required"),
    description: Yup.string().min(10, 'Min length description is 10').required("Description is required"),
    image_thumbnail: Yup.mixed()
        .test("FILE_SIZE", "File size too large (max 5MB)", (value) => {
            if (typeof value === 'string') return true;
            return value instanceof File && value.size < 5 * 1024 * 1024;
        })
        .test("FILE_TYPE", "Invalid image format (PNG, JPG, or WebP allowed)", (value) => {
            if (typeof value === 'string') return true;
            return value instanceof File && ['image/png', 'image/jpeg', 'image/webp'].includes(value.type);
        }),
    image_details: Yup.mixed()
        .test("FILE_SIZE", "File size too large (max 5MB)", (value) => {
            if (typeof value === 'object') return true;
            return value instanceof FileList && Array.from(value).every((file) => file.size < 5 * 1024 * 1024);
        })
        .test("FILE_TYPE", "Invalid image format (PNG, JPG, or WebP allowed)", (value) => {
            if (typeof value === 'object') return true;
            return value instanceof FileList && Array.from(value).every((file) => ['image/png', 'image/jpeg', 'image/webp'].includes(file.type));
        })
        .test("FILE_LENGTH", "Maximum 3 detail images allowed", (value) => {
            if (typeof value === 'object') return true;
            return value instanceof FileList && value.length <= 3;
        }),
});

export const AddProductsSchema = Yup.object().shape({
    name: Yup.string().min(3, 'Min length name is 3').required("Name is required"),
    price: Yup.number().min(1000, "minimal 1000").positive().required("Price is required"),
    category: Yup.string().test("SELECT CATEGORY", "Select Category", (value) => value !== "Select Category").required("Category is required"),
    description: Yup.string().min(10, 'Min length description is 10').required("Description is required"),
    image_thumbnail: Yup.mixed()
        .test("FILE_SIZE", "File size too large (max 5MB)", (value) => {
            if (typeof value === 'string') return true;
            return value instanceof File && value.size < 5 * 1024 * 1024;
        })
        .test("FILE_TYPE", "Invalid image format (PNG, JPG, or WebP allowed)", (value) => {
            if (typeof value === 'string') return true;
            return value instanceof File && ['image/png', 'image/jpeg', 'image/webp'].includes(value.type);
        }).required("Image Thumbnail is required"),
    image_details: Yup.mixed()
        .test("FILE_SIZE", "File size too large (max 5MB)", (value) => {
            if (typeof value === 'object') return true;
            return value instanceof FileList && Array.from(value).every((file) => file.size < 5 * 1024 * 1024);
        })
        .test("FILE_TYPE", "Invalid image format (PNG, JPG, or WebP allowed)", (value) => {
            if (typeof value === 'object') return true;
            return value instanceof FileList && Array.from(value).every((file) => ['image/png', 'image/jpeg', 'image/webp'].includes(file.type));
        })
        .test("FILE_LENGTH", "Maximum 3 detail images allowed", (value) => {
            if (typeof value === 'object') return true;
            return value instanceof FileList && value.length <= 3;
        })
        .required("Image Details is required"),
});