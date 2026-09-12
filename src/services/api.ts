export const API_BASE_URL = "/api";

export const analyzeComplaint = async (text: string, file: File | null = null) => {
  const formData = new FormData();
  if (file) {
    formData.append("file", file);
  } else if (text) {
    formData.append("text", text);
  }

  const response = await fetch(`${API_BASE_URL}/complaints/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to analyze complaint");
  }

  return response.json();
};

export const saveComplaint = async (complaintData: any) => {
  const response = await fetch(`${API_BASE_URL}/complaints`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(complaintData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to save complaint");
  }

  return response.json();
};

export const getComplaints = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/complaints`, {
      headers: {
        'Accept': 'application/json',
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch complaints: ${response.statusText}`);
    }
    return await response.json();
  } catch (error: any) {
    console.error("API Error (getComplaints):", error);
    throw error;
  }
};
