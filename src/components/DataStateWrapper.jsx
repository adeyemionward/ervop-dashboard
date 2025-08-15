import { LoaderCircle } from 'lucide-react';

const DataStateWrapper = ({ loading, error, children }) => {
  if (loading) {
    return (
      <div className="text-center py-8 flex items-center justify-center w-full">
        <LoaderCircle className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-3 text-gray-600">Loading Data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600 w-full font-bold">
        Error Occured: {error}
      </div>
    );
  }

  return children;
};

export default DataStateWrapper;