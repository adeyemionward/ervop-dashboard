type HeaderTitleCardProps = {
    onGoBack: () => void;
    title: string;
    description: string;
    children?: React.ReactNode;
};

//flex items-center justify-between 
const HeaderTitleCard = ({ onGoBack, title, description, children }: HeaderTitleCardProps) => (
    // Changes are on this line 👇
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
            <button 
                onClick={onGoBack} 
                className="cursor-pointer flex items-center text-md text-gray-500 hover:text-purple-600 mb-2 w-fit">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Go Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <p className="mt-1 text-gray-500">{description}</p>
        </div>
        {children}      
    </div>
);

export default HeaderTitleCard;

