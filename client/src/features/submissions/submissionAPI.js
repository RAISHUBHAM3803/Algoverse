import api from "../../api/axios";
import { getToken } from "../../utils/tokenStorage";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5008/api/v1";

/**
 * Step 1: Submit code — server enqueues it and returns a jobId immediately.
 */
export const submitCodeAPI = async (submissionData) => {
  const response = await api.post("/submissions", submissionData);
  return response.data;
};

/**
 * Step 2: Open SSE stream for a jobId.
 * Returns a Promise that resolves with the final submission result
 * when the server pushes the completion event.
 */
export const streamSubmissionAPI = (jobId) => {
  return new Promise((resolve, reject) => {
    const token = getToken();
    const url = `${API_BASE_URL}/submissions/stream/${jobId}?token=${token}`;
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Ignore the initial "connected" handshake event
        if (data.status === "connected") return;
        eventSource.close();
        if (data.success === false) {
          reject(new Error(data.error || "Submission failed"));
        } else {
          resolve(data);
        }
      } catch (err) {
        eventSource.close();
        reject(err);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      reject(new Error("SSE connection error. Please try again."));
    };
  });
};

export const getMySubmissionsAPI = async (params) => {
  const response = await api.get("/submissions/my", { params });
  return response.data;
};

export const getSubmissionByIdAPI = async (id) => {
  const response = await api.get(`/submissions/${id}`);
  return response.data;
};
