# 🎫 Customer Support Ticket System

## 📌 About the Project

The **Customer Support Ticket System** is a web-based application designed to manage customer complaints, queries, and support requests efficiently. Customers can submit tickets, track their ticket status, and view updates, while administrators can manage tickets, prioritize issues, and update their status.

This project helps simplify customer support management and improves the process of handling customer requests.

## ✨ Features

- 📝 Submit customer support tickets
- 🎫 Automatically generate unique ticket IDs
- 📊 Admin dashboard for ticket management
- 🔍 Search and filter tickets
- 🚦 Manage ticket status
- ⚡ Set ticket priorities
- 📂 Categorize support requests
- 📈 Dashboard statistics
- 🗃️ SQLite database integration
- 💻 Responsive user interface

## 🛠️ Technologies Used

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Python, Flask
- **Database:** SQLite
- **Tools:** VS Code, Git, GitHub

## 📂 Project Structure

```text
Customer-Support-Ticket-System/
│
├── app.py
├── requirements.txt
├── tickets.db
│
├── templates/
│   ├── index.html
│   └── admin.html
│
└── static/
    ├── style.css
    └── script.js
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/Customer-Support-Ticket-System.git
```

### 2. Navigate to the Project Folder

```bash
cd Customer-Support-Ticket-System
```

### 3. Create a Virtual Environment

```bash
python -m venv venv
```

### 4. Activate the Virtual Environment

Windows:

```bash
venv\\Scripts\\activate
```

### 5. Install Dependencies

```bash
pip install -r requirements.txt
```

### 6. Run the Application

```bash
python app.py
```

### 7. Open in Browser

Customer Portal:

http://127.0.0.1:5000

Admin Dashboard:

http://127.0.0.1:5000/admin

## 🔄 Ticket Status Workflow

| Status | Description |
|---|---|
| 🟡 Open | Newly submitted ticket |
| 🔵 In Progress | Support team is working on the issue |
| 🟢 Resolved | Issue has been resolved |

## 🎯 Project Objectives

- Simplify customer complaint management
- Organize support requests in one place
- Improve ticket tracking and monitoring
- Manage customer issues based on priority
- Provide an easy-to-use admin dashboard

## 🚀 Future Enhancements

- Admin login and authentication
- Email notifications
- Live ticket status updates
- Customer ticket history
- Advanced analytics and reports
- Role-based access control

## 👩‍💻 Author

**Sri Nithya**

Student | Aspiring Software Developer

## 📄 License

This project is created for educational and learning purposes.
