# 💰 Budget App SaaS

Personal finance management application - Multi-user SaaS platform.

## 🎯 Project Overview

Transform a personal finance Excel tracker into a professional web application accessible to multiple users with secure authentication and data isolation.

## 🛠️ Tech Stack

- **Frontend:** Vanilla JavaScript, HTML5, CSS3, Chart.js
- **Backend:** Node.js + Express
- **Database:** PostgreSQL 14
- **Authentication:** JWT (JSON Web Tokens)
- **Containerization:** Docker + Docker Compose
- **Tools:** pgAdmin 4, GitHub Desktop, VS Code

## 📋 Current Features (Local Prototype)

✅ Multi-account management (Current, Savings, Investment)  
✅ Income/Expense tracking with categories  
✅ Transfers between accounts  
✅ Custom category management  
✅ Custom chart builder  
✅ Monthly/Yearly filtering  
✅ Statistics and trend analysis  

## 🚀 Planned Features (Multi-user SaaS)

🔄 User registration and authentication  
🔄 Data isolation per user  
🔄 RESTful API backend  
🔄 Responsive design  
🔄 Export to Excel/PDF  
🔄 Budget planning  
🔄 Email notifications  
🔄 Mobile app (future)  

## 📊 Development Roadmap

See [ROADMAP_BUDGET_APP_SAAS.md](./ROADMAP_BUDGET_APP_SAAS.md) for detailed phases.

**Current Phase:** Phase 0 - Environment Setup ✅  
**Next Phase:** Phase 1 - Backend Development

## 🏗️ Project Structure
```
budget-app-saas/
├── app/                  # Frontend (HTML, CSS, JS)
├── backend/              # Node.js API server
├── migrations/           # Database migration scripts
└── docker-compose.yml    # Docker configuration (Phase 3)
```

## 👤 Author

**Giovanni Mezzasalma**  
Chemical Engineer & Project Engineer  
Specializing in AVEVA PI System implementations and industrial data solutions

📍 Based in Sicily, Italy  
💼 Working remotely with international clients (ENI, ISAB, TAQA, QatarEnergy)

---

**Status:** 🟢 Active Development  
**Privacy:** 🔒 Private Repository
```

### C. Copia la Roadmap

1. Apri il file `ROADMAP_BUDGET_APP_SAAS.md` che ti ho dato prima
2. Copia TUTTO il contenuto
3. Incollalo nel file `ROADMAP_BUDGET_APP_SAAS.md` del progetto

---

## 🗂️ STEP 6: Importa file app esistenti

Ora copia i tuoi file HTML, CSS, JS nella cartella `app/`:

### Metodo Finder (il più semplice):

1. Apri **Finder**
2. Trova dove hai salvato:
   - `index.html`
   - `app.js`
   - `style.css`
3. **Seleziona i 3 file** (Cmd + click)
4. **Copia** (Cmd + C)
5. In VS Code, **click destro** sulla cartella `app/` → **Reveal in Finder**
6. **Incolla** (Cmd + V)

Refresh VS Code (potrebbe farlo automaticamente) e dovresti vedere:
```
app/
├── index.html
├── app.js
└── style.css
```

---

## 💾 STEP 7: Commit con GitHub Desktop (super facile!)

Ora salviamo tutto su GitHub.

### A. Torna in GitHub Desktop

Dovresti vedere tutti i file che hai creato nella sezione **"Changes"** a sinistra.

### B. Scrivi messaggio commit

In basso a sinistra:
```
Summary: Setup project structure and import prototype app

Description: 
- Added .env.example with configuration template
- Added detailed README with tech stack
- Imported existing prototype (HTML, CSS, JS)
- Added project roadmap
- Created backend folder structure