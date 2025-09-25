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
export const downloadFile = (url: string) => {
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.download = fileNameFromPath(url);
  document.body.appendChild(a);
  a.click();
  a.remove();
};
