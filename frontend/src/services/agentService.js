
import axios from "axios";

const agentApi = axios.create({
    baseURL: "http://127.0.0.1:8765",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json"
    }
});

export const agentService = {

    async openApplication(application) {

        const token = import.meta.env.VITE_AGENT_TOKEN;

        if (!token) {
            throw new Error("Local agent token is not configured.");
        }

        const response = await agentApi.post(
            "/agent/open",
            { application },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data;
    },

async openWebsite(url) {
    const token = import.meta.env.VITE_AGENT_TOKEN;

    if (!token) {
        throw new Error("Local agent token is not configured.");
    }

    const response = await agentApi.post(
        "/agent/website",
        { url },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
}
,
async createTextFile(fileName, content) {

    const token = import.meta.env.VITE_AGENT_TOKEN;

    if (!token) {
        throw new Error("Local agent token is not configured.");
    }

    const response = await agentApi.post(
        "/agent/create-file",
        { fileName, content },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
},

async createProject(projectName, files) {

    const token = import.meta.env.VITE_AGENT_TOKEN;

    if (!token) {
        throw new Error("Local agent token is not configured.");
    }

    const response = await agentApi.post(
        "/agent/create-project",
        { projectName, files },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
}
,


async sendWhatsAppMessage(
    requestId,
    recipientName,
    phoneNumber,
    messageText
) {
    const token = import.meta.env.VITE_AGENT_TOKEN;

    if (!token) {
        throw new Error("Local agent token is not configured.");
    }

    const response = await agentApi.post(
        "/agent/whatsapp/send",
        {
            requestId,
            recipientName,
            phoneNumber,
            messageText
        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            },
            timeout: 60000
        }
    );

    return response.data;
}

};


