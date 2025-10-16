// src/components/IndustryOptions.js
export const customStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: "50px",
    height: "50px",
    borderRadius: "0.5rem",
    borderColor: state.isFocused ? "#9333EA" : "#D1D5DB",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(147, 51, 234, 0.5)" : "none",
    "&:hover": {
      borderColor: state.isFocused ? "#9333EA" : "#9CA3AF",
    },
  }),
  input: (provided) => ({
    ...provided,
    margin: "0px",
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    height: "50px",
  }),
};

export const industryOptions = [
  { value: "Agriculture", label: "Agriculture" },
  { value: "Arts & Entertainment", label: "Arts & Entertainment" },
  { value: "Automotive", label: "Automotive" },
  { value: "Beauty & Wellness", label: "Beauty & Wellness" },
  { value: "Business Services", label: "Business Services" },
  { value: "Construction & Engineering", label: "Construction & Engineering" },
  { value: "Consulting", label: "Consulting" },
  { value: "Education", label: "Education" },
  { value: "Fashion", label: "Fashion" },
  { value: "Finance & Accounting", label: "Finance & Accounting" },
  { value: "Food & Beverage", label: "Food & Beverage" },
  { value: "Healthcare & Medical", label: "Healthcare & Medical" },
  { value: "Home Services", label: "Home Services" },
  { value: "IT & Technology", label: "IT & Technology" },
  { value: "Legal Services", label: "Legal Services" },
  { value: "Logistics & Transportation", label: "Logistics & Transportation" },
  { value: "Manufacturing", label: "Manufacturing" },
  { value: "Marketing & Advertising", label: "Marketing & Advertising" },
  { value: "Media & Communications", label: "Media & Communications" },
  { value: "Photography", label: "Photography" },
  { value: "Professional Services", label: "Professional Services" },
  { value: "Real Estate", label: "Real Estate" },
  { value: "Retail", label: "Retail" },
  { value: "Software & SaaS", label: "Software & SaaS" },
  { value: "Travel & Hospitality", label: "Travel & Hospitality" },
  { value: "Writing & Editing", label: "Writing & Editing" },
  { value: "Other", label: "Other" },
];
