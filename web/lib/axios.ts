import axios from "axios";

const backend_api = process.env.BACKEND_URL || "http://localhost:8000/api";

export const api = axios.create({
    baseURL: backend_api,
    headers: {
        "Content-Type": "application/json"
    }
});