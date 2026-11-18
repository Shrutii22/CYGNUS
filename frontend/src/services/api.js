
import axios from "axios";

const paths = {
  chat: import.meta.env.VITE_CHAT_ENDPOINT || "/chat",
  tasks: import.meta.env.VITE_TASKS_ENDPOINT || "/tasks",
  health: import.meta.env.VITE_HEALTH_ENDPOINT || "/health"
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 60000
});

const data = (r) => r?.data?.data ?? r?.data ?? r;

// ================= CHAT SERVICE =================

export const chatService = {
  async createConversation(title) {
    const d = data(
      await api.post("/conversations", { title })
    );

    const conversationId = d?.id ?? d?.conversationId;

    if (conversationId == null) {
      throw new Error("Conversation created, but no ID was returned.");
    }

    return conversationId;
  },

  async send(message, conversationId) {
    if (conversationId == null) {
      conversationId = await this.createConversation(
        message.slice(0, 60)
      );
    }

    const d = data(
      await api.post(
        `/conversations/${conversationId}/chat`,
        { message }
      )
    );

    const reply =
      d?.reply ??
      d?.response ??
      d?.content ??
      d?.message ??
      d?.text ??
      (typeof d === "string" ? d : null);

    if (!reply) {
      throw new Error("Chat response has no recognized reply field.");
    }

    return {
      reply: String(reply),
      conversationId,
      type: d?.type ?? "CHAT",
      action: d?.action ?? null,
      application: d?.application ?? null,
      url: d?.url ?? null,
      fileName: d?.fileName ?? null,
      content: d?.content ?? null,
      projectName: d?.projectName ?? null,
      files: d?.files ?? null,
      to: d?.to ?? null,
      subject: d?.subject ?? null,
      bodyText: d?.bodyText ?? null,
      recipientName: d?.recipientName ?? null,
      phoneNumber: d?.phoneNumber ?? null,
      messageText: d?.messageText ?? null
    };
  }
};

// ================= TASK SERVICE =================

const norm = (t) => ({
  id: t.id ?? t.taskId ?? t._id,
  title: t.title ?? t.name ?? "Untitled task",
  description: t.description ?? "",
  completed: Boolean(
    t.completed ??
    String(t.status || "").toLowerCase() === "completed"
  ),
  dueDate: t.dueDate ?? t.deadline ?? null,
  raw: t
});

export const taskService = {
  async list() {
    const d = data(await api.get(paths.tasks));
    return (
      Array.isArray(d) ? d : d?.tasks ?? d?.content ?? []
    ).map(norm);
  },

  async create(t) {
    return norm(data(await api.post(paths.tasks, t)));
  },

  async update(id, t) {
    return norm(data(await api.put(`${paths.tasks}/${id}`, t)));
  },

  async remove(id) {
    await api.delete(`${paths.tasks}/${id}`);
  }
};

// ================= GMAIL SERVICE =================

export const gmailService = {
  async sendEmail(to, subject, bodyText) {
    const response = await api.post("/gmail/send", {
      to,
      subject,
      bodyText
    });

    return data(response);
  }
};

// ================= NOTE SERVICE =================

export const noteService = {
  async list() {
    const d = data(await api.get("/notes"));
    return Array.isArray(d) ? d : d?.notes ?? [];
  },

  async get(id) {
    return data(await api.get(`/notes/${id}`));
  },

  async create(note) {
    return data(await api.post("/notes", note));
  },

  async update(id, note) {
    return data(await api.put(`/notes/${id}`, note));
  },

  async remove(id) {
    await api.delete(`/notes/${id}`);
  },

  async search(keyword) {
    const d = data(
      await api.get("/notes/search", {
        params: { keyword }
      })
    );

    return Array.isArray(d) ? d : d?.notes ?? [];
  }
  
};
// ================= DOCUMENT SERVICE =================

export const documentService = {
  async list() {
    const d = data(await api.get("/documents"));

    return Array.isArray(d)
      ? d
      : d?.documents ?? [];
  },

  async upload(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/documents", formData, {
      headers: {
        "Content-Type": undefined
      }
    });

    return data(response);
  },
async getText(id) {
  const d = data(await api.get(`/documents/${id}/text`));
  return d?.text ?? "";
}

};