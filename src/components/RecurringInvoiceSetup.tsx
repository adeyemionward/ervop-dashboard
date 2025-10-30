// --- New Component: RecurringInvoiceSetup ---
// Reusable Tailwind Input Component
import {RotateCw } from "lucide-react"; 
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-purple-500 focus:border-purple-500"
  />
);

// Reusable Tailwind Select Component
const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className="w-full border border-gray-300 rounded-lg px-4 py-2 appearance-none bg-white pr-8 focus:ring-purple-500 focus:border-purple-500"
  />
);

export const RecurringInvoiceSetup = ({
  isRecurring,
  setIsRecurring,
  repeats,
  setRepeats,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: {
  isRecurring: boolean;
  setIsRecurring: React.Dispatch<React.SetStateAction<boolean>>;
  repeats: string;
  setRepeats: React.Dispatch<React.SetStateAction<string>>;
  startDate: string;
  setStartDate: React.Dispatch<React.SetStateAction<string>>;
  endDate: string;
  setEndDate: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const handleToggle = () => setIsRecurring(!isRecurring);

  const repeatOptions = [
  { label: "Weekly (Every Monday)", value: "weekly" },
  { label: "Monthly (First day of each month)", value: "monthly" },
];

  return (
    <div className="border border-gray-200 p-6 rounded-xl shadow-sm space-y-4">
      {/* Toggle and Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <RotateCw className="w-5 h-5 text-gray-500" />
          <div>
            <p className="font-semibold text-gray-900">Make recurring</p>
            <p className="text-sm text-gray-500">Set up recurring invoice</p>
          </div>
        </div>
        {/* Toggle Switch (using standard Tailwind/Headless UI structure) */}
        <button
          type="button"
          onClick={handleToggle}
          className={`${
            isRecurring ? 'bg-purple-600' : 'bg-gray-200'
          } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
          role="switch"
          aria-checked={isRecurring}
        >
          <span className="sr-only">Enable recurring</span>
          <span
            className={`${
              isRecurring ? 'translate-x-5' : 'translate-x-0'
            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
          />
        </button>
      </div>

        {/* Recurrence Setup Fields (3-Column Layout) */}
          {isRecurring && (
            <div className="space-y-6 pt-4 border-t border-gray-100">
              {/* Summary Text: Displays the full selection */}
              <div className="text-sm text-gray-500 mb-4">
                   Invoice will repeat:{""}
                    <span className="font-semibold text-purple-600">
                        {
                        repeatOptions.find((option) => option.value === repeats)?.label ||
                        "Weekly (Every Monday)"
                        }
                    </span>
              </div>
              
              {/* Main Grid: Three columns for all devices (except small mobile which stacks) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Column 1: Repeats (Combined Select Field) */}
                <div className="space-y-1">
                  <label htmlFor="repeatsFrequency" className="block text-sm font-medium text-gray-700">Repeats</label>
                  <div className="relative w-full">
                    <Select
                      id="repeatsFrequency"
                      value={repeats}
                      onChange={(e) => setRepeats(e.target.value)}
                    >
                      {/* Map the simplified, descriptive options */}
                        {repeatOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                            {option.label}
                            </option>
                        ))}
                    </Select>
                    {/* Custom arrow for select */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>

                {/* Column 2: Start Date */}
                <div className="space-y-1">
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                {/* Column 3: End Date */}
                <div className="space-y-1">
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                
              </div>
            </div>
          )}
    </div>
  );
};
// --- End RecurringInvoiceSetup Component ---
