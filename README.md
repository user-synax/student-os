# 🎓 Student OS

<div align="center">

![Student OS Logo](https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/education/education.png)

**Your Personal Study Workspace**

A comprehensive, all-in-one study management platform designed to help students organize their tasks, notes, focus sessions, and learning resources in one beautiful, responsive interface.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://netlify.com)

</div>

---

## 🌟 Features

### 📊 Dashboard
- **Real-time Statistics**: Track your study progress with daily stats
- **Task Overview**: See today's tasks at a glance
- **Recent Notes**: Quick access to your latest study materials
- **Study Streak**: Keep motivated with streak tracking

### ✅ Task Management
- **Create & Manage Tasks**: Add, edit, and delete study tasks
- **Priority Levels**: Set task priorities (high, medium, low)
- **Subject Organization**: Categorize tasks by subject
- **Progress Tracking**: Mark tasks as complete

### 📝 Notes System
- **Rich Markdown Editor**: Write notes with full markdown support
- **Folder Organization**: Organize notes into custom folders
- **Search Functionality**: Quickly find notes by content or title
- **Pinned Notes**: Keep important notes at the top
- **Tag System**: Add tags for better categorization

### ⏱️ Focus Sessions
- **Pomodoro Timer**: Built-in focus timer for study sessions
- **Session History**: Track your focus session history
- **Streak Tracking**: Maintain your study momentum

### 📚 Resources & Flashcards
- **Resource Library**: Store and organize study resources
- **Flashcard System**: Create and study flashcards
- **AI Assistant**: Get help with your studies

### 🎨 Beautiful UI
- **Dark Mode**: Easy on the eyes for long study sessions
- **Responsive Design**: Works perfectly on desktop and mobile
- **Custom Scrollbars**: Smooth, styled scrollbars throughout
- **Modern Design**: Clean, intuitive interface

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB
- **Authentication**: NextAuth.js
- **UI Components**: shadcn/ui, Lucide Icons
- **Database**: MongoDB (Mongoose ODM)
- **Markdown Editor**: @uiw/react-md-editor
- **Styling**: CSS Variables, Custom Scrollbars
- **Deployment**: Netlify

---

## 📦 Installation

### Prerequisites
- Node.js 18.x or higher
- MongoDB Atlas account (for database)
- npm, yarn, or pnpm

### Clone the Repository
```bash
git clone https://github.com/your-username/student-os.git
cd student-os
```

### Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### Environment Variables
Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/student-os
NEXTAUTH_SECRET=your-random-64-character-secret
NEXTAUTH_URL=http://localhost:3000
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Run Development Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Deployment

### Netlify Deployment

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Netlify**
- Go to [netlify.com](https://netlify.com)
- Click "Add new site" → "Import an existing project"
- Connect your GitHub repository

3. **Configure Build Settings**
- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: `18.x`

4. **Add Environment Variables**
- `MONGODB_URI`: Your MongoDB connection string
- `NEXTAUTH_SECRET`: Your generated secret
- `NEXTAUTH_URL`: Your Netlify site URL

5. **Deploy**
- Click "Deploy site"

---

## 📁 Project Structure

```
student-os/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── api/             # API routes
│   │   ├── auth/        # NextAuth API
│   │   ├── dashboard/   # Dashboard stats API
│   │   ├── notes/       # Notes API
│   │   ├── tasks/       # Tasks API
│   │   └── register/    # Registration API
│   ├── dashboard/       # Dashboard pages
│   │   ├── layout.jsx   # Dashboard layout
│   │   ├── notes/       # Notes page
│   │   ├── page.jsx     # Dashboard home
│   │   └── providers.jsx
│   ├── layout.jsx       # Root layout
│   └── page.jsx         # Home page
├── components/
│   └── ui/              # shadcn/ui components
├── lib/
│   └── mongodb.js       # MongoDB connection
├── models/              # Mongoose models
│   ├── Task.js
│   ├── Note.js
│   ├── Session.js
│   └── User.js
├── auth.js              # NextAuth configuration
├── middleware.js        # Authentication middleware
├── next.config.ts       # Next.js configuration
└── package.json
```

---

## 👨‍💻 Author

### About Me
I'm a passionate developer who loves building tools that help students learn better. Student OS was created to solve the problem of scattered study materials and inefficient study habits.

### Contact
- **GitHub**: [@your-username](https://github.com/your-username)
- **Twitter**: [@your-username](https://twitter.com/your-username)
- **Email**: your.email@example.com

---

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute to Student OS:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - The React framework
- [Tailwind CSS](https://tailwindcss.com) - The CSS framework
- [shadcn/ui](https://ui.shadcn.com) - Beautiful UI components
- [MongoDB](https://www.mongodb.com) - The database
- [NextAuth.js](https://next-auth.js.org) - Authentication

---

<div align="center">

**Made with ❤️ for students everywhere**

[⬆ Back to Top](#-student-os)

</div>
