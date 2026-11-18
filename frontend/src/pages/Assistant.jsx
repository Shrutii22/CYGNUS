
import { useEffect, useRef, useState } from "react";
import {
  CalendarCheck,
  Code2,
  Globe2,
  Lightbulb,
  RotateCcw,
  Mail
} from "lucide-react";

import Orb from "../components/Orb";
import ChatComposer from "../components/ChatComposer";
import MessageBubble from "../components/MessageBubble";
import { chatService, gmailService } from "../services/api";
import AgentActions from "../components/AgentActions";
import { agentService } from "../services/agentService";

const prompts = [
  {
    title: "Code",
    icon: Code2,
    prompt: "Help me write or debug some code."
  },
  {
    title: "Learn",
    icon: Lightbulb,
    prompt: "Explain a topic to me simply."
  },
  {
    title: "Plan",
    icon: CalendarCheck,
    prompt: "Help me plan my day."
  },
  {
    title: "Explore",
    icon: Globe2,
    prompt: "Help me brainstorm creative ideas."
  }
];

export default function Assistant() {
  const [messages, setMessages] = useState([]);
  const [state, setState] = useState("idle");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [actionBusyIndex, setActionBusyIndex] = useState(null);
  const [emailBusyIndex, setEmailBusyIndex] = useState(null);


  const conversation = useRef(null);
  const recognitionRef = useRef(null);
  const submittedVoice = useRef(false);
   
  async function executeWhatsApp(message) {
  const {
    whatsappRequestId,
    recipientName,
    phoneNumber,
    messageText
  } = message;

  if (
    !whatsappRequestId ||
    !recipientName ||
    !phoneNumber ||
    !messageText
  ) {
    setMessages((current) =>
      current.map((item) =>
        item.whatsappRequestId === whatsappRequestId
          ? {
              ...item,
              whatsappStatus: "error",
              whatsappMessage: "Missing WhatsApp recipient or message details."
            }
          : item
      )
    );
    return;
  }

  setMessages((current) =>
    current.map((item) =>
      item.whatsappRequestId === whatsappRequestId
        ? { ...item, whatsappStatus: "sending" }
        : item
    )
  );

  try {
    const result = await agentService.sendWhatsAppMessage(
      whatsappRequestId,
      recipientName,
      phoneNumber,
      messageText
    );
   console.log("WhatsApp agent response:", JSON.stringify(result, null, 2));

const success = result.message?.startsWith(
  "WhatsApp Send button clicked successfully."
);
    setMessages((current) =>
      current.map((item) =>
        item.whatsappRequestId === whatsappRequestId
          ? {
              ...item,
              whatsappStatus: success ? "success" : "error",
              whatsappMessage: result.message
            }
          : item
      )
    );
  } catch (error) {
    setMessages((current) =>
      current.map((item) =>
        item.whatsappRequestId === whatsappRequestId
          ? {
              ...item,
              whatsappStatus: "error",
              whatsappMessage:
                error.response?.data?.message ||
                error.message ||
                "WhatsApp sending failed."
            }
          : item
      )
    );
  }
}
  // Send user message to backend
  const send = async (text) => {
    if (busy || !text?.trim()) return;

    setMessages((current) => [
      ...current,
      { role: "user", content: text }
    ]);

    setBusy(true);
    setError("");
    setState("thinking");

    try {
      const result = await chatService.send(
        text,
        conversation.current
      );

      conversation.current = result.conversationId;

   
const isWhatsAppAction =
  result.type === "ACTION" &&
  result.action === "SEND_WHATSAPP";

const whatsappRequestId = isWhatsAppAction
  ? crypto.randomUUID()
  : null;

const assistantMessage = {
  role: "assistant",
content: isWhatsAppAction
  ? `WhatsApp message sent to ${result.recipientName}.`
  : result.reply,
  type: result.type,
  action: result.action,
  application: result.application,
  url: result.url,
  fileName: result.fileName,
  fileContent: result.content,
  projectName: result.projectName,
  files: result.files,
  to: result.to,
  subject: result.subject,
  bodyText: result.bodyText,
  recipientName: result.recipientName,
  phoneNumber: result.phoneNumber,
  messageText: result.messageText,

  whatsappRequestId,
  whatsappStatus: isWhatsAppAction ? "pending" : null,

  executionStatus:
    result.type === "ACTION" &&
    result.action !== "SEND_EMAIL" &&
    result.action !== "SEND_WHATSAPP"
      ? "pending"
      : null,

  emailStatus:
    result.type === "ACTION" &&
    result.action === "SEND_EMAIL"
      ? "pending"
      : null
};

setMessages((current) => [
  ...current,
  assistantMessage
]);
if (isWhatsAppAction) {
  void executeWhatsApp(assistantMessage);
}

      setState("speaking");
      setTimeout(() => setState("idle"), 1800);

    } catch (e) {
      setError(
        e.response?.data?.message ||
        e.message ||
        "Could not reach the backend."
      );

      setState("idle");

    } finally {
      setBusy(false);
    }
  };

  // Execute confirmed action through Java local agent
  const confirmAction = async (index) => {
    const message = messages[index];

    if (
      !message ||
      message.type !== "ACTION" ||
      ![
        "OPEN_APPLICATION",
        "OPEN_WEBSITE",
        "CREATE_TEXT_FILE",
        "CREATE_PROJECT"
      ].includes(message.action)
    ) {
      return;
    }

    setActionBusyIndex(index);

    try {
      let result;

      if (message.action === "OPEN_APPLICATION") {
        result = await agentService.openApplication(
          message.application
        );

      } else if (message.action === "OPEN_WEBSITE") {
        result = await agentService.openWebsite(
          message.url
        );

      } else if (message.action === "CREATE_TEXT_FILE") {
        result = await agentService.createTextFile(
          message.fileName,
          message.fileContent
        );

      } else if (message.action === "CREATE_PROJECT") {
        result = await agentService.createProject(
          message.projectName,
          message.files
        );
      }

      if (!result || result.status !== "SUCCESS") {
        throw new Error(result?.message || "Action failed.");
      }

      setMessages((current) =>
        current.map((item, i) =>
          i === index
            ? {
                ...item,
                executionStatus: "success",
                executionMessage: result.message
              }
            : item
        )
      );

    } catch (error) {
      setMessages((current) =>
        current.map((item, i) =>
          i === index
            ? {
                ...item,
                executionStatus: "error",
                executionMessage:
                  error.response?.data?.message ||
                  error.message ||
                  "Could not connect to the local agent."
              }
            : item
        )
      );

    } finally {
      setActionBusyIndex(null);
    }
  };

  // Send email after explicit user confirmation
  const confirmEmail = async (index) => {
    const message = messages[index];

    if (
      !message ||
      message.type !== "ACTION" ||
      message.action !== "SEND_EMAIL" ||
      message.emailStatus !== "pending"
    ) {
      return;
    }

    setEmailBusyIndex(index);

    try {
      const result = await gmailService.sendEmail(
        message.to,
        message.subject,
        message.bodyText
      );

      if (result.status !== "SUCCESS") {
        throw new Error(result.message || "Email sending failed.");
      }

      setMessages((current) =>
        current.map((item, i) =>
          i === index
            ? {
                ...item,
                emailStatus: "success",
                emailMessage: result.message
              }
            : item
        )
      );

    } catch (error) {
      setMessages((current) =>
        current.map((item, i) =>
          i === index
            ? {
                ...item,
                emailStatus: "error",
                emailMessage:
                  error.response?.data?.message ||
                  error.message ||
                  "Could not send email."
              }
            : item
        )
      );

    } finally {
      setEmailBusyIndex(null);
    }
  };

  // Cancel email draft
  const cancelEmail = (index) => {
    setMessages((current) =>
      current.map((item, i) =>
        i === index
          ? { ...item, emailStatus: "cancelled" }
          : item
      )
    );
  };

  // Cancel pending action
  const cancelAction = (index) => {
    setMessages((current) =>
      current.map((item, i) =>
        i === index
          ? { ...item, executionStatus: "cancelled" }
          : item
      )
    );
  };

  // Voice input
  const toggleVoice = () => {
    if (busy) return;

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setState("idle");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Voice input is not supported by this browser. Try Chrome or Edge."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    submittedVoice.current = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setError("");
      setState("listening");
    };

    recognition.onresult = (event) => {
      const transcript =
        event.results[0][0].transcript.trim();

      if (transcript) {
        submittedVoice.current = true;
        recognitionRef.current = null;
        send(transcript);
      }
    };

    recognition.onerror = (event) => {
      recognitionRef.current = null;
      setState("idle");

      if (
        event.error !== "no-speech" &&
        event.error !== "aborted"
      ) {
        setError("Microphone error: " + event.error);
      }
    };

    recognition.onend = () => {
      recognitionRef.current = null;

      if (!submittedVoice.current) {
        setState("idle");
      }
    };

    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setState("idle");
      setError("Could not start voice input. Please try again.");
    }
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  // Reset conversation
  const reset = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;

    setMessages([]);
    conversation.current = null;
    setError("");
    setState("idle");
    setBusy(false);
    setActionBusyIndex(null);
    setEmailBusyIndex(null);
  };

  const voiceLabel = {
    idle: "TAP TO SPEAK",
    listening: "LISTENING...",
    thinking: "THINKING...",
    speaking: "RESPONDING..."
  }[state] || "TAP TO SPEAK";

  return (
    <section className="assistant-page">

      {messages.length === 0 ? (

        /* WELCOME SCREEN */
        <main className="welcome-layout">

          <div className="orb-reserve">
            <Orb
              state={state}
              onClick={toggleVoice}
            />
          </div>

          <div
            className={`voice-status voice-status-${state}`}
            aria-live="polite"
          >
            <span className="voice-status-indicator" />
            {voiceLabel}
          </div>

          <div className="welcome-content">

            <h1>What can I help you with?</h1>

            <p className="welcome-description">
              Ask questions, explore ideas, write code,
              or organize your day with CYGNUS.
            </p>

            {/* QUICK PROMPTS */}
            <div className="suggestions">
              {prompts.map(({ title, icon: Icon, prompt }) => (
                <button
                  type="button"
                  className="suggestion"
                  key={title}
                  onClick={() => send(prompt)}
                  disabled={busy}
                >
                  <span className="suggestion-icon">
                    <Icon size={17} />
                  </span>

                  <span className="suggestion-title">
                    {title}
                  </span>
                </button>
              ))}
            </div>

          </div>

          <AgentActions />

          {/* COMPOSER */}
          <div className="welcome-compose">
            <ChatComposer
              onSend={send}
              disabled={busy}
            />

            <p className="composer-disclaimer">
              CYGNUS can make mistakes. Verify important information.
            </p>
          </div>

        </main>

      ) : (

        /* CONVERSATION SCREEN */
        <main className="conversation-layout">

          <header className="conversation-head">
            <div className="conversation-title">
              <span className="conversation-status-dot" />
              <b>Conversation</b>
            </div>

            <button
              type="button"
              className="new-chat-button"
              onClick={reset}
            >
              <RotateCcw size={14} />
              <span>New chat</span>
            </button>
          </header>

          {/* MESSAGES */}
          <div className="messages">

            {messages.map((message, index) => (
              <div key={index} className="space-y-3">

                <MessageBubble {...message} />

                {/* ACTION CONFIRMATION CARD */}
                {message.type === "ACTION" &&
                  [
                    "OPEN_APPLICATION",
                    "OPEN_WEBSITE",
                    "CREATE_TEXT_FILE",
                    "CREATE_PROJECT"
                  ].includes(message.action) && (

                    <div className="ml-4 max-w-sm rounded-xl border border-white/10 p-4 space-y-3">

                      {message.executionStatus === "pending" && (
                        <>

                          {/* CONFIRMATION MESSAGE */}
                          <div className="text-sm">

                            {message.action === "OPEN_APPLICATION" ? (
                              <>
                                Do you want CYGNUS to open{" "}
                                <strong className="capitalize">
                                  {message.application}
                                </strong>
                                ?
                              </>

                            ) : message.action === "OPEN_WEBSITE" ? (
                              <>
                                Do you want CYGNUS to open this website in Chrome?

                                <strong className="block mt-2 break-all">
                                  {message.url}
                                </strong>
                              </>

                            ) : message.action === "CREATE_TEXT_FILE" ? (
                              <>
                                Do you want CYGNUS to create this text file?

                                <strong className="block mt-2">
                                  Filename: {message.fileName}
                                </strong>

                                <span className="block mt-2 text-gray-400">
                                  Content:
                                </span>

                                <span className="block mt-1 break-all whitespace-pre-wrap">
                                  {message.fileContent || "(Empty file)"}
                                </span>
                              </>
                            ) : (
                              
                              <>
                                Do you want CYGNUS to create this project?

                                <strong className="block mt-2">
                                  Project: {message.projectName}
                                </strong>

                                <span className="block mt-2 text-gray-400">
                                  Files to be created:
                                </span>

                                <ul className="mt-2 list-disc pl-5 text-sm">
                                  {Object.keys(message.files || {}).map((fileName) => (
                                    <li key={fileName}>{fileName}</li>
                                  ))}
                                </ul>

                                <p className="mt-2 text-xs text-gray-400">
                                  The project will be created in Documents/CYGNUS
                                  and opened in VS Code.
                                </p>
                              </>
                            )}

                          </div>

                          {/* CONFIRM AND CANCEL BUTTONS */}
                          <div className="flex gap-2">

                            <button
                              type="button"
                              onClick={() => confirmAction(index)}
                              disabled={actionBusyIndex !== null}
                              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                            >
                              {actionBusyIndex === index ? (
                                message.action === "CREATE_PROJECT" ||
                                message.action === "CREATE_TEXT_FILE"
                                  ? "Creating..."
                                  : "Opening..."

                              ) : message.action === "CREATE_PROJECT" ? (
                                "Yes, create project"

                              ) : message.action === "CREATE_TEXT_FILE" ? (
                                "Yes, create file"

                              ) : message.action === "OPEN_WEBSITE" ? (
                                "Yes, open website"

                              ) : (
                                "Yes, open it"
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => cancelAction(index)}
                              disabled={actionBusyIndex !== null}
                              className="rounded-lg border border-white/20 px-4 py-2 text-sm disabled:opacity-50"
                            >
                              Cancel
                            </button>

                          </div>

                        </>
                      )}
        {/* WHATSAPP SENDING STATUS */}
{message.type === "ACTION" &&
  message.action === "SEND_WHATSAPP" && (
    <div className="ml-4 mt-3 max-w-xl rounded-2xl border border-white/10 bg-white/[0.04] p-4">

      {message.whatsappStatus === "pending" && (
        <p className="text-sm text-gray-400">
          Preparing WhatsApp message...
        </p>
      )}

      {(message.whatsappStatus === "sending" ||
        message.whatsappStatus === "success") && (
        <p className="text-sm text-green-400">
          ✓ WhatsApp message sent to{" "}
          <strong>{message.recipientName}</strong>.
        </p>
      )}

      {message.whatsappStatus === "error" && (
        <p className="text-sm text-red-400">
          ✕ {message.whatsappMessage}
        </p>
      )}

    </div>
  )}

                      {/* SUCCESS MESSAGE */}
                      {message.executionStatus === "success" && (
                        <p className="text-sm text-green-500">
                          ✓ {message.executionMessage}
                        </p>
                      )}

                      {/* ERROR MESSAGE */}
                      {message.executionStatus === "error" && (
                        <p className="text-sm text-red-500">
                          {message.executionMessage}
                        </p>
                      )}

                      {/* CANCELLED MESSAGE */}
                      {message.executionStatus === "cancelled" && (
                        <p className="text-sm text-gray-400">
                          Action cancelled.
                        </p>
                      )}

                    </div>
                  )}

                {/* EMAIL PREVIEW CARD */}
                {message.type === "ACTION" &&
                  message.action === "SEND_EMAIL" && (

                    <div className="ml-4 max-w-xl rounded-2xl border border-white/10 bg-white/[0.04] p-5 space-y-4">

                      <div className="flex items-center gap-2">
                        <Mail size={18} />
                        <h3 className="font-semibold">Review Email</h3>
                      </div>

                      <div className="space-y-3 text-sm">

                        <div>
                          <p className="text-gray-400 mb-1">To</p>
                          <p className="break-all">{message.to}</p>
                        </div>

                        <div>
                          <p className="text-gray-400 mb-1">Subject</p>
                          <p>{message.subject}</p>
                        </div>

                        <div>
                          <p className="text-gray-400 mb-1">Message</p>
                          <p className="whitespace-pre-wrap break-words">
                            {message.bodyText}
                          </p>
                        </div>

                      </div>

                      {/* EMAIL ACTION BUTTONS */}
                      {message.emailStatus === "pending" && (
                        <div className="flex gap-3 pt-2">

                          <button
                            type="button"
                            onClick={() => confirmEmail(index)}
                            disabled={emailBusyIndex !== null}
                            className="rounded-xl bg-blue-600 px-5 py-2 text-white hover:bg-blue-500 disabled:opacity-50"
                          >
                            {emailBusyIndex === index
                              ? "Sending..."
                              : "Send Email"}
                          </button>

                          <button
                            type="button"
                            onClick={() => cancelEmail(index)}
                            disabled={emailBusyIndex !== null}
                            className="rounded-xl border border-white/10 px-5 py-2 hover:bg-white/10 disabled:opacity-50"
                          >
                            Cancel
                          </button>

                        </div>
                      )}

                      {/* EMAIL SUCCESS */}
                      {message.emailStatus === "success" && (
                        <p className="text-green-400 text-sm">
                          ✓ {message.emailMessage || "Email sent successfully!"}
                        </p>
                      )}

                      {/* EMAIL ERROR */}
                      {message.emailStatus === "error" && (
                        <p className="text-red-400 text-sm">
                          ✕ {message.emailMessage || "Email could not be sent."}
                        </p>
                      )}

                      {/* EMAIL CANCELLED */}
                      {message.emailStatus === "cancelled" && (
                        <p className="text-gray-400 text-sm">
                          Email draft cancelled. Nothing was sent.
                        </p>
                      )}

                    </div>
                  )}

              </div>
            ))}

          </div>

          {/* CHAT COMPOSER */}
          <div className="conversation-compose">
            <ChatComposer
              onSend={send}
              disabled={busy}
            />
          </div>

        </main>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="assistant-error" role="alert">
          {error}
        </div>
      )}

    </section>
  );
}
