import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

interface PaginationProps {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
    totalItems,
    itemsPerPage,
    currentPage,
    onPageChange,
}) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
        <div className= "sticky bottom-0 right-0 w-full items-center border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:flex sm:justify-between" >
        <div className="mb-4 flex items-center sm:mb-0" >
            <button
          onClick={ () => onPageChange(currentPage - 1) }
    disabled = { currentPage === 1
}
className = "inline-flex cursor-pointer justify-center rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50"
    >
    <span className="sr-only" > Previous page </span>
        < HiChevronLeft className = "text-2xl" />
            </button>
            < span className = "text-sm font-normal text-gray-500 dark:text-gray-400" >
                Showing &nbsp;
<span className="font-semibold text-gray-900 dark:text-white" >
    {(currentPage - 1) * itemsPerPage + 1}-{ Math.min(currentPage * itemsPerPage, totalItems) }
        </span>
        &nbsp; of &nbsp;
<span className="font-semibold text-gray-900 dark:text-white" >
    { totalItems }
    </span>
    </span>
    < button
onClick = {() => onPageChange(currentPage + 1)}
disabled = { currentPage === totalPages}
className = "inline-flex cursor-pointer justify-center rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50"
    >
    <span className="sr-only" > Next page </span>
        < HiChevronRight className = "text-2xl" />
            </button>
            </div>
            < div className = "flex items-center space-x-3" >
                <button
          onClick={ () => onPageChange(currentPage - 1) }
disabled = { currentPage === 1}
className = "inline-flex flex-1 items-center justify-center rounded-lg bg-primary-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 disabled:opacity-50"
    >
    <HiChevronLeft className="mr-1 text-base" />
        Previous
        </button>
        < button
onClick = {() => onPageChange(currentPage + 1)}
disabled = { currentPage === totalPages}
className = "inline-flex flex-1 items-center justify-center rounded-lg bg-primary-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 disabled:opacity-50"
    >
    Next
    < HiChevronRight className = "ml-1 text-base" />
        </button>
        </div>
        </div>
  );
};

export default Pagination;
