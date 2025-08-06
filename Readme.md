# 🧪 MSTest Dashboard – Full Stack Test Runner

This project provides a complete dashboard to **list and execute MSTest test cases** via a web interface.

It includes:
- 🖼️ A **React frontend** for user interaction
- 🛠️ A **Node.js backend** to run and stream test execution logs
- ⚙️ A **C# utility tool** that scans test DLLs and outputs structured test metadata in JSON

---

## 📁 Project Structure
my-project/
├── services/
│ ├── mstest-backend/ # Node.js backend API
│ │ ├── server.js
│ │ └── package.json
│ └── mstest-dashboard/ # React frontend (UI)
│ ├── App.js
│ └── package.json
├── tools/
│ └── test-listing-tool/ # C# CLI utility to list test metadata
│ ├── YourProject.csproj
│ └── Program.cs
├── .gitignore
├── README.md # This file

---

## 🧩 Components Overview

### 🎯 `mstest-dashboard` (React frontend)
- Allows users to:
  - Input the test DLL path and `.runsettings` file
  - Fetch and select test categories (tags) returned from the C# tool
  - Run selected tests and view live output

### 🧠 `mstest-backend` (Node.js backend)
- Handles:
  - `/list-tests` – invokes the C# utility to retrieve test metadata
  - `/run-tests-stream` – executes `vstest.console.exe` with optional filters and streams output using **Server-Sent Events (SSE)**

### ⚙️ `test-listing-tool` (C# .NET CLI)
- A console app that:
  - Takes a test DLL path as input
  - Lists test case names and categories using reflection or test APIs
  - Outputs JSON like:


[
  {
    "Name": "MyTestCase1",
    "Categories": ["Sanity", "Va31a"]
  },
  ...
]

## 🚀 Getting Started

### 1. Install Dependencies

**Backend**

cd services/mstest-backend
npm install

**Frontend**

cd services/mstest-dashboard
npm install

### 2. Run the Project Locally

**Start the backend*

cd services/mstest-backend
node server.js

**Start the frontend**

cd services/mstest-dashboard
npm start

---

## 🧪 Usage Workflow

1. Launch the frontend at [http://localhost:3000](http://localhost:3000)
2. Provide:
   - Path to your test DLL
   - Path to your `.runsettings` file
3. The app will:
   - Call the backend → C# tool → fetch test tags
   - Display them as checkboxes
   - Run selected test categories using `vstest.console.exe`
   - Show real-time test output in the browser

---

## 🧹 .gitignore

Includes common ignores for:
- Node.js (`node_modules`, `dist`, etc.)
- React builds
- .NET (`bin/`, `obj/`, `TestResults/`)
- Docker support (if added later)

---

## 💡 Future Enhancements

- Dockerize all components (frontend, backend, tools)
- Add API for uploading DLLs
- Add authentication (optional)
- Save and export test reports

---

## 🧾 License

This is a custom internal tool. License terms can be added here if open-sourcing.

---

## 🙋 Support

Need help improving or customizing this dashboard? Open an issue or contact the maintainer.