# 🏨 Hostel Management System — Setup Guide

## Project Structure
```
hostel-management/
├── frontend/
│   └── src/
│       ├── firebase/
│       │   ├── config.js      ← Firebase keys yahan daalo
│       │   └── services.js    ← Sab DB functions
│       └── App.jsx            ← Poora React app (Login + Admin + Student)
└── SETUP.md                   ← Yeh file
```

---

## Step 1 — Firebase Project Banao (Free)

1. https://console.firebase.google.com par jao
2. "Add project" → naam daalo → Continue
3. **Authentication** enable karo:
   - Build → Authentication → Get started
   - Sign-in method → Email/Password → Enable
4. **Firestore Database** enable karo:
   - Build → Firestore Database → Create database
   - "Start in test mode" choose karo (baad mein rules set karo)
5. **Project Settings** → General → "Your apps" → Web app add karo
6. Firebase config copy karo aur `config.js` mein paste karo:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};
```

---

## Step 2 — React Project Setup

```bash
# React project banao
npm create vite@latest hostel-frontend -- --template react
cd hostel-frontend

# Firebase install karo
npm install firebase

# src/ folder mein ye files paste karo:
# - src/firebase/config.js
# - src/firebase/services.js
# - src/App.jsx

# Run karo
npm run dev
```

---

## Step 3 — Pehla Admin User Banao

Firebase Console → Authentication → Users → "Add user"

Email: `admin@hostel.com`
Password: `Admin@123`

Phir Firestore mein manually ek document banao:

**Collection:** `users`
**Document ID:** (wahi UID jo Firebase Auth mein diya)
```json
{
  "name": "Admin",
  "email": "admin@hostel.com",
  "role": "admin"
}
```

Ab `admin@hostel.com` se login karoge toh **Admin Dashboard** khulega.

---

## Step 4 — Student Users Banao

Admin Dashboard → Students tab → "Naya Student Add Karo"
Yahan naam, email, phone, course add karo.

Phir Firebase Auth mein bhi wahi email se user banao aur `role: "student"` set karo.

---

## Firestore Collections (automatically bante hain)

| Collection   | Kya store hota hai                        |
|--------------|-------------------------------------------|
| `users`      | Students aur admins (name, email, role)   |
| `rooms`      | Room number, type, floor, price, status   |
| `fees`       | Monthly fee records, payment status       |
| `leaves`     | Leave applications with status            |
| `visitors`   | Visitor log, check-in/out time            |
| `complaints` | Student complaints, resolution            |
| `notices`    | Admin published notices                   |

---

## Step 5 — Firestore Security Rules

Firebase Console → Firestore → Rules mein yeh paste karo:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Admin sab kuch read/write kar sakta hai
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // User apna data dekh sakta hai
    function isOwner(uid) {
      return request.auth.uid == uid;
    }

    match /users/{userId} {
      allow read: if request.auth != null && (isAdmin() || isOwner(userId));
      allow write: if isAdmin();
    }

    match /rooms/{roomId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }

    match /fees/{feeId} {
      allow read: if request.auth != null && (isAdmin() || resource.data.studentId == request.auth.uid);
      allow write: if isAdmin();
    }

    match /leaves/{leaveId} {
      allow read: if request.auth != null && (isAdmin() || resource.data.studentId == request.auth.uid);
      allow create: if request.auth != null;
      allow update: if isAdmin();
    }

    match /visitors/{visitorId} {
      allow read: if request.auth != null && (isAdmin() || resource.data.hostStudentId == request.auth.uid);
      allow create: if isAdmin();
      allow update: if isAdmin();
    }

    match /complaints/{complaintId} {
      allow read: if request.auth != null && (isAdmin() || resource.data.studentId == request.auth.uid);
      allow create: if request.auth != null;
      allow update: if isAdmin();
    }

    match /notices/{noticeId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
  }
}
```

---

## Step 6 — Deploy (Free Hosting)

```bash
# Firebase CLI install karo
npm install -g firebase-tools

# Login
firebase login

# Build karo
npm run build

# Firebase init
firebase init hosting
# public: dist, single-page app: yes

# Deploy!
firebase deploy
```

Aapki website live ho jayegi:
`https://YOUR-PROJECT-ID.web.app`

---

## Features Summary

| Feature            | Admin                        | Student                 |
|--------------------|------------------------------|-------------------------|
| Login              | Email/password               | Email/password          |
| Students           | Add, view, delete            | Apna profile dekho      |
| Rooms              | Add, allot, vacate           | Apna room dekho         |
| Fees               | Record, update status        | Apni fees dekho         |
| Leave Application  | Approve/Reject with remark   | Apply, status dekho     |
| Visitor Log        | Check-in/out entry           | Apne visitors dekho     |
| Complaints         | Real-time view, resolve      | Submit, status dekho    |
| Notices            | Publish, delete              | Notice board dekho      |

---

## Need Help?

Koi bhi step mein problem aaye toh batao — aur main help karunga!
