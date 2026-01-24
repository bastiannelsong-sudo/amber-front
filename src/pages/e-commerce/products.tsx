/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  Breadcrumb,
  Button,
  Label,
  Modal,
  Table,
  Textarea,
  TextInput,
  Badge,
  Tooltip,
} from "flowbite-react";
import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import {
  FaPlus,
  FaFilter,
  FaChartLine,
  FaBox,
  FaHistory,
  FaSync,
} from "react-icons/fa";
import {
  HiHome,
  HiOutlineExclamationCircle,
  HiPencilAlt,
  HiTrash,
  HiUpload,
  HiEye,
  HiViewGrid,
  HiViewList,
  HiSearch,
  HiDownload,
} from "react-icons/hi";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import type { Category, Product, Platform } from "../../types/Products";
import Pagination from "../../util/Pagination";

const EcommerceProductsPage: FC = function () {
  return (
    <NavbarSidebarLayout isFooter={false}>
      {/* Header con tema Amber Nelson - Gold & Black */}
      <div className="block items-center justify-between border-b-2 border-[#d4a574] bg-gradient-to-r from-[#0a0a0a] via-[#1a1a1a] to-[#2d2020] p-6 sm:flex">
        <div className="mb-1 w-full">
          <div className="">
            <Breadcrumb className="mb-4">
              <Breadcrumb.Item href="#">
                <div className="flex items-center gap-x-3">
                  <HiHome className="text-xl text-[#d4a574]" />
                  <span className="font-medium text-[#e8d4b8]">Home</span>
                </div>
              </Breadcrumb.Item>
              <Breadcrumb.Item
                href="/e-commerce/products"
                className="text-[#c4b5a0]"
              >
                E-commerce
              </Breadcrumb.Item>
              <Breadcrumb.Item className="font-semibold text-[#f5d7a1]">
                Productos
              </Breadcrumb.Item>
            </Breadcrumb>
            <div className="flex items-center gap-4">
              <div className="h-12 w-1 bg-gradient-to-b from-[#d4a574] to-[#b8935e]"></div>
              <div>
                <h1 className="bg-gradient-to-r from-[#f5d7a1] via-[#d4a574] to-[#c49a6c] bg-clip-text text-3xl font-bold text-transparent">
                  Catálogo de Productos
                </h1>
                <p className="mt-1 text-sm tracking-wide text-[#a0896f]">
                  Gestión de inventario de accesorios premium
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="overflow-x-auto p-6">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-2xl border-2 border-[#d4a574]/30 shadow-2xl">
              <ProductsTable />
            </div>
          </div>
        </div>
      </div>
    </NavbarSidebarLayout>
  );
};

const AddProductModal: FC = function () {
  const [isOpen, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [formData, setFormData] = useState<{
    internal_sku: string;
    name: string;
    stock: number;
    category_id: number;
    secondarySkus: Array<{
      secondary_sku: string;
      stock_quantity: number;
      publication_link: string;
      platform_id: number;
    }>;
  }>({
    internal_sku: "",
    name: "",
    stock: 0,
    category_id: 0,
    secondarySkus: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      const [catsRes, platformsRes] = await Promise.all([
        fetch("http://localhost:3000/categories"),
        fetch("http://localhost:3000/platforms"),
      ]);
      const [cats, plats] = await Promise.all([
        catsRes.json(),
        platformsRes.json(),
      ]);
      setCategories(cats);
      setPlatforms(plats);
    };
    if (isOpen) fetchData();
  }, [isOpen]);

  const addSecondarySku = () => {
    setFormData((prev) => ({
      ...prev,
      secondarySkus: [
        ...prev.secondarySkus,
        {
          secondary_sku: "",
          stock_quantity: 0,
          publication_link: "",
          platform_id: 0,
        },
      ],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      category: { platform_id: formData.category_id },
      secondarySkus: formData.secondarySkus.map((sku) => ({
        ...sku,
        platform: { platform_id: sku.platform_id },
      })),
    };

    try {
      const response = await fetch("http://localhost:3000/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setOpen(false);
        alert("Producto creado exitosamente!");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Error al crear el producto");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#d4a574] to-[#b8935e] px-6 py-3 font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-[#b8935e] hover:to-[#d4a574] hover:shadow-xl"
      >
        <FaPlus className="text-sm" />
        Agregar Producto
      </button>
      <Modal onClose={() => setOpen(false)} show={isOpen} size="3xl">
        <Modal.Header className="border-b-2 border-[#d4a574] bg-gradient-to-r from-[#1a1a1a] to-[#2d2020] !p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#d4a574] to-[#b8935e]">
              <FaPlus className="text-white" />
            </div>
            <strong className="bg-gradient-to-r from-[#f5d7a1] to-[#d4a574] bg-clip-text text-2xl text-transparent">
              Agregar Producto
            </strong>
          </div>
        </Modal.Header>
        <Modal.Body className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <form onSubmit={handleSubmit} className="mx-auto max-w-2xl p-4">
            <div className="grid grid-cols-1 gap-6">
              {/* Campos principales */}
              <div>
                <Label htmlFor="internal_sku">SKU Interno</Label>
                <TextInput
                  id="internal_sku"
                  value={formData.internal_sku}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      internal_sku: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="name">Nombre del Producto</Label>
                <TextInput
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="stock">Stock</Label>
                <TextInput
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      stock: parseInt(e.target.value),
                    }))
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Categoría</Label>
                <select
                  id="category"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category_id: parseInt(e.target.value),
                    }))
                  }
                  required
                >
                  <option value="">Seleccione una categoría</option>
                  {categories.map((category) => (
                    <option
                      key={category.platform_id}
                      value={category.platform_id}
                    >
                      {category.platform_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* SKUs Secundarios */}
              <div className="border-t pt-4">
                <div className="mb-2 flex justify-between">
                  <Label>SKUs Secundarios</Label>
                  <Button size="xs" onClick={addSecondarySku}>
                    <FaPlus className="mr-1" /> Agregar SKU
                  </Button>
                </div>

                {formData.secondarySkus.map((sku, index) => (
                  <div
                    key={index}
                    className="mb-4 grid grid-cols-1 gap-4 rounded border p-2"
                  >
                    <div>
                      <Label htmlFor={`secondary_sku_${index}`}>
                        SKU Secundario
                      </Label>
                      <TextInput
                        id={`secondary_sku_${index}`}
                        value={sku.secondary_sku}
                        onChange={(e) => {
                          const newSkus = [...formData.secondarySkus];
                          newSkus[index]!.secondary_sku = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            secondarySkus: newSkus,
                          }));
                        }}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor={`stock_quantity_${index}`}>Stock</Label>
                      <TextInput
                        id={`stock_quantity_${index}`}
                        type="number"
                        value={sku.stock_quantity}
                        onChange={(e) => {
                          const newSkus = [...formData.secondarySkus];
                          newSkus[index]!.stock_quantity = parseInt(
                            e.target.value,
                          );
                          setFormData((prev) => ({
                            ...prev,
                            secondarySkus: newSkus,
                          }));
                        }}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor={`publication_link_${index}`}>
                        Enlace de publicación
                      </Label>
                      <TextInput
                        id={`publication_link_${index}`}
                        value={sku.publication_link}
                        onChange={(e) => {
                          const newSkus = [...formData.secondarySkus];
                          newSkus[index]!.publication_link = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            secondarySkus: newSkus,
                          }));
                        }}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`platform_${index}`}>Plataforma</Label>
                      <select
                        id={`platform_${index}`}
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
                        value={sku.platform_id}
                        onChange={(e) => {
                          const newSkus = [...formData.secondarySkus];
                          newSkus[index]!.platform_id = parseInt(
                            e.target.value,
                          );
                          setFormData((prev) => ({
                            ...prev,
                            secondarySkus: newSkus,
                          }));
                        }}
                        required
                      >
                        <option value="">Seleccione plataforma</option>
                        {platforms.map((platform) => (
                          <option
                            key={platform.platform_id}
                            value={platform.platform_id}
                          >
                            {platform.platform_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Button
                      color="failure"
                      size="xs"
                      onClick={() => {
                        const newSkus = formData.secondarySkus.filter(
                          (_, i) => i !== index,
                        );
                        setFormData((prev) => ({
                          ...prev,
                          secondarySkus: newSkus,
                        }));
                      }}
                    >
                      <HiTrash className="mr-1" /> Eliminar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <Modal.Footer className="border-t-2 border-[#d4a574]/20 bg-gray-50 dark:bg-gray-800">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#d4a574] to-[#b8935e] px-8 py-3 font-bold text-white shadow-lg transition-all duration-300 hover:from-[#b8935e] hover:to-[#d4a574] hover:shadow-xl sm:w-auto"
              >
                <FaPlus />
                Crear Producto
              </button>
            </Modal.Footer>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};
const EditProductModal: FC = function () {
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 font-semibold text-white shadow-md transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg"
      >
        <HiPencilAlt className="text-lg" />
        Editar
      </button>
      <Modal onClose={() => setOpen(false)} show={isOpen}>
        <Modal.Header className="border-b border-gray-200 !p-6 dark:border-gray-700">
          <strong>Edit product</strong>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <Label htmlFor="productName">Product name</Label>
                <TextInput
                  id="productName"
                  name="productName"
                  placeholder='Apple iMac 27"'
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <TextInput
                  id="category"
                  name="category"
                  placeholder="Electronics"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="brand">Brand</Label>
                <TextInput
                  id="brand"
                  name="brand"
                  placeholder="Apple"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                <TextInput
                  id="price"
                  name="price"
                  type="number"
                  placeholder="$2300"
                  className="mt-1"
                />
              </div>
              <div className="lg:col-span-2">
                <Label htmlFor="productDetails">Product details</Label>
                <Textarea
                  id="productDetails"
                  name="productDetails"
                  placeholder="e.g. 3.8GHz 8-core 10th-generation Intel Core i7 processor, Turbo Boost up to 5.0GHz, Ram 16 GB DDR4 2300Mhz"
                  rows={6}
                  className="mt-1"
                />
              </div>
              <div className="flex space-x-5">
                <div>
                  <img
                    alt="Apple iMac 1"
                    src="../../images/products/apple-imac-1.png"
                    className="h-24"
                  />
                  <a href="#" className="cursor-pointer">
                    <span className="sr-only">Delete</span>
                    <HiTrash className="-mt-5 text-2xl text-red-600" />
                  </a>
                </div>
                <div>
                  <img
                    alt="Apple iMac 2"
                    src="../../images/products/apple-imac-2.png"
                    className="h-24"
                  />
                  <a href="#" className="cursor-pointer">
                    <span className="sr-only">Delete</span>
                    <HiTrash className="-mt-5 text-2xl text-red-600" />
                  </a>
                </div>
                <div>
                  <img
                    alt="Apple iMac 3"
                    src="../../images/products/apple-imac-3.png"
                    className="h-24"
                  />
                  <a href="#" className="cursor-pointer">
                    <span className="sr-only">Delete</span>
                    <HiTrash className="-mt-5 text-2xl text-red-600" />
                  </a>
                </div>
              </div>
              <div className="lg:col-span-2">
                <div className="flex w-full items-center justify-center">
                  <label className="flex h-32 w-full cursor-pointer flex-col rounded border-2 border-dashed border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-700">
                    <div className="flex flex-col items-center justify-center pb-6 pt-5">
                      <HiUpload className="text-4xl text-gray-300" />
                      <p className="py-1 text-sm text-gray-600 dark:text-gray-500">
                        Upload a file or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                    <input type="file" className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button color="primary" onClick={() => setOpen(false)}>
            Save all
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const DeleteProductModal: FC = function () {
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 font-semibold text-white shadow-md transition-all duration-200 hover:from-red-600 hover:to-red-700 hover:shadow-lg"
      >
        <HiTrash className="text-lg" />
        Eliminar
      </button>
      <Modal onClose={() => setOpen(false)} show={isOpen} size="md">
        <Modal.Header className="px-3 pb-0 pt-3">
          <span className="sr-only">Delete product</span>
        </Modal.Header>
        <Modal.Body className="px-6 pb-6 pt-0">
          <div className="flex flex-col items-center gap-y-6 text-center">
            <HiOutlineExclamationCircle className="text-7xl text-red-600" />
            <p className="text-lg text-gray-500 dark:text-gray-300">
              Are you sure you want to delete this product?
            </p>
            <div className="flex items-center gap-x-3">
              <Button color="failure" onClick={() => setOpen(false)}>
                Yes, I'm sure
              </Button>
              <Button color="gray" onClick={() => setOpen(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

const ProductsTable: FC = function () {
  const [allProducts, setAllProducts] = useState<Product[]>([]); // Todos los productos desde la API
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]); // Productos filtrados para mostrar
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [searchQuery, setSearchQuery] = useState(""); // Término de búsqueda
  const [sortBy, setSortBy] = useState<"name" | "stock" | "internal_sku">(
    "name",
  ); // Ordenar por 'name', 'stock' o 'sku'
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // Orden ascendente o descendente
  const itemsPerPage = 6; // Productos por página
  const hasFetched = useRef(false);

  const fetchProducts = async () => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    try {
      const response = await fetch("http://localhost:3000/products");
      const data = await response.json();
      setAllProducts(data);
      setFilteredProducts(data); // Inicialmente, los filtrados son todos los productos
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Actualizar los productos filtrados al cambiar el término de búsqueda
  useEffect(() => {
    const filtered = allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.internal_sku
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        product.category.platform_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
    );
    setFilteredProducts(filtered);
    setCurrentPage(1); // Reinicia la paginación al realizar una búsqueda
  }, [searchQuery, allProducts]);

  // Función para ordenar productos
  const sortProducts = (products: Product[]) => {
    return [...products].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "stock":
          aValue = a.stock;
          bValue = b.stock;
          break;
        case "internal_sku":
          aValue = a.internal_sku.toLowerCase();
          bValue = b.internal_sku.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  };

  // Calcular los productos que se deben mostrar en la página actual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = sortProducts(filteredProducts).slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  //const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (field: "name" | "stock" | "internal_sku") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc"); // Cambia el orden si ya está ordenando por el mismo campo
    } else {
      setSortBy(field);
      setSortOrder("asc"); // Si cambias el campo, el orden por defecto será ascendente
    }
  };

  return (
    <div className="relative overflow-y-auto rounded-2xl bg-white p-6 dark:bg-gray-900">
      {/* Barra de búsqueda mejorada con tema premium */}
      <div className="mb-6 flex flex-col items-center justify-between gap-4 rounded-xl border border-[#d4a574]/20 bg-gradient-to-r from-[#f5f5f5] to-[#fafafa] p-4 dark:from-gray-800 dark:to-gray-800 sm:flex-row">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Buscar productos, SKU o categoría..."
            className="w-full rounded-lg border-2 border-[#d4a574]/40 p-3 pl-10 transition-all focus:border-[#d4a574] focus:ring-2 focus:ring-[#d4a574]/30 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <svg
            className="absolute left-3 top-3.5 size-5 text-[#d4a574]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <div className="flex w-full items-center sm:w-auto sm:justify-end">
          <AddProductModal />
        </div>
      </div>

      <Table className="min-w-full divide-y divide-[#d4a574]/20">
        <Table.Head className="bg-gradient-to-r from-[#1a1a1a] via-[#2d2020] to-[#1a1a1a]">
          <Table.HeadCell
            onClick={() => handleSortChange("name")}
            className="cursor-pointer font-bold text-[#f5d7a1] transition-colors hover:text-[#d4a574]"
          >
            <div className="flex items-center gap-2">
              Nombre del Producto
              {sortBy === "name" && (
                <span className="text-[#d4a574]">
                  {sortOrder === "asc" ? "↑" : "↓"}
                </span>
              )}
            </div>
          </Table.HeadCell>
          <Table.HeadCell
            onClick={() => handleSortChange("stock")}
            className="cursor-pointer font-bold text-[#f5d7a1] transition-colors hover:text-[#d4a574]"
          >
            <div className="flex items-center gap-2">
              Stock
              {sortBy === "stock" && (
                <span className="text-[#d4a574]">
                  {sortOrder === "asc" ? "↑" : "↓"}
                </span>
              )}
            </div>
          </Table.HeadCell>
          <Table.HeadCell
            onClick={() => handleSortChange("internal_sku")}
            className="cursor-pointer font-bold text-[#f5d7a1] transition-colors hover:text-[#d4a574]"
          >
            <div className="flex items-center gap-2">
              SKU
              {sortBy === "internal_sku" && (
                <span className="text-[#d4a574]">
                  {sortOrder === "asc" ? "↑" : "↓"}
                </span>
              )}
            </div>
          </Table.HeadCell>
          <Table.HeadCell className="font-bold text-[#f5d7a1]">
            SKU Secundario
          </Table.HeadCell>
          <Table.HeadCell className="font-bold text-[#f5d7a1]">
            Link
          </Table.HeadCell>
          <Table.HeadCell className="font-bold text-[#f5d7a1]">
            Acciones
          </Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y divide-[#d4a574]/10 bg-white dark:divide-gray-700 dark:bg-gray-800">
          {currentProducts.length > 0 ? (
            currentProducts.map((product: Product) => (
              <Table.Row
                key={product.product_id}
                className="border-l-4 border-l-transparent transition-all duration-200 hover:border-l-[#d4a574] hover:bg-gradient-to-r hover:from-[#f5f5f5] hover:to-[#fafafa] dark:hover:bg-gray-700"
              >
                <Table.Cell className="whitespace-nowrap p-4 text-sm font-normal">
                  <div
                    className="truncate text-base font-bold text-gray-900 dark:text-white"
                    title={product.name}
                  >
                    {product.name.length > 60
                      ? `${product.name.substring(0, 60)}...`
                      : product.name}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm font-medium text-[#a0896f] dark:text-gray-400">
                    <span className="inline-block size-2 rounded-full bg-[#d4a574]"></span>
                    Categoría: {product.category.platform_name}
                  </div>
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap p-4">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${
                      product.stock > 10
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : product.stock > 5
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                    }`}
                  >
                    {product.stock}
                  </span>
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap p-4">
                  <span className="rounded bg-gray-100 px-3 py-1 font-mono text-sm font-semibold text-gray-900 dark:bg-gray-700 dark:text-white">
                    {product.internal_sku}
                  </span>
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {product.secondarySkus.length > 0 ? (
                    product.secondarySkus.map((sku) => (
                      <div
                        key={sku.secondary_sku_id}
                        className="mb-1 rounded bg-gray-50 px-2 py-1 font-mono text-xs dark:bg-gray-800"
                      >
                        {sku.secondary_sku}
                      </div>
                    ))
                  ) : (
                    <span className="italic text-gray-400">N/A</span>
                  )}
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap p-4 text-sm">
                  {product.secondarySkus.length > 0 ? (
                    product.secondarySkus.map((sku) => (
                      <div key={sku.secondary_sku_id} className="mb-1">
                        <a
                          href={sku.publication_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-[#d4a574] transition-colors hover:text-[#b8935e] hover:underline"
                        >
                          <svg
                            className="size-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                          Ver publicación
                        </a>
                      </div>
                    ))
                  ) : (
                    <span className="italic text-gray-400">N/A</span>
                  )}
                </Table.Cell>
                <Table.Cell className="space-x-2 whitespace-nowrap p-4">
                  <div className="flex items-center gap-x-3">
                    <EditProductModal />
                    <DeleteProductModal />
                  </div>
                </Table.Cell>
              </Table.Row>
            ))
          ) : (
            <Table.Row>
              <Table.Cell
                colSpan={6}
                className="py-6 text-center text-gray-500 dark:text-gray-400"
              >
                No products found.
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>

      {/* Paginación */}
      <Pagination
        totalItems={filteredProducts.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default EcommerceProductsPage;
