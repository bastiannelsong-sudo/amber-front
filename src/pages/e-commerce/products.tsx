/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  Breadcrumb,
  Button,
  Label,
  Modal,
  Table,
  Textarea,
  TextInput,
} from "flowbite-react";
import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import { FaPlus } from "react-icons/fa";
import {
  HiCog,
  HiDotsVertical,
  HiExclamationCircle,
  HiHome,
  HiOutlineExclamationCircle,
  HiPencilAlt,
  HiTrash,
  HiUpload,
} from "react-icons/hi";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import { Product } from "../../types/Products";
import Pagination from "../../util/Pagination";

const EcommerceProductsPage: FC = function () {



  
  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="block items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:flex">
        <div className="mb-1 w-full">
          <div className="">
            <Breadcrumb className="mb-4">
              <Breadcrumb.Item href="#">
                <div className="flex items-center gap-x-3">
                  <HiHome className="text-xl" />
                  <span className="dark:text-white">Home</span>
                </div>
              </Breadcrumb.Item>
              <Breadcrumb.Item href="/e-commerce/products">
                E-commerce
              </Breadcrumb.Item>
              <Breadcrumb.Item>Products</Breadcrumb.Item>
            </Breadcrumb>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              All products
            </h1>
          </div>
          
          </div>
        </div>
   
      <div className="flex flex-col">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow">
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

  return (
    <>
      <Button color="primary" onClick={() => setOpen(!isOpen)}>
        <FaPlus className="mr-3 text-sm" />
        Add product
      </Button>
      <Modal onClose={() => setOpen(false)} show={isOpen}>
        <Modal.Header className="border-b border-gray-200 !p-6 dark:border-gray-700">
          <strong>Add product</strong>
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
                <Label htmlFor="producTable.Celletails">Product details</Label>
                <Textarea
                  id="producTable.Celletails"
                  name="producTable.Celletails"
                  placeholder="e.g. 3.8GHz 8-core 10th-generation Intel Core i7 processor, Turbo Boost up to 5.0GHz, Ram 16 GB DDR4 2300Mhz"
                  rows={6}
                  className="mt-1"
                />
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
            Add product
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const EditProductModal: FC = function () {
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <Button color="primary" onClick={() => setOpen(!isOpen)}>
        <HiPencilAlt className="mr-2 text-lg" />
        Edit item
      </Button>
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
      <Button color="failure" onClick={() => setOpen(!isOpen)}>
        <HiTrash className="mr-2 text-lg" />
        Delete item
      </Button>
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
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'internal_sku'>('name'); // Ordenar por 'name', 'stock' o 'sku'
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // Orden ascendente o descendente
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
    const filtered = allProducts.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.internal_sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.platform_name.toLowerCase().includes(searchQuery.toLowerCase()) 
    );
    setFilteredProducts(filtered);
    setCurrentPage(1); // Reinicia la paginación al realizar una búsqueda
  }, [searchQuery, allProducts]);

  // Función para ordenar productos
  const sortProducts = (products: Product[]) => {
    return [...products].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'stock':
          aValue = a.stock;
          bValue = b.stock;
          break;
        case 'internal_sku':
          aValue = a.internal_sku.toLowerCase();
          bValue = b.internal_sku.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Calcular los productos que se deben mostrar en la página actual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = sortProducts(filteredProducts).slice(startIndex, startIndex + itemsPerPage);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (field: 'name' | 'stock' | 'internal_sku') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); // Cambia el orden si ya está ordenando por el mismo campo
    } else {
      setSortBy(field);
      setSortOrder('asc'); // Si cambias el campo, el orden por defecto será ascendente
    }
  };

  return (
    <div className="relative p-5 overflow-y-auto rounded-lg shadow-md">
      {/* Barra de búsqueda */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Buscar productos..."
          className="w-full max-w-md p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />
        <div className="flex w-full items-center sm:justify-end">
          <AddProductModal />
        </div>
      </div>

      <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
        <Table.Head className="bg-gray-100 dark:bg-gray-700">
          <Table.HeadCell onClick={() => handleSortChange('name')} className="cursor-pointer">
            Nombre del Producto
            {sortBy === 'name' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
          </Table.HeadCell>
          <Table.HeadCell onClick={() => handleSortChange('stock')} className="cursor-pointer">
            Stock
            {sortBy === 'stock' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
          </Table.HeadCell>
          <Table.HeadCell onClick={() => handleSortChange('internal_sku')} className="cursor-pointer">
            SKU
            {sortBy === 'internal_sku' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
          </Table.HeadCell>
          <Table.HeadCell>SKU Secundario</Table.HeadCell>
          <Table.HeadCell>Link</Table.HeadCell>
          <Table.HeadCell>Acciones</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
          {currentProducts.length > 0 ? (
            currentProducts.map((product: Product) => (
              <Table.Row
                key={product.product_id}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Table.Cell className="whitespace-nowrap p-4 text-sm font-normal text-gray-500 dark:text-gray-400">
                  <div
                    className="text-base font-semibold text-gray-900 dark:text-white truncate"
                    title={product.name}
                  >
                    {product.name.length > 60
                      ? `${product.name.substring(0, 60)}...`
                      : product.name}
                  </div>
                  <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    Categoria: {product.category.platform_name}
                  </div>
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap p-4 text-base font-medium text-gray-900 dark:text-white">
                  {product.stock}
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap p-4 text-base font-medium text-gray-900 dark:text-white">
                  {product.internal_sku}
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap p-4 text-base font-medium text-gray-900 dark:text-white">
                  {product.secondarySkus.length > 0
                    ? product.secondarySkus.map((sku) => (
                        <div key={sku.secondary_sku_id}>{sku.secondary_sku}</div>
                      ))
                    : "N/A"}
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap p-4 text-base font-medium text-gray-900 dark:text-white">
                  {product.secondarySkus.length > 0
                    ? product.secondarySkus.map((sku) => (
                        <div key={sku.secondary_sku_id}>
                          <a
                            href={sku.publication_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            Ver publicación
                          </a>
                        </div>
                      ))
                    : "N/A"}
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
                className="text-center py-6 text-gray-500 dark:text-gray-400"
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
