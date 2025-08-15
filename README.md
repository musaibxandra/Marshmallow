<a name="readme-top"></a>
[Click here to view Marshmallow](https://my-marshmallow.netlify.app/)
<!--
!!! IMPORTANT !!!
This README is an example of how you could professionally present your codebase.
Writing documentation is a crucial part of your work as a professional software developer and cannot be ignored.

You should modify this file to match your project and remove sections that don't apply.

REQUIRED SECTIONS:
- Table of Contents
- About the Project
  - Built With
  - Live Demo
- Getting Started
- Authors
- Future Features
- Contributing
- Show your support
- Acknowledgements
- License

OPTIONAL SECTIONS:
- FAQ

After you're finished please remove all the comments and instructions!

For more information on the importance of a professional README for your repositories: https://github.com/SJA Pathwayinc/curriculum-transversal-skills/blob/main/documentation/articles/readme_best_practices.md
-->

<div align="center">

  <img src="./src/assets/logo.svg" alt="logo" width="auto"  height="auto" />
  <br/>

  <h3><b>Marshmallow</b></h3>

</div>

<!-- TABLE OF CONTENTS -->

# 📗 Table of Contents

- [📖 About the Project](#about-project)
  - [🛠 Built With](#built-with)
    - [Tech Stack](#tech-stack)
    - [Key Features](#key-features)
  - [🚀 Live Demo](#live-demo)
- [💻 Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
  - [Install](#install)
- [Deployment](#deployment)
- [👥 Author](#author)
- [👥 Socials](#Social)


<!-- PROJECT DESCRIPTION -->

# Marshmallow <a name="about-project"></a>

**Marshmallow** is a task management web app that allows users to create boards, lists, and draggable task cards. It supports real-time updates, drag-and-drop interactions, and a clean, responsive UI for organizing personal or team workflows efficiently.

## 🛠 Built With <a name="built-with"></a>

### Tech Stack <a name="tech-stack"></a>

<details>
  <summary>Client</summary>
  <ul>
    <li>React (functional components, hooks)</li>
    <li>Tailwind CSS (utility-first styling)</li>
    <li>Heroicons (SVG icons)</li>
    <li>React Router (routing/navigation)</li>
  </ul>
</details>

<details>
  <summary>Server</summary>
  <ul>
    <li>Node JS</li>
    <li>Firebase Authentication (user management)</li>
  </ul>
</details>

<details>
<summary>Database</summary>
  <ul>
    <li>Firebase Firestore (NoSQL, real-time database for boards, lists, cards, and user data)</li>
  </ul>
</details>

<!-- Features -->

### Key Features <a name="key-features"></a>

## Key Features

- **User Authentication:** Secure sign-up, login, and logout using Firebase Auth.
- **Board Management:** Create, edit, and delete boards to organize your projects.
- **List & Card Organization:** Add lists and cards to boards for flexible task management.
- **Drag-and-Drop:** Easily rearrange lists and cards with intuitive drag-and-drop functionality.
- **Real-Time Collaboration:** Instant updates across devices using Firestore listeners.
- **Responsive Design:** Optimized for desktop and mobile with Tailwind CSS.
- **Workspace Members:** Invite and manage team members for collaborative workspaces.
- **Customizable UI:** Modern interface with dynamic colors and interactive components.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LIVE DEMO -->

## 🚀 Live Demo <a name="live-demo"></a>

- [Live Link](https://my-marshmallow.netlify.app/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## 💻 Getting Started <a name="getting-started"></a>

### Run tests

## Getting Started

Follow these steps to set up and run Marshmallow locally:

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/marshmallow.git
cd marshmallow
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Firebase

- Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
- Enable Authentication and Firestore Database.
- Copy your Firebase configuration and replace the contents of `src/config/firebase.js` with your config:

```js
// src/config/firebase.js
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  // ...other config
};
```

### 4. Start the Development Server

```bash
npm start
```

### 5. Create Your First Board

- Sign up or log in.
- Click "Create new board" to start organizing your projects!

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Deployment <a name="deployment"></a>

## Author <a name="author"></a>

- Mohammed Maqdoom - [GitHub](https://github.com/musaibxandra)

## Socials <a name="social"></a>

- [LinkedIn](https://linkedin.com/in/musaibxandra)
