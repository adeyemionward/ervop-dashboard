// utils/downloadFile.ts

// Helper to extract file name from path
export const fileNameFromPath = (url: string): string => {
  try {
    return url.split("/").pop() || "download";
  } catch {
    return "download";
  }
};

// Programmatic download function
export const downloadFile = (filePath: string) => {
  try {
    // Create a temporary <a> element
    const link = document.createElement("a");

    // Use the path directly (already absolute, e.g. http://localhost:8000/business_docs/...)
    link.href = filePath;

    // Extract filename from path
    const fileName = filePath.split("/").pop() || "document";
    link.download = fileName;

    // Force browser to treat as a download
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    // Append to DOM, click, then remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Download error:", error);
    alert("Failed to download file. Please try again.");
  }
};

