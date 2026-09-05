import type { Product, Search } from "@/types";
import useFetchProducts from "@/hooks/useFetchProducts";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { formatRupiah } from "@/libs/formatRupiah";
import { Link } from "react-router-dom";
import useDeleteProducts from "@/hooks/useDeleteProducts";
import Pagination from "@/components/pagination";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { useState } from "react";
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconBuildingStore,
  IconAlertTriangle,
  IconX,
} from "@tabler/icons-react";

export default function Products() {
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const notify = () =>
    toast.error("Failed to load products. Please check your connection.", {
      position: "bottom-right",
      autoClose: 2500,
      theme: "dark",
    });

  const { data, isLoading, refetch } = useFetchProducts({
    onError: () => notify(),
    currentPage,
    search,
  });

  const { mutate, isPending: isDeleting } = useDeleteProducts({
    onError: () =>
      toast.error("Failed to delete product.", {
        position: "bottom-right",
        theme: "dark",
      }),
    onSuccess: () => {
      toast.success("Product deleted successfully.", {
        position: "bottom-right",
        theme: "dark",
      });
      setProductToDelete(null);
      refetch();
    },
  });

  const changePage = (page: number) => {
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const handleSearch = (e: Search) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  };

  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (e.target.value === "") {
      setCurrentPage(1);
    }
  };

  const confirmDelete = () => {
    if (productToDelete) {
      mutate(productToDelete._id);
    }
  };

  const backendUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-[#11141e] border border-neutral-800 p-6 sm:p-8 shadow-2xl space-y-6">
            <button
              onClick={() => setProductToDelete(null)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white transition-colors"
            >
              <IconX className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
                <IconAlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete Product?</h3>
                <p className="text-xs text-neutral-400">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800/80">
              <p className="text-xs text-neutral-400">Product Name:</p>
              <p className="text-sm font-semibold text-white mt-0.5">
                {productToDelete.name}
              </p>
              <p className="text-[11px] text-neutral-400 mt-1">
                ID: {productToDelete._id}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:bg-white/5 border border-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-lg shadow-rose-500/25 transition-all flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <IconTrash className="w-4 h-4" />
                    Delete Permanently
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Header: Search & Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#10131c]/90 border border-neutral-800/90 backdrop-blur-xl">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            name="search"
            value={search}
            onChange={handleChangeSearch}
            placeholder="Search products by title..."
            className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-neutral-900/90 border border-neutral-700/80 text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 text-[11px] font-semibold transition-colors"
          >
            Filter
          </button>
        </form>

        <Link
          to="add-products"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all group"
        >
          <IconPlus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
          Add Product
        </Link>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <TableSkeleton cols={6} rows={6} />
      ) : !data || data.products.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bg-[#10131c]/90 border border-neutral-800/80 p-8">
          <div className="w-14 h-14 rounded-2xl bg-neutral-800/60 border border-neutral-700/60 flex items-center justify-center mx-auto mb-3 text-neutral-400">
            <IconBuildingStore className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-white">
            No Products Found
          </h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            {search
              ? `No products matched "${search}". Try adjusting your search query.`
              : "Your inventory catalog is currently empty. Click 'Add Product' to get started."}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#10131c]/90 border border-neutral-800/90 overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800/80 bg-neutral-900/60 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">Product Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Unit Price</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50 text-xs">
                {data.products.map((product: Product, index: number) => {
                  const imageSrc = product.image_thumbnail?.startsWith("http")
                    ? product.image_thumbnail
                    : `${backendUrl}/images${product.image_thumbnail}`;

                  return (
                    <tr
                      key={product._id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="py-4 px-4 text-center text-neutral-400 font-mono text-[11px]">
                        {(currentPage - 1) * 12 + index + 1}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-neutral-800/80 border border-neutral-700/80 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {product.image_thumbnail ? (
                              <img
                                src={imageSrc}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <IconBuildingStore className="w-5 h-5 text-neutral-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-neutral-100 group-hover:text-cyan-300 transition-colors truncate max-w-xs sm:max-w-sm">
                              {product.name}
                            </p>
                            <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                              ID: {product._id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[11px] font-medium">
                          {product.category?.name || "General"}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-semibold text-white font-mono">
                        {formatRupiah(product.price)}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            to={`edit-products/${product._id}`}
                            className="p-2 rounded-xl text-neutral-300 hover:text-cyan-300 hover:bg-cyan-500/10 border border-neutral-800 hover:border-cyan-500/30 transition-all"
                            title="Edit Product"
                          >
                            <IconEdit className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setProductToDelete(product)}
                            className="p-2 rounded-xl text-neutral-300 hover:text-rose-400 hover:bg-rose-500/10 border border-neutral-800 hover:border-rose-500/30 transition-all"
                            title="Delete Product"
                          >
                            <IconTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-neutral-400">
              Showing page{" "}
              <strong className="text-white">{currentPage}</strong> of{" "}
              <strong className="text-white">{data.page}</strong> &bull; Total{" "}
              <strong className="text-white">{data.count}</strong> products
            </span>

            <Pagination
              total={data.page}
              currentPage={currentPage}
              setCurrentPage={changePage}
            />
          </div>
        </div>
      )}

      <ToastContainer theme="dark" />
    </div>
  );
}
