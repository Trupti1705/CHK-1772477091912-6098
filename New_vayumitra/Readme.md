# 🌿 VayuMitra — Citizen Air Pollution Reporting System

> **वायु मित्र** — *Friend of Clean Air*

VayuMitra is a civic-tech web application that empowers Indian citizens to instantly report air pollution violations directly to government authorities. It bridges the gap between citizens and the Pollution Control Board using a real-time reporting and monitoring system.

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
- Get a unique **Citizen UID** and **Report ID** on submission
- **Share report via WhatsApp** as an official government-style alert
- **Copy report** to clipboard for sharing anywhere

### 🏛️ Government Dashboard
- Secure login with **Firebase Authentication**
- **Real-time Kanban Board** — Pending, Urgent, Rejected columns
- Dashboard auto-updates the moment a citizen submits a report
- Officials can **Mark Urgent** or **Reject** reports
- Search and filter reports by name, location, UID
- Live stats — Total, Pending, Urgent, Rejected count
- Click any report to see full details in a modal

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML, CSS, JavaScript | Frontend |
| Google Firebase Firestore | Real-time database |
| Firebase Authentication | Secure government admin login |
| Browser Geolocation API | Auto GPS detection |
| WhatsApp Share API | Free report sharing via wa.me |

---

## 📁 Project Structure

```
vayumitra/
├── index.html              ← Main HTML structure
├── css/
│   ├── variables.css       ← CSS variables, reset, animations
│   ├── layout.css          ← Nav, hero, grid, form cards
│   ├── forms.css           ← Inputs, labels, upload zone, buttons
│   ├── admin.css           ← Dashboard, kanban, toolbar, lock screen
│   ├── modal.css           ← Modal overlay, detail rows, toast
│   └── share.css           ← WhatsApp share section styles
└── js/
    ├── app.js              ← App state, tab switching, GPS, photo upload
    ├── share.js            ← WhatsApp URL generator, clipboard copy
    └── firebase.js         ← Firebase init, Firestore, auth, kanban board
```

---

## 🚀 Getting Started

### Prerequisites
- VS Code with the **Live Server** extension
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

Open `js/firebase.js` and replace the config:

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

### Step 4 — Set Firestore Security Rules

In Firebase Console → Firestore Database → Rules:

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

### Step 5 — Open with Live Server

> ⚠️ This project uses ES modules — it must be served via a local server, not opened directly as a file.

In VS Code:
```
Right click index.html → Open with Live Server
```

---

## 📊 How Data Flows

```
Citizen fills form
        ↓
Report saved to Firebase Firestore
        ↓
Citizen shares report via WhatsApp alert
        ↓
Government dashboard auto-updates (onSnapshot)
        ↓
Official marks Urgent / Rejects
        ↓
Status updated in Firestore in real-time
```

---

## 📤 WhatsApp Share Feature

After submitting a report, citizens can instantly share an official-style pollution alert on WhatsApp:

```
🚨 POLLUTION ALERT — VayuMitra
─────────────────────────────

Type: Factory / Industrial Smoke
Location: Near XYZ Factory, Mumbai
Report ID: ABC12345
Filed by Citizen: CIT-XYZ123

This violation has been reported to the Pollution Control Board and is under review.

If you witnessed this incident, file your report at:
http://localhost:5173

— VayuMitra Pollution Control System
```

- Uses `wa.me` share URL — **completely free, no API key needed**
- Also includes a **Copy to Clipboard** button for sharing anywhere

---

## 🔐 Security

- Citizens can **only submit** reports — they cannot read others
- Only **authenticated government officials** can view and manage reports
- Firebase Security Rules enforce this at the database level
- Each citizen gets a unique **UID** stored in their browser

---

## 🔮 Future Scope

- 📱 Mobile app (Android & iOS)
- 🤖 AI-based severity detection from uploaded photos
- 🌐 Multilingual support (Hindi, Tamil, Telugu, etc.)
- 📧 Email/SMS notifications for urgent reports
- 📊 Analytics dashboard with pollution heatmaps
- 🗺️ Map view showing pollution hotspots across India
- 🔗 Integration with CPCB (Central Pollution Control Board)

---

## 🌍 Impact

VayuMitra directly supports:
- **Swachh Bharat Mission** — Clean India initiative
- **SDG Goal 11** — Sustainable Cities and Communities
- **SDG Goal 3** — Good Health and Well-being
- **SDG Goal 13** — Climate Action

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---



**🌿 VayuMitra — Because Clean Air is Every Indian's Right 🇮🇳**

*Report. Respond. Breathe.*
