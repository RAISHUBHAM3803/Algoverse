import api from "../../api/axios";

export const getAIHintsAPI = async (hintData) => {
  const response = await api.post("/ai/hint", hintData);
  return response.data;
};

export const getInterviewFeedbackAPI = async (feedbackData) => {
  const response = await api.post("/ai/interview-feedback", feedbackData);
  return response.data;
};
