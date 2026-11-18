\# CYGNUS | Personal AI Assistant



CYGNUS is a personal AI assistant designed to bring everyday digital tasks into one place. It combines a React-based web application, a Java Spring Boot backend, and a local Java agent to support conversations, task management, document handling, email workflows, and selected Windows desktop actions.



The goal is to build a unified assistant that can help users interact with their information and perform useful actions through a single interface.



\## Features



\### AI Assistant

\- Conversational assistant interface.

\- Conversation and message management.

\- Integration with Google's Gemini API.



\### Task Management

\- Create, view, update, and delete tasks.

\- Organize everyday activities through a dedicated task interface.



\### Notes and Documents

\- Create, view, edit, search, and delete notes.

\- Upload PDF documents.

\- Extract and retrieve text from uploaded PDFs using Apache PDFBox.



\### Gmail Integration

\- Google OAuth-based Gmail connection.

\- Send emails through the Gmail API.



\### Local Desktop Agent

The Java-based local agent supports selected actions on a Windows machine:



\- Launch approved desktop applications.

\- Open validated websites in Chrome.

\- Create text and code files.

\- Generate project folders containing multiple files.

\- Open generated projects in Visual Studio Code.



\### WhatsApp Integration

\- Open WhatsApp Web.

\- Prepare messages for a selected recipient.

\- Verify recipient and message details before the automated send action.

\- Automated sending is supported through the local agent; message delivery is not independently verified.



\## Tech Stack



| Layer | Technologies |

|---|---|

| Frontend | React, JavaScript, Vite |

| UI | Tailwind CSS, Lucide React |

| Backend | Java, Spring Boot |

| Database | MySQL, Spring Data JPA, JDBC |

| AI Integration | Google Gemini API |

| Document Processing | Apache PDFBox |

| Email Integration | Gmail API, Google OAuth |

| Desktop Automation | Java ProcessBuilder, Playwright |

| API Communication | Axios, REST APIs |

| Build Tools | Maven, npm |



\## Architecture



CYGNUS is organized into three main modules:



1\. \*\*Frontend:\*\* A React application that provides the user interface and communicates with the backend and local agent.

2\. \*\*Backend:\*\* A Spring Boot application responsible for API endpoints, database operations, AI integration, document processing, and Gmail functionality.

3\. \*\*Local Agent:\*\* A separate Java Spring Boot application that performs selected desktop and browser actions on the user's Windows machine.



```text

&#x20;                CYGNUS

&#x20;                   |

&#x20;         React Frontend (Vite)

&#x20;                   |

&#x20;         ---------------------

&#x20;         |                   |

&#x20;   Spring Boot Backend   Local Java Agent

&#x20;         |                   |

&#x20;     MySQL Database      Windows Actions

&#x20;         |

&#x20;   External Integrations

&#x20;    - Gemini API

&#x20;    - Gmail API

```



\## Application Screenshots



\### Dashboard

!\[CYGNUS Dashboard](docs/screenshots/dashboard.png)



\### AI Assistant

!\[CYGNUS Assistant](docs/screenshots/assistant.png)



\### Email

!\[Email Integration](docs/screenshots/email.png)



\### WhatsApp

!\[WhatsApp Integration](docs/screenshots/whatsapp.png)



\### Projects

!\[Project Management](docs/screenshots/projects.png)



\### Tasks

!\[Task Management](docs/screenshots/tasks.png)



\## Project Structure



```text

CYGNUS/

│

├── backend/

│   ├── src/

│   ├── pom.xml

│   └── mvnw

│

├── frontend/

│   ├── src/

│   ├── public/

│   └── package.json

│

├── local-agent/

│   ├── src/

│   └── pom.xml

│

├── docs/

│   └── screenshots/

│

├── .gitignore

└── README.md

```



\## Running the Project Locally



\### Prerequisites



\- Windows 10/11

\- Java JDK 21

\- Maven

\- Node.js and npm

\- MySQL Server

\- Google Gemini API key

\- Google Cloud OAuth credentials for Gmail integration, if using Gmail features



\### 1. Clone the repository



```bash

git clone https://github.com/Shrutii22/CYGNUS.git

cd CYGNUS

```



\### 2. Configure the backend



Configure your MySQL database and provide the required credentials through environment variables.



```powershell

$env:DB\_PASSWORD = "your\_mysql\_password"

$env:GEMINI\_API\_KEY = "your\_gemini\_api\_key"

```



Configure the Gmail OAuth credentials and other required application properties locally. Never commit private credentials or token files.



Start the backend:



```powershell

cd backend

.\\mvnw.cmd spring-boot:run

```



\### 3. Configure and start the frontend



Open another terminal:



```powershell

cd frontend

npm install

npm run dev

```



Use the local URL printed by Vite to open the application.



\### 4. Start the local agent



Open another terminal and configure the local agent token:



```powershell

$env:CYGNUS\_AGENT\_TOKEN = "your\_local\_agent\_token"

```



Start the agent:



```powershell

cd local-agent

.\\mvnw.cmd spring-boot:run

```



Configure the matching `VITE\_AGENT\_TOKEN` in the frontend's local environment file. The frontend and local agent must use the same token.



Check the local application configuration for the required ports and other settings before starting all three modules.



\## Security



\- API credentials and environment-specific configuration should remain outside version control.

\- The local agent uses token-based authorization.

\- Desktop application launching is restricted to an approved application list.

\- Website URLs are validated before opening.

\- File and project creation validates names and avoids overwriting existing files.

\- Gmail access uses OAuth credentials.



Do not publish API keys, OAuth client secrets, access tokens, database passwords, or personal documents.



\## Planned Enhancements



\- AI-powered PDF explanations and summaries.

\- Ask questions about uploaded study material.

\- Generate topic-wise quizzes and practice tests.

\- Evaluate test responses and provide scores.

\- Identify weak topics and track learning progress.

\- Improve local-agent capabilities and action handling.



These learning features are planned enhancements; the current document functionality supports PDF upload and text extraction.



\## Project Status



CYGNUS is an actively developed personal project. Its modules bring together web-based assistant features, backend services, document handling, and selected local desktop automation.



\## Repository



\[GitHub: Shrutii22/CYGNUS](https://github.com/Shrutii22/CYGNUS)



\---



\*Built as a hands-on project to explore full-stack development, Java backend engineering, AI integration, and desktop automation.\*

