
import { Icons } from "@/components/icons";

const ActionTableCard = () => (
    <td className="px-6 py-4 text-right relative">
        <button className="p-2 rounded-full hover:bg-gray-200">
            <Icons.actionLine />
        </button>
        {/* <!-- Dropdown Menu (example shown open) --> */}
        <div className="absolute right-8 top-12 w-40 bg-white rounded-md shadow-lg z-10 ring-1 ring-black ring-opacity-5">
            <div className="py-1">
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">View</a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Edit</a>
                <a href="#" className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Delete</a>
            </div>
        </div>
    </td>
)

export default ActionTableCard;