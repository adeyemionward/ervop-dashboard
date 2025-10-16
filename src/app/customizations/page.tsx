import DashboardLayout from "@/components/DashboardLayout";
import CustomizationTabs from "@/components/customization/Tabs/CustomizationTabs";
import { Save } from "lucide-react";

export default function CustomizationPage() {
    
  return (
    <DashboardLayout>
         <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Website Customization</h1>
      <p className="mt-1 text-gray-500">Update your pages and publish changes live.</p>
    </div>
    <button
      
      className="bg-blue-600 text-white hover:bg-blue-700 font-semibold py-2 px-4 rounded-lg flex items-center transition-colors shadow-sm"
    >
      <Save className="w-4 h-4 mr-2" />
      Save & Publish
    </button>
  </header>
      <div className="max-w-5xl mx-auto py-8">
        
        <CustomizationTabs />
      </div>
    </DashboardLayout>
  );
}
