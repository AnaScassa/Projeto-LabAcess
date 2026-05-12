# 🖥️ LabAccess Frontend
Frontend application for the Laboratory Access Control system.  
Built with React, this interface consumes the LabAccess Backend API to upload files, monitor processing status, and visualize access validation results.

---

## 📌 Purpose
This application provides a user interface to:

- Upload `.xls` laboratory access files
- Monitor asynchronous processing status
- View validated access records
- Authenticate users securely
- Interact with the Laboratory Access Control API

This project works together with the LabAccess Backend (Django + Celery + Redis).

---

## 🏗️ Architecture
- Frontend: React
- HTTP Client: Fetch API / Axios
- Authentication: JWT
- Integration: REST API (Django backend)

---

## 🔄 Application Flow
1. User authenticates
2. User uploads `.xls` file
3. Frontend sends file to backend API
4. Backend processes file asynchronously using Celery
5. Frontend checks processing status
6. Results are displayed after processing is complete

---

## ⚙️ Implemented Features
- JWT authentication
- File upload interface
- Processing status tracking
- Access record visualization
- Secure API integration
- Error handling and validation feedback

---

## 🚀 Running the Project

### 1️⃣ Clone the repository
git clone https://github.com/AnaScassa/LabAccess-Frontend.git  
cd LabAccess-Frontend  

### 2️⃣ Install dependencies
npm install  

### 3️⃣ Run the development server
npm start  
The application will run at:
http://localhost:3000  
⚠️ Make sure the backend API is running before starting the frontend.

---

## 🔐 Environment Configuration
Create a `.env` file in the root folder if needed:
REACT_APP_API_URL=http://localhost:8000/api

---

## 📡 Backend Integration
This frontend consumes the Laboratory Access Control API endpoints, including:
- Authentication
- File upload
- Processing status
- Access listing
The backend must be running and accessible for full functionality.

---

## 📈 Future Improvements
- UI/UX improvements
- Dashboard with data visualization
- Real-time status updates (WebSockets)
- Role-based interface
- Production deployment configuration