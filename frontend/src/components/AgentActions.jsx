
import { useState } from "react";
import { agentService } from "../services/agentService";

export default function AgentActions() {
    const [loading, setLoading] = useState("");
    const [message, setMessage] = useState("");

    const openApplication = async (application) => {
        setLoading(application);
        setMessage("");

        try {
            const result = await agentService.openApplication(application);

            setMessage(result.message);
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                error.message ||
                "Could not connect to CYGNUS Local Agent."
            );
        } finally {
            setLoading("");
        }
    };

    return (
        <div className="p-4 rounded-xl border border-white/10 space-y-3">
            <h3 className="font-semibold">Windows Actions</h3>

            <div className="flex flex-wrap gap-2">
                {["notepad", "calculator", "paint"].map((app) => (
                    <button
                        key={app}
                        onClick={() => openApplication(app)}
                        disabled={loading !== ""}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white
                                   hover:bg-blue-700 disabled:opacity-50
                                   capitalize"
                    >
                        {loading === app ? "Opening..." : `Open ${app}`}
                    </button>
                ))}
            </div>

            {message && (
                <p className="text-sm text-gray-500" role="status">
                    {message}
                </p>
            )}
        </div>
    );
}
