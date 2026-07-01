import api from "./axiosInstance";

export const submitApplication = (body) =>
  api.post("/applications/submit/", body, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getApplications = () =>
  api.get("/applications/");

export const getApplication = (id) =>
  api.get(`/applications/${id}/`);

export const submitWaiver = (id) =>
  api.post(`/applications/${id}/waiver/`);

export const reviewApplication = (id, body) =>
  api.post(`/applications/${id}/review/`, body);

export const getMyApplications = () =>
  api.get("/applications/mine/");

export const getQueueApplications = (status = "") =>
  api.get(`/applications/queue/?status=${status}`);

export const getFlaggedApplications = () =>
  api.get("/applications/flagged/");

export const getSchemeOverview = () =>
  api.get("/applications/schemes-overview/");

export const getApplicationsByScheme = (schemeId, status = "") =>
  api.get(`/applications/by-scheme/${schemeId}/${status ? `?status=${status}` : ""}`);

export const publishSchemeApprovals = (schemeId) =>
  api.post(`/applications/publish/${schemeId}/`);