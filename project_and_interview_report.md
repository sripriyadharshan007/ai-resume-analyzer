# AI Resume Analyzer - Project & Interview Preparation Report

This report provides a detailed overview of the **AI Resume Analyzer** project, outlining its architecture, core functionalities, and the technologies used. The second half of the report is tailored specifically for interview preparation, offering potential questions and talking points based on this project.

---

## Part 1: Project Overview & Core Functions

### 1. Project Description
The AI Resume Analyzer is a comprehensive full-stack application designed to help job seekers optimize their resumes, prepare for interviews, and analyze their GitHub profiles. It leverages Artificial Intelligence (Google Gemini API) to provide intelligent feedback, generate tailored cover letters, and conduct mock interviews.

### 2. Technology Stack
*   **Backend Framework:** Java 17 with Spring Boot 3.2.5
*   **Database:** MongoDB (using Spring Data MongoDB)
*   **Security:** Spring Security with stateless JWT (JSON Web Token) authentication
*   **Frontend Framework:** React (Vite) with Tailwind CSS for styling
*   **AI Integration:** Google Gemini API (via `AiService`)
*   **File Parsing:** Apache Tika (for parsing PDF and Word documents)
*   **UI/UX Enhancements:** Lenis for smooth scrolling, Framer Motion for animations, and a premium "Awwwards-grade" glassmorphism aesthetic.

### 3. Core Functions & Controllers

#### 📝 Resume Analysis (`ResumeController` / `CustomResumeController`)
*   **Functionality:** Allows users to upload their resumes (PDF/DOCX). The backend extracts the text using **Apache Tika**.
*   **AI Processing:** The extracted text and a target job title are sent to the AI service, which evaluates the resume, calculates an ATS (Applicant Tracking System) score, identifies missing keywords, and suggests improvements.

#### 🤖 Mock Interview Module (`InterviewController`)
*   **Functionality:** Generates personalized interview questions based on the user's parsed resume and the target job title.
*   **Interactive Sessions:** Users can start a session (`/api/interview/start`), submit answers one by one (`/submit`), and receive real-time AI feedback and grading for each answer.

#### 🐙 GitHub Profile Evaluation (`GithubController`)
*   **Functionality:** Users can input their GitHub username. The backend connects to the **GitHub REST API** to fetch repositories, followers, stars, and top languages.
*   **AI Processing:** The aggregated stats and the user's README profile are analyzed by the AI to generate a "GitHub Score", highlight strengths/weaknesses, and recommend projects to build.

#### ✉️ Cover Letter Generation (`CoverLetterController`)
*   **Functionality:** Generates highly tailored cover letters based on the user's analyzed resume and the specific job description they are applying for.

#### 📚 Course Suggestions & Job Matching (`CourseController` / `JobMatchController`)
*   **Functionality:** Recommends online courses to bridge skill gaps identified during the resume analysis. Also matches the user's profile against potential job roles.

#### 🔐 Authentication & Security (`AuthController`)
*   **Functionality:** Secures the application using JWT. Includes a seamless "Auto-Register on Login" flow, allowing users to authenticate without a separate registration step.

---

## Part 2: Interview Preparation Guide

If you are presenting this project in a software engineering interview, use the following guide to articulate your design decisions, technical challenges, and problem-solving skills.

> [!TIP]
> **How to present this project:** Focus on the architectural decisions, the integration of third-party APIs, and how you managed state and security.

### 1. Common Interview Questions & How to Answer Them

**Q: Explain the architecture of your application. Why did you choose Spring Boot and React?**
*   **Answer Strategy:** Highlight the separation of concerns. Spring Boot provides a robust, scalable, and secure backend (ideal for handling file uploads and REST APIs), while React allows for a dynamic, component-driven user interface. Mention how they communicate asynchronously via REST over HTTP.

**Q: How did you handle file uploads and text extraction?**
*   **Answer Strategy:** Discuss the challenge of extracting text from complex formats like PDFs. Explain that you utilized **Apache Tika** because it provides a unified interface for parsing various document types natively in Java, ensuring the AI receives clean, raw text.

**Q: How is authentication implemented? Why use JWT?**
*   **Answer Strategy:** Explain that the app uses **Spring Security**. JWT was chosen because it allows for stateless authentication, reducing database load since the server doesn't need to store session state. Discuss the token lifecycle (generation, sending via Bearer header, and validation on every request via a custom filter).

**Q: Walk me through how the AI integration works.**
*   **Answer Strategy:** Describe the `AiService`. Explain how you construct structured prompts by combining user data (e.g., resume text, GitHub stats) and send them to the Gemini API. Mention how you handle API failures (e.g., using fallback mock data as seen in the GitHub controller to ensure the app doesn't crash).

**Q: How did you design the database schema in MongoDB?**
*   **Answer Strategy:** Explain that MongoDB, being a NoSQL document database, is perfect for this project because AI responses (like suggested projects, interview questions, and feedback arrays) are inherently hierarchical and flexible. Mention collections like `Users`, `Resumes`, `Analyses`, and `InterviewSessions`.

### 2. Highlighting Key Technical Accomplishments

*   **API Orchestration:** In the GitHub evaluation feature, you successfully orchestrated multiple API calls (User details, Repositories, README) before passing the aggregated payload to the AI service.
*   **Stateful Processes in a Stateless Backend:** The Mock Interview feature maintains a "Session" in the database to track user progress, allowing a stateful interview experience over a stateless REST API.
*   **UI/UX Excellence:** Emphasize the attention to detail on the frontend, mentioning the custom Lenis smooth scrolling, CSS glassmorphism, and responsive design, showing you care about the end-user experience.

### 3. Anticipated "Push-Back" Questions (Be Prepared)

*   **"What happens if the AI API takes 10 seconds to respond?"**
    *   *Response:* Mention frontend loading states, skeleton screens, and disabled buttons. For future scaling, discuss using WebSockets or asynchronous task queues (like RabbitMQ or Kafka) to process resumes in the background.
*   **"How do you handle rate limiting from the GitHub API?"**
    *   *Response:* Discuss your fallback mechanism that provides mock analysis if the API fails, and mention potential caching strategies (e.g., Redis) to store GitHub profiles for a certain TTL (Time to Live) to reduce external API calls.

> [!IMPORTANT]
> **Final Tip:** Always frame challenges as learning opportunities. If asked about a bug you faced, explain the debugging process (e.g., reading logs, testing API endpoints with Postman) rather than just the solution.
