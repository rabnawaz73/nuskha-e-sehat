# Nuskha-e-Sehat 🏥🇵🇰

> **"Sehat sab ke liye, samajhne ki zubaan mein."**

**Built for the National Agentic AI Hackathon 2025: Vibe Coding Challenge (Track 2).**

**Nuskha-e-Sehat** (Prescription for Health) is a next-generation AI Health Companion designed to democratize healthcare information in Pakistan. Built using the **Vibe Coding** philosophy, this project leverages **Google Genkit** for sophisticated AI agents and **Firebase** for a seamless, no-code backend experience, allowing for rapid prototyping of complex medical interactions.

## 🏆 Hackathon Challenge: Vibe Coding (Track 2)

This project exemplifies **Vibe Coding** by integrating multiple advanced AI flows into a cohesive user interface without getting bogged down in traditional complex infrastructure. 

* **Rapid Development**: Leveraged **Firebase** (Auth & Firestore) as a no-code/low-code backend to focus purely on frontend logic and AI behaviors.
* **Agentic AI**: Deployed over **10+ specialized Genkit flows**, effectively creating a team of AI agents working together (Doctor, Herbalist, Pharmacist, Translator).
* **Multi-Modal**: Processes text, voice, and images seamlessly.

## 🚀 Key Features & AI Agents

The application features a diverse dashboard driven by specialized AI flows:

* **🎙️ Conversational Voice Assistant**: An Urdu/English speaking agent that listens to symptoms and responds with voice (`voice-based-assistant-for-symptoms.ts`, `text-to-speech.ts`).
* **🗣️ AI Health Debate**: A unique agentic workflow where an **AI Doctor** and **AI Herbalist** debate a topic to provide a balanced, holistic perspective (`debate-flow.ts`).
* **🛡️ Fake Medicine Detector**: An agent that analyzes medicine packaging to detect signs of counterfeits or expiry (`detect-fake-or-expired-medicine.ts`).
* **🌊 Cough Analyzer**: A specialized audio analysis agent that categorizes cough sounds (dry, wet, etc.) to suggest next steps (`cough-analysis-flow.ts`).
* **🍲 Food-Drug Interaction**: Checks safety between user diets and their prescriptions (`get-medicine-food-interaction.ts`).
* **🧠 Mood & Emotion Tracker**: Analyzes user sentiment via voice or text to offer mental wellness advice (`detect-emotion-flow.ts`, `get-mood-advice-flow.ts`).
* **📸 Medicine Identifier**: Visual recognition agent that identifies pills and syrups from photos (`identify-medicine-from-image.ts`).
* **💬 Jargon Buster**: Translates complex medical reports into simple, local language (`translate-medical-jargon.ts`).

## 🛠️ Tech Stack

* **Frontend**: [Next.js 14](https://nextjs.org/) (App Router) with TypeScript.
* **UI Framework**: [Shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/) for rapid, beautiful UI.
* **AI Engine**: [Google Genkit](https://firebase.google.com/docs/genkit) + Gemini 2.5 Flash.
* **Backend-as-a-Service**: [Firebase](https://firebase.google.com/) (Authentication & Firestore) – acting as the "No-Code" infrastructure layer.
* **Deployment**: Vercel / Firebase App Hosting.

## 📂 Project Structure
src/ ├── ai/ │ ├── flows/ # 🧠 The "Brain" - 12+ Specialized AI Agents │ │ ├── cough-analysis-flow.ts │ │ ├── debate-flow.ts │ │ ├── detect-emotion-flow.ts │ │ └── ... │ └── genkit.ts # Genkit & Gemini Configuration ├── app/ │ ├── dashboard/ # 📱 UI for accessing Agents │ └── page.tsx # Landing Page ├── components/ # 🧩 Modular UI Blocks └── firebase/ # 🔥 Firebase Config (No-Code Backend connection)
## ⚡ Quick Start

1.  **Clone the repository**:
    ```bash
    git clone [https://github.com/rabnawaz73/nuskha-e-sehat.git](https://github.com/rabnawaz73/nuskha-e-sehat.git)
    cd nuskha-e-sehat
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env.local` file with your keys:
    ```env
    GOOGLE_GENAI_API_KEY=your_gemini_key
    NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    ```

4.  **Run the AI Development UI**:
    To visualize and test the Vibe Coding agents:
    ```bash
    npm run genkit:dev
    ```

5.  **Run the Application**:
    ```bash
    npm run dev
    ```
