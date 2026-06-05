# 🧠 AI-Sentiment-Dashboard
**Responsible AI Sentiment Dashboard for Florida Atlantic University **

Link for Powerpoint: https://1drv.ms/p/c/6c383511022771d7/EW9zlOjly_RIvPyB5oOc7LgB9Kawy8fz8QU_1W5IMGtXVQ

---

<img width="500" height="250" alt="AI Sentiment Dashboard Screenshot" src="https://github.com/user-attachments/assets/f55676d8-d356-4228-a92b-b2281a99985e" />

---

##  Project Overview
The **AI Sentiment Dashboard** is a web-based tool that analyzes user-entered text and classifies it as **Positive**, **Negative**, or **Neutral**.

Users can type any message into the text box and click **Analyze**.  
The dashboard instantly displays:

- The **predicted sentiment** (e.g., 😊 Positive / 😐 Neutral / ☹️ Negative)  
- **Probability scores** showing model confidence  
- A short **Responsible AI notice** reminding users that predictions are educational, probabilistic, and privacy-safe  

This project was built for **Florida Atlantic University’s CAP 4630 – Artificial Intelligence** course to demonstrate responsible AI principles, model deployment, and transparent design.

---

##  Features

###  Core Functionality
- Real-time text sentiment analysis  
- Emoji-based result visualization  
- Probability breakdown (e.g., Positive 70%, Neutral 20%, Negative 10%)  
- **FastAPI backend** + **React frontend** integration  
- Lightweight and privacy-safe — no data storage  

---

##  Responsible AI
This project follows **Responsible AI** principles to ensure transparency and fairness.

### **Biases**
The model may reflect biases from its training data, especially around slang, cultural references, or underrepresented groups.

### **Limitations**
- Struggles with sarcasm, mixed emotions, or non-English text  
- Does not provide advice, emotional guidance, or next steps  

### **Data Privacy**
No personal information is stored.  
User text is processed once to generate results and then discarded immediately.

### **Probabilities & Transparency**
The system shows model confidence, e.g.  
**Positive: 70% | Neutral: 20% | Negative: 10%**  
This helps users interpret outputs responsibly and understand uncertainty.

---

## Technical Stack
| Layer | Technology |
|-------|-------------|
| **Frontend** | React + Vite + Axios |
| **Backend** | FastAPI (Python) |
| **Model** | Hugging Face RoBERTa (`cardiffnlp/twitter-roberta-base-sentiment`) |
| **Libraries** | PyTorch, Transformers, Uvicorn |
| **Environment** | Local development / Cloud prototype |

---

## Installation & Usage
Quick start:

1. Create and activate the Python virtual environment.

```bash
python3 -m venv .venv
source .venv/bin/activate      # Mac/Linux
# or: .venv\Scripts\activate   # Windows
```

2. Install the backend dependencies.

```bash
pip3 install -r backend/requirements.txt
```

3. Start the app.

```bash
./start-dev.sh
```

The launcher starts both the FastAPI backend and the Vite frontend, and it writes logs to `.backend-dev.log` and `.frontend-dev.log` in the repo root.

If you prefer to run things separately:

```bash
cd frontend
npm install
npm run dev
```

```bash
cd backend
uvicorn app:app --reload --port 8000
```

If you change the backend port from `8000`, update the URL in `frontend/src/api.jsx` too.

## System Architecture

The AI Sentiment Dashboard follows a simple and transparent architecture consisting of three core layers:

1. **Frontend (React)**  
   - Handles user input through a web interface.  
   - Sends the text to the backend using Axios.  
   - Displays the sentiment label, emoji, and confidence scores returned from the backend.  

2. **Backend (FastAPI – Python)**  
   - Acts as an intermediary between the frontend and the machine learning model.  
   - Exposes a REST API endpoint (`/analyze`) to receive text input.  
   - Passes user text to the sentiment analysis model and returns the results.  

3. **Model Layer (Hugging Face RoBERTa)**  
   - Processes the text using a pre-trained transformer model.  
   - Generates probability scores for **Positive**, **Negative**, and **Neutral** sentiment.  
   - Sends the final results back to the backend in JSON format.  

4. **Results Display (Frontend Output)**  
   - The frontend updates the UI with:  
     - The predicted sentiment (😊 / 😐 / ☹️)  
     - Probability scores (e.g., Positive 72%, Neutral 18%, Negative 10%)  
     - A brief Responsible AI notice about data privacy and interpretability.

## Flow Summary 
1. User enters text on the dashboard
2. Frontend sends the request to the FastAPI backend
3. Backend runs inference with RoBERTa
4. Model returns sentiment + probabilities
5. Frontend displays the result with an emoji

## Future Improvements 
- Multi-language support
- Improved handling of sarcasm and mixed emotions
- Add word-level explainability visualization
- Deploy to AWS for public access

## Contributors 
- **Machine Learning Lead –** Christopher Piedra  
- **Backend Developer –** Matthew White  
- **Frontend Developer –** Matthew Wyatt  
- **Data Engineer –** Sophia Camacho  
- **Responsible AI & Documentation Lead / PM –** Mackenzie Falla



---

# ⚠️ ALL PREDICTIONS ARE PROBABILISTIC AND NOT DETERMINISTIC
> No personal data is stored.  
> Predictions are generated locally and are for educational use only under **FAU’s CAP 4630 – Artificial Intelligence**.


