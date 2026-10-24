<div align="center">

# 🎯 Quick-Mock

### Turn Your Study Materials into AI-Powered Mock Tests

**Upload. Generate. Practice. Improve.**

Transform your study materials into personalized mock tests in minutes. Quick-Mock helps students prepare smarter by generating practice questions from their learning resources, with customizable difficulty levels and question counts.

[✨ Explore the Repository](https://github.com/ShreyasiMalakar/Quick-Mock)

</div>

---

## 📌 Overview

Preparing for competitive examinations, university assessments, and other tests often involves spending hours creating practice questions from study materials.

**Quick-Mock is an AI-powered mock test generation application designed to simplify that process.**

Upload your study resources in supported formats, generate a mock test, and customize your practice session according to your preparation needs.

Whether you're revising a chapter, preparing for an examination, or testing your understanding of a topic, Quick-Mock aims to make self-assessment faster and more accessible.

## ✨ Key Features

- **📚 Study Material Upload** — Use supported learning resources, including PDF, PPT, and text files.
- **🤖 AI-Powered Question Generation** — Generate practice questions from your study materials using AI.
- **🎚️ Customizable Difficulty** — Choose a difficulty level that suits your preparation needs.
- **🔢 Flexible Question Count** — Customize the number of questions in your mock test.
- **⏱️ Faster Exam Preparation** — Spend less time manually preparing questions and more time practicing.
- **🎯 Personalized Practice** — Create practice sessions around the materials you want to study.
- **💻 Web-Based Experience** — Access the application through a browser when running or accessing a deployed instance.

> **The goal:** Make personalized practice tests easier to create, more convenient to access, and adaptable to different learning needs.

## 💡 Why Quick-Mock?

Traditional exam preparation frequently requires students to search for question banks, purchase additional materials, or manually convert notes into practice questions.

Quick-Mock offers a different approach: use the study resources you already have to create practice opportunities.

| Traditional Preparation | With Quick-Mock |
|---|---|
| Manually create questions from notes | Generate questions with AI assistance |
| Depend on pre-existing question banks | Work from your own study materials |
| Use a fixed set of practice questions | Customize the number of questions |
| Follow a fixed difficulty level | Adjust the difficulty to your needs |
| Spend additional time preparing practice sets | Focus more time on learning and revision |

## 🛠️ Technology Stack

Quick-Mock is built using modern web technologies.

| Technology | Purpose |
|---|---|
| React | Component-based user interface |
| TypeScript | Type-safe application development |
| Vite | Frontend development and build tooling |
| Express.js | Server-side application framework |
| Google GenAI SDK | Integration with Google's generative AI services |
| Tailwind CSS | Utility-first styling |
| PDF.js | PDF document processing capabilities |
| Lucide React | Icon components |
| Motion | Interface animation |
| Canvas Confetti | Confetti effects and visual feedback |

*The table describes the technologies present in the project's dependencies. The exact implementation and usage of each dependency depend on the application code.*

## ⚙️ Getting Started

Follow these steps to run Quick-Mock locally.

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- npm, included with Node.js
- Git

You will also need any API credentials required by the application's configured AI integration.

### 1. Clone the Repository

```bash
git clone https://github.com/ShreyasiMalakar/Quick-Mock.git
```

### 2. Navigate to the Project Directory

```bash
cd Quick-Mock
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create your local environment configuration using the provided example file.

```bash
cp .env.example .env
```

Open `.env` and configure the environment variables required by the application.

**Important:** Never commit API keys, access tokens, or other secrets to GitHub. Keep your actual `.env` file private.

### 5. Start the Development Server

```bash
npm run dev
```

Open the local address displayed in your terminal to access the application.

### 6. Build for Production

To create a production build, run:

```bash
npm run build
```

To check TypeScript types, run:

```bash
npm run lint
```

*Note: The commands above follow the scripts defined in `package.json`. Production deployment may require additional server configuration.*

## 🚀 How It Works

The intended workflow is straightforward:

**Step 1 — Upload**

Select your study material in a supported format.

**Step 2 — Customize**

Choose your preferred difficulty level and the number of questions.

**Step 3 — Generate**

Use the application's AI-powered question-generation workflow to create a mock test from your material.

**Step 4 — Practice**

Attempt the generated questions and use the available testing experience to support your preparation.

**Step 5 — Improve**

Repeat the process with different materials, question counts, or difficulty levels to reinforce your learning.

*The precise workflow and available testing or result features depend on the current implementation.*

## 🎓 Who Is Quick-Mock For?

Quick-Mock is designed for learners who want a convenient way to create practice questions from their own study resources.

- **College Students** — Prepare for semester examinations and internal assessments.
- **Competitive Exam Aspirants** — Create additional practice opportunities from revision materials.
- **Self-Learners** — Test their understanding of independently studied topics.
- **Educators and Tutors** — Explore AI-assisted question generation for learning and revision activities.

## 🔮 Future Scope

Potential enhancements that could make Quick-Mock even more useful include:

- 📊 Detailed performance analytics and progress tracking.
- 📈 Topic-wise strengths and weaknesses analysis.
- ⏳ Timed examination mode.
- 📋 Explanations for answers and solutions.
- 🗂️ Saved mock tests and question history.
- 🎯 Adaptive practice based on previous performance.
- 📱 Improved mobile responsiveness.
- 📤 Exportable mock tests and results.

*These are potential future enhancements, not claims about features currently implemented.*

## 🔐 Security and Responsible Use

- Keep API credentials in environment variables.
- Never upload confidential documents or sensitive personal information unless the application's privacy and security protections are appropriate for that data.
- Review AI-generated questions for correctness before relying on them for examination preparation.
- Follow the terms and usage limits of any integrated AI service.

## 🤝 Contributing

Suggestions, bug reports, and feature ideas are welcome.

If you'd like to contribute:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test your changes locally.
5. Submit a pull request describing your improvements.

For bugs or feature requests, open an issue in the [GitHub repository](https://github.com/ShreyasiMalakar/Quick-Mock/issues).

## 👩‍💻 Author

**Shreyasi Malakar**

Computer Science & Engineering | Software Development | AI-Powered Applications

- GitHub: [@ShreyasiMalakar](https://github.com/ShreyasiMalakar)
- Project: [Quick-Mock](https://github.com/ShreyasiMalakar/Quick-Mock)

## 📄 License

No license information has been confirmed for this repository.

If you intend to distribute Quick-Mock as an open-source project, consider adding an appropriate `LICENSE` file after deciding how others may use, modify, and distribute your code.

---

<div align="center">

**Built to make exam preparation smarter, one mock test at a time.** 🎯

⭐ If you find Quick-Mock useful, consider starring the repository!

</div>
