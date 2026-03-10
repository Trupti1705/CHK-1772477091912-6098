# 🌿 VayuMitra — Citizen Air Pollution Reporting System

> **वायु मित्र** — *Friend of Clean Air*

VayuMitra is a civic-tech web application that empowers Indian citizens to instantly report air pollution violations directly to government authorities. It bridges the gap between citizens and the Pollution Control Board using a real-time reporting and monitoring system — all in a single HTML file with no app download required.

---

## 🚨 The Problem

Air pollution is a silent emergency in India:
- India ranks among the most polluted countries in the world
- Over **1.6 million deaths** per year are linked to poor air quality
- There was **no simple, accessible way** for citizens to report pollution violations directly to authorities

---

## ✅ Our Solution

VayuMitra gives every citizen the power to report pollution in seconds — and gives government officials a live dashboard to take swift action.

---

## ✨ Features

### 📱 Citizen Side
- Report pollution with just a browser — no app needed
- Select pollution type (Factory Smoke, Vehicle Exhaust, Open Burning, etc.)
- Auto-detect GPS location with one click
- Upload photo evidence
- Fill in personal details and description
- Get a unique **Citizen ID (UID)** and **Report ID** on submission
- Real-time submission to Firebase database

### 🏛️ Government Dashboard
- Secure login with **Firebase Authentication**
- **Real-time Kanban Board** with 3 columns — Pending, Urgent, Rejected
- Dashboard auto-updates the moment a citizen submits a report (no refresh needed)
- Officials can **Mark Urgent** or **Reject** reports
- Search and filter reports by name, location, UID
- Live stats — Total, Pending, Urgent, Rejected count
- Click any report to see full details in a modal popup

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML, CSS, JavaScript | Frontend — single file application |
| Google Firebase Firestore | Real-time database for storing reports |
| Firebase Authentication | Secure government admin login |
| CSS Grid & Flexbox | Responsive layout |
| Firebase onSnapshot | Live real-time dashboard updates |
| Browser Geolocation API | Auto GPS detection |

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome recommended)
- A Firebase project (free Spark plan is enough)

### Step 1 — Clone the Repository
```bash
git clone https://github.com/your-username/vayumitra.git
cd vayumitra
```

### Step 2 — Set Up Firebase

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project named **VayuMitra**
3. Enable **Firestore Database** (Start in test mode, region: asia-south1)
4. Enable **Firebase Authentication** → Email/Password
5. Create an admin user under Authentication → Users
6. Copy your Firebase config

### Step 3 — Add Your Firebase Config

Open `vayumitra-final.html` and find this section:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

Replace with your own Firebase config values.

### Step 4 — Set Firestore Security Rules

In Firebase Console → Firestore Database → Rules, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reports/{id} {
      allow create: if true;
      allow read, update: if request.auth != null;
    }
  }
}
```

### Step 5 — Open the App

Just **double click** `vayumitra-final.html` to open it in Chrome.

Or use VS Code Live Server:
```
Right click → Open with Live Server
```

---

## 📁 Project Structure

```
vayumitra/
│
├── vayumitra-final.html     ← Complete app (single file)
└── README.md                ← You are here
```

> The entire application — HTML, CSS, JavaScript, and Firebase integration — lives in a **single HTML file**. No build tools, no npm, no server required.

---

## 🔐 Security

- Citizens can **only submit** reports — they cannot read other reports
- Only **authenticated government officials** can view and manage reports
- Firebase Security Rules enforce this at the database level
- Each citizen gets a unique **Citizen UID** stored in their browser

---

## 📊 How Data Flows

```
Citizen fills form
        ↓
Report saved to Firebase Firestore
        ↓
Government dashboard auto-updates (onSnapshot)
        ↓
Official marks Urgent / Rejects
        ↓
Status updated in Firestore in real-time
```

---

## 🖥️ Screenshots

### Citizen Reporting Page
- Clean white and green interface
- GPS location auto-detection
- Photo upload with preview
- Simple form with validation

### Government Dashboard
- Real-time Kanban board
- Stats bar showing totals
- Search and filter functionality
- Detailed report modal on click

---

## 🔮 Future Scope

- 📱 Mobile app (Android & iOS)
- 🤖 AI-based severity detection from uploaded photos
- 🌐 Multilingual support (Hindi, Tamil, Telugu, etc.)
- 📧 Email/SMS notifications for urgent reports
- 📊 Analytics dashboard with pollution heatmaps
- 🔗 Integration with CPCB (Central Pollution Control Board) systems
- 💧 Extend to water and soil pollution reporting
- 🗺️ Map view showing pollution hotspots across India

---

## 🌍 Impact

VayuMitra directly supports:
- **Swachh Bharat Mission** — Clean India initiative
- **SDG Goal 11** — Sustainable Cities and Communities
- **SDG Goal 3** — Good Health and Well-being
- **SDG Goal 13** — Climate Action

---

## 👨‍💻 Built With

- **Frontend:** Pure HTML, CSS, JavaScript
- **Backend:** Google Firebase (Firestore + Authentication)
- **Design:** Custom green/white theme inspired by nature and civic responsibility
- **Fonts:** Syne + DM Sans (Google Fonts)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgements

- Google Firebase for the real-time backend infrastructure
- Central Pollution Control Board (CPCB) for inspiration
- Every Indian citizen who cares about clean air

---

<div align="center">

**🌿 VayuMitra — Because Clean Air is Every Indian's Right 🇮🇳**

*Report. Respond. Breathe.*

</div>
