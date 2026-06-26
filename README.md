# Task Manager

A full-stack AI-powered task management application that helps users organize tasks, manage priorities, and interact with an intelligent AI assistant capable of understanding task context, answering questions, and performing actions through tool calling.

## Features

- Secure user registration and login with JWT authentication
- Create, edit, delete, and complete tasks
- Filter tasks by title, status, priority, tags, and deadline
- Pagination for efficient task browsing
- Intelligent AI assistant for task management
- Streaming AI responses for real-time conversations
- Human-in-the-loop workflows for user confirmation
- Persistent conversation memory using LangGraph checkpoints
- Tool calling for task-related actions
- Responsive and modern user interface
- Dark and light mode support
- Optimistic UI updates for smooth interactions
- Persistent PostgreSQL database storage

---

# Tech Stack

## Frontend

- React
- TypeScript
- TanStack Query
- React Router

---

## Backend

- FastAPI
- LangGraph
- LangChain
- Google Gemini
- MongoDB
- PyMongo
- JWT Authentication
- PostgreSQL (LangGraph Checkpointer)
- Pydantic
- Server-Sent Events (Streaming Responses)
- AsyncIO

---

## AI Features

- Agentic AI using LangGraph
- Multi-step reasoning
- Tool Calling
- Conversation Memory
- Interrupt & Resume workflows
- Human-in-the-loop approvals
- Streaming token responses
- Context-aware conversations

---

## Database

- MongoDB
- LangGraph PostgreSQL Checkpointer

---

## Deployment

- Frontend - Vercel
- Backend - Render
- MongoDB - Atlas
- PostgreSQL - Neon (LangGraph Checkpointer)

---

# Live Demo

Frontend: [Task Manager](YOUR_FRONTEND_URL)

Backend API: [Backend Docs](YOUR_BACKEND_DOCS)

---

# Project Structure

```text
Task_Manager
│
├── backend
│   ├── agent
│   ├── routes
│   ├── services
│   ├── database
│   ├── models
│   ├── schemas
│   ├── main.py
│   ├── requirements.txt
│   └── ...
│
└── frontend
    ├── public
    └── src
        ├── api
        ├── components
        ├── context
        ├── hooks
        ├── layouts
        ├── pages
        ├── routes
        ├── utils
        ├── App.tsx
        └── main.tsx
```

---

# Screenshots

## Dashboard

View, organize, and manage tasks with pagination, filtering, and sorting.

![Dashboard](Screenshots/Dashboard.png)

---

## AI Assistant

Interact with the AI assistant through a real-time streaming chat interface capable of understanding tasks and answering questions.

![AI Assistant](Screenshots/AI-Assistant.png)

---

## Task Creation

Create new tasks with priorities, deadlines, and tags.

![Task Creation](Screenshots/Create-Task.png)

---

## Task Filtering

Filter tasks using title, priority, status, deadline, and tags.

![Task Filtering](Screenshots/Task-Filters.png)

---

## AI Tool Calling

The AI automatically invokes tools to perform task-related actions.

![Tool Calling](Screenshots/Tool-Calling.png)

---

## Human-in-the-loop Approval

Interrupt the agent workflow, request user confirmation, and resume execution seamlessly.

![Interrupt Workflow](Screenshots/Human-In-The-Loop.png)

---

## User Authentication

Secure authentication using JWT with protected routes.

![Authentication](Screenshots/Authentication.png)

---

## Task Details

Edit task information, update completion status, priorities, and deadlines.

![Task Details](Screenshots/Task-Details.png)

---

## Backend API

FastAPI endpoints powering authentication, task management, AI streaming, and user interactions.

![Backend Routes](Screenshots/Backend-Routes.png)

---

## LangGraph Workflow

Agent workflow showing reasoning, tool execution, interrupts, and checkpoint persistence.

![LangGraph Workflow](Screenshots/LangGraph.png)

---

## Database Schema

PostgreSQL schema used for users, tasks, and LangGraph checkpoints.

![Database Schema](Screenshots/Database.png)

---

## AI Architecture

The AI assistant is built using LangGraph and LangChain.

It can:

- Maintain persistent conversation memory
- Execute task management tools
- Pause execution for user confirmation
- Resume interrupted workflows
- Stream responses token-by-token
- Store workflow checkpoints in PostgreSQL (Neon)
- Store application data in MongoDB Atlas
- Access authenticated user context
- Perform CRUD operations on user tasks
---

# API Features

- JWT Authentication
- CRUD Task Endpoints
- Pagination
- Filtering
- Sorting
- AI Streaming Endpoint (SSE)
- LangGraph Resume Endpoint
- User Context Injection
- Protected Routes

---

# Frontend Features

- Modern responsive interface
- TanStack Query server-state management
- Optimistic UI updates
- React Context for authentication
- Streaming AI chat
- Infinite chat updates without polling
- Theme support
- Protected routes
- Modular reusable components

---

# Backend Features

- FastAPI
- Async endpoints
- SQLAlchemy ORM
- JWT Authentication
- LangGraph Agent
- Tool Calling
- Streaming Responses
- Dependency Injection
- Modular architecture
- PostgreSQL persistence

---

# What I Learned

- Building production-ready full-stack applications
- Designing REST APIs with FastAPI
- JWT authentication and authorization
- SQLAlchemy ORM with PostgreSQL
- Server-Sent Events (SSE)
- Streaming AI responses
- Building agentic workflows with LangGraph
- Tool calling with LangChain
- Human-in-the-loop agent workflows
- Conversation memory using PostgreSQL checkpoints
- Managing server state with TanStack Query
- Optimistic UI updates
- React Context API
- Deploying frontend and backend independently
- Working with Neon PostgreSQL
- Building scalable project architecture

---

# Future Improvements

- Calendar integration
- Multi-agent workflows
- Team collaboration
- Shared task boards
- Task analytics dashboard
- Email reminders
- Push notifications
- File attachments
- AI-generated productivity insights
- Recurring tasks

---

# Author

**Vedananda Pathi**

GitHub: https://github.com/Vedananda-19