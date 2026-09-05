import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useFormik } from "formik";
import Input from "@/components/input";
import SelectCategory from "@/components/selectCategory";
import InputFile from "@/components/inputFile";
import { AddProductsSchema } from "@/Schema";
import ImagePreview from "@/components/imagePreview";
import TextArea from "@/components/textArea";
import { useState } from "react";
import useFetchCategory from "@/hooks/useFetchCategory";
import useAddProducts from "@/hooks/useAddProducts";
import { ProductPost } from "@/types";
import { Link } from "react-router-dom";
import { FormSkeleton } from "@/components/ui/Skeleton";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconPhoto,
} from "@tabler/icons-react";

export default function AddProducts() {
  const notify = () =>
    toast.error("Failed to add product. Please verify all fields.", {
      position: "bottom-right",
      theme: "dark",
    });

  const { mutate, isPending } = useAddProducts({
    onError: () => {
      notify();
    },
  });

  const [image, setImage] = useState<{
    image_thumbnail: string;
    image_details: string[];
  }>({ image_thumbnail: "", image_details: [] });

  const { data: categories, isLoading: isCategoryLoading } = useFetchCategory({
    onError: () => notify(),
  });

  const formik = useFormik({
    initialValues: {
      image_thumbnail: "",
      image_details: [] as File[],
      name: "",
      price: "",
      category: "Select Category",
      description: "",
    },
    validationSchema: AddProductsSchema,
    enableReinitialize: true,
    onSubmit: async () => {
      const formData = new FormData();
      formData.append("name", formik.values.name);
      formData.append("price", String(formik.values.price));
      formData.append("category", formik.values.category);
      formData.append("description", formik.values.description);
      formData.append("image_thumbnail", formik.values.image_thumbnail);

      (formik.values.image_details || []).forEach((file: File) => {
        formData.append("image_details", file);
      });

      mutate(formData as unknown as ProductPost);
    },
  });

  const handleImageThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const upload = e.target.files ? e.target.files[0] : null;
    if (upload) {
      const url = URL.createObjectURL(upload);
      setImage((prev) => ({ ...prev, image_thumbnail: url }));
      formik.setFieldValue("image_thumbnail", upload);
    }
  };

  const handleCloseImageDetails = (index: number) => {
    const newImageDetails = image.image_details.filter((_, idx) => idx !== index);
    const newFormDataImageDetails = (formik.values.image_details || []).filter(
      (_, idx) => idx !== index
    );
    formik.setFieldValue("image_details", newFormDataImageDetails);
    setImage((prev) => ({ ...prev, image_details: newImageDetails }));
  };

  const handleImageDetails = (e: React.ChangeEvent<HTMLInputElement>) => {
    const upload = e.target.files;
    if (!upload || upload.length === 0) return;

    if (image.image_details.length + upload.length > 3) {
      toast.warning("Maximum of 3 detail images allowed.", {
        position: "bottom-right",
        theme: "dark",
      });
      return;
    }

    const previewUrls: string[] = [];
    const filesArray = Array.from(upload);

    filesArray.forEach((file) => {
      previewUrls.push(URL.createObjectURL(file));
    });

    setImage((prev) => ({
      ...prev,
      image_details: [...prev.image_details, ...previewUrls],
    }));

    formik.setFieldValue("image_details", [
      ...(formik.values.image_details || []),
      ...filesArray,
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/products"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10 transition-colors"
            title="Back to Products"
          >
            <IconArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Create New Product
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Add a new Apple product listing to the Cyber catalog.
            </p>
          </div>
        </div>
      </div>

      {isCategoryLoading ? (
        <FormSkeleton />
      ) : (
        <form
          onSubmit={formik.handleSubmit}
          className="rounded-3xl bg-[#10131c]/90 border border-neutral-800/90 p-6 sm:p-10 backdrop-blur-xl space-y-6 shadow-2xl"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              name="name"
              label="Product Title"
              placeholder="e.g. iPhone 16 Pro Max 256GB"
              type="text"
              value={formik.values.name}
              handleChange={formik.handleChange}
              error={formik.touched.name ? formik.errors.name : undefined}
              required
            />

            <Input
              name="price"
              label="Price (IDR)"
              placeholder="e.g. 24.999.000"
              type="text"
              isCurrency={true}
              value={formik.values.price}
              handleChange={formik.handleChange}
              error={formik.touched.price ? formik.errors.price : undefined}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <SelectCategory
              name="category"
              label="Category"
              options={categories || []}
              value={formik.values.category}
              handleChange={formik.handleChange}
              error={formik.touched.category ? formik.errors.category : undefined}
              required
            />
          </div>

          <TextArea
            name="description"
            label="Product Description"
            placeholder="Provide technical specifications, display size, chip, and packaging details..."
            value={formik.values.description}
            handleChange={formik.handleChange}
            error={formik.touched.description ? formik.errors.description : undefined}
            required
          />

          {/* Image Upload Section */}
          <div className="pt-4 border-t border-neutral-800/80 space-y-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <IconPhoto className="w-4 h-4 text-cyan-400" />
              Media Assets & Visuals
            </h3>

            {/* Thumbnail Upload */}
            <div className="space-y-3">
              <InputFile
                name="image_thumbnail"
                label="Primary Thumbnail Image"
                hint="Main catalog display image (JPEG/PNG/WebP)"
                handleChange={handleImageThumbnail}
              />
              {formik.touched.image_thumbnail && formik.errors.image_thumbnail && (
                <p className="text-[11px] text-rose-400 font-medium">
                  {formik.errors.image_thumbnail}
                </p>
              )}

              {image.image_thumbnail && (
                <div className="pt-2">
                  <ImagePreview
                    image={image.image_thumbnail}
                    label="Cover Photo"
                  />
                </div>
              )}
            </div>

            {/* Gallery Images Upload */}
            <div className="space-y-3">
              <InputFile
                name="image_details"
                label="Product Gallery (Max 3 Images)"
                hint="High-resolution angles and detail shots (Up to 3 images)"
                multiple={true}
                handleChange={handleImageDetails}
              />
              {formik.touched.image_details && formik.errors.image_details && (
                <p className="text-[11px] text-rose-400 font-medium">
                  {formik.errors.image_details as string}
                </p>
              )}

              {image.image_details.length > 0 && (
                <div className="flex flex-wrap gap-4 pt-2">
                  {image.image_details.map((imgUrl, index) => (
                    <ImagePreview
                      key={index}
                      index={index}
                      image={imgUrl}
                      onClose={handleCloseImageDetails}
                      label={`Angle ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-neutral-800/80 flex items-center justify-end gap-3">
            <Link
              to="/products"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:bg-white/5 border border-neutral-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Publishing Product...
                </>
              ) : (
                <>
                  <IconDeviceFloppy className="w-4 h-4" />
                  Publish to Store
                </>
              )}
            </button>
          </div>
        </form>
      )}

      <ToastContainer theme="dark" />
    </div>
  );
}