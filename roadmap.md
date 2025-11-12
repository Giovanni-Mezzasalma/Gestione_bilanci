# 🗺️ ROADMAP COMPLETA - Budget App SaaS

**Progetto:** Budget App multi-utente  
**Obiettivo:** Prodotto commerciale SaaS B2C  
**Timeline totale:** 6-7 settimane per MVP in produzione  
**Autore:** Giovanni - Chemical Engineer & Project Engineer  

---

## 📋 FASE 0: PREPARAZIONE (1-2 giorni)

### Setup Ambiente di Sviluppo
- [x] Installare Node.js (v18 o superiore)
- [x] Installare PostgreSQL (v14 o superiore)
- [x] Installare Docker Desktop
- [x] Installare Git
- [x] Creare repository GitHub privato
- [x] Setup editor (VS Code + estensioni: PostgreSQL, Docker, ESLint)
- [ ] Creare account DigitalOcean/Hetzner (per futuro deploy)

### Pianificazione
- [ ] Definire struttura cartelle progetto
- [ ] Creare file `.env.example` con variabili d'ambiente
- [ ] Setup `.gitignore` (node_modules, .env, dist/)
- [ ] Creare documento "User Stories" base (cosa può fare un utente)

---

## 🏗️ FASE 1: BACKEND FOUNDATION (Settimana 1-2)

### 1.1 Database Setup
- [ ] Creare database PostgreSQL locale `budget_app_dev`
- [ ] Scrivere migration script per tabella `users`
- [ ] Scrivere migration script per tabella `accounts`
- [ ] Scrivere migration script per tabella `transactions`
- [ ] Scrivere migration script per tabella `user_categories`
- [ ] Scrivere migration script per tabella `custom_charts`
- [ ] Creare indici per performance (user_id, date, etc.)
- [ ] Testare schema con dati mock (almeno 2 utenti test)

### 1.2 Node.js API Structure
- [ ] Inizializzare progetto Node.js (`npm init`)
- [ ] Installare dipendenze base:
  - [ ] express
  - [ ] pg (PostgreSQL client)
  - [ ] dotenv
  - [ ] bcrypt
  - [ ] jsonwebtoken
  - [ ] cors
  - [ ] helmet (security)
  - [ ] express-rate-limit
- [ ] Creare struttura cartelle:
  ```
  backend/
  ├── src/
  │   ├── config/
  │   ├── controllers/
  │   ├── middleware/
  │   ├── models/
  │   ├── routes/
  │   ├── utils/
  │   └── server.js
  ├── migrations/
  └── tests/
  ```
- [ ] Setup file `config/database.js` (connessione PostgreSQL)
- [ ] Creare `server.js` base con Express

### 1.3 Sistema di Autenticazione
- [ ] Implementare endpoint `POST /api/auth/register`
  - [ ] Validazione email
  - [ ] Hash password con bcrypt
  - [ ] Controllo email già esistente
  - [ ] Creazione user in DB
- [ ] Implementare endpoint `POST /api/auth/login`
  - [ ] Verifica credenziali
  - [ ] Generazione JWT token
  - [ ] Update `last_login` timestamp
- [ ] Creare middleware `authenticateToken`
  - [ ] Verifica JWT valido
  - [ ] Estrae `user_id` dal token
  - [ ] Passa al prossimo middleware
- [ ] Implementare endpoint `POST /api/auth/logout` (optional, blacklist token)
- [ ] Implementare endpoint `GET /api/auth/me` (info utente loggato)
- [ ] Testare tutti endpoint auth con Postman/Thunder Client

### 1.4 API Accounts
- [ ] `GET /api/accounts` - Lista conti utente loggato
- [ ] `POST /api/accounts` - Crea nuovo conto
- [ ] `PUT /api/accounts/:id` - Modifica conto
- [ ] `DELETE /api/accounts/:id` - Elimina conto (+ transazioni associate)
- [ ] `GET /api/accounts/:id/balance` - Calcola saldo corrente
- [ ] Middleware validazione: solo owner può modificare/eliminare
- [ ] Testare tutti endpoint con Postman

### 1.5 API Transactions
- [ ] `GET /api/transactions` - Lista transazioni (con filtri: month, year, account)
- [ ] `POST /api/transactions` - Crea transazione
- [ ] `PUT /api/transactions/:id` - Modifica transazione
- [ ] `DELETE /api/transactions/:id` - Elimina transazione
- [ ] `GET /api/transactions/stats` - Statistiche (income, expenses, net)
- [ ] Middleware validazione: solo owner può modificare
- [ ] Testare tutti endpoint con Postman

### 1.6 API Transfers
- [ ] `POST /api/transfers` - Crea trasferimento tra conti
- [ ] Validazione: fromAccount e toAccount devono appartenere allo stesso user
- [ ] Validazione: account diversi (non stesso conto)
- [ ] Testare con Postman

### 1.7 API Categories
- [ ] `GET /api/categories` - Ottieni categorie utente
- [ ] `PUT /api/categories` - Aggiorna struttura categorie
- [ ] `POST /api/categories/reset` - Ripristina a default
- [ ] Testare con Postman

### 1.8 API Custom Charts
- [ ] `GET /api/charts` - Lista grafici personalizzati utente
- [ ] `POST /api/charts` - Crea grafico
- [ ] `PUT /api/charts/:id` - Modifica grafico
- [ ] `DELETE /api/charts/:id` - Elimina grafico
- [ ] Testare con Postman

### 1.9 Security & Error Handling
- [ ] Implementare rate limiting (max 100 req/15min per IP)
- [ ] Implementare helmet per headers sicuri
- [ ] Middleware global error handler
- [ ] Validazione input su tutti endpoint (express-validator)
- [ ] Logging richieste (morgan o winston)
- [ ] Sanitizzazione SQL (prepared statements sempre)

---

## 🎨 FASE 2: FRONTEND INTEGRATION (Settimana 3)

### 2.1 Pagine Autenticazione
- [ ] Creare `login.html`
  - [ ] Form email + password
  - [ ] Link "Non hai account? Registrati"
  - [ ] Gestione errori (credenziali errate)
  - [ ] Spinner durante login
- [ ] Creare `register.html`
  - [ ] Form: nome, email, password, conferma password
  - [ ] Validazione client-side (email valida, password min 8 char)
  - [ ] Link "Hai già un account? Login"
  - [ ] Gestione errori (email già esistente)
- [ ] Creare `auth.js` helper
  - [ ] `login(email, password)` → salva token in localStorage
  - [ ] `register(userData)` → registra e auto-login
  - [ ] `logout()` → rimuove token
  - [ ] `getToken()` → recupera token
  - [ ] `isAuthenticated()` → verifica se loggato
  - [ ] `redirectIfNotAuth()` → redirect a login se non auth

### 2.2 Modifica App Principale
- [ ] Modificare `index.html`:
  - [ ] Aggiungere check autenticazione all'inizio
  - [ ] Redirect a login.html se non autenticato
  - [ ] Aggiungere bottone "Logout" in header
- [ ] Creare `api.js` wrapper per chiamate backend
  - [ ] `apiCall(endpoint, method, data)` → aggiunge JWT header automaticamente
  - [ ] Gestione errori: 401 → redirect login, altri → messaggio errore
  - [ ] Gestione loading state globale
- [ ] Modificare `app.js`:
  - [ ] Sostituire `localStorage.getItem('accounts')` con `apiCall('GET', '/api/accounts')`
  - [ ] Sostituire `localStorage.setItem('accounts')` con `apiCall('POST', '/api/accounts', data)`
  - [ ] Idem per transactions, categories, charts

### 2.3 Refactoring Funzioni CRUD
- [ ] `loadData()` → chiamate asincrone alle API
- [ ] `addAccount()` → POST API + aggiorna UI
- [ ] `deleteAccount()` → DELETE API + aggiorna UI
- [ ] `addTransaction()` → POST API + aggiorna UI
- [ ] `deleteTransaction()` → DELETE API + aggiorna UI
- [ ] `addTransfer()` → POST API + aggiorna UI
- [ ] Categorie: load/save da API
- [ ] Custom charts: load/save da API

### 2.4 UX Improvements
- [ ] Aggiungere loading spinners durante chiamate API
- [ ] Gestire errori di rete (toast notifications)
- [ ] Disabilitare pulsanti durante submit (prevent double-click)
- [ ] Aggiungere feedback visivo: "Salvato con successo!" 
- [ ] Gestire sessione scaduta (JWT expired → auto-logout)

### 2.5 Testing Frontend-Backend
- [ ] Testare: registrazione nuovo utente
- [ ] Testare: login utente esistente
- [ ] Testare: CRUD conti
- [ ] Testare: CRUD transazioni
- [ ] Testare: filtro mese/anno
- [ ] Testare: grafici personalizzati
- [ ] Testare: logout
- [ ] Testare: isolamento dati (2 utenti diversi non vedono dati altrui)

---

## 🐳 FASE 3: CONTAINERIZATION (Settimana 4)

### 3.1 Docker Backend
- [ ] Creare `Dockerfile` per backend Node.js
- [ ] Creare `.dockerignore` (node_modules, .env, .git)
- [ ] Testare build locale: `docker build -t budget-api .`
- [ ] Testare run locale: `docker run -p 3000:3000 budget-api`

### 3.2 Docker Compose
- [ ] Creare `docker-compose.yml`:
  - [ ] Service: `postgres` (PostgreSQL 14)
  - [ ] Service: `api` (Node.js backend)
  - [ ] Service: `nginx` (serve frontend statico)
  - [ ] Volume per persistenza dati PostgreSQL
  - [ ] Network privato tra servizi
- [ ] Creare script `init-db.sql` per migrations automatiche
- [ ] Testare: `docker-compose up -d`
- [ ] Verificare tutti servizi funzionanti
- [ ] Testare connessione frontend → API → DB

### 3.3 Nginx Configuration
- [ ] Creare `nginx.conf`:
  - [ ] Serve file statici da `/usr/share/nginx/html`
  - [ ] Proxy `/api/*` → backend:3000
  - [ ] Gzip compression
  - [ ] Cache headers per assets
- [ ] Testare configurazione

### 3.4 Environment Variables
- [ ] Creare `.env.production.example`
- [ ] Documentare tutte le variabili necessarie:
  - [ ] `DATABASE_URL`
  - [ ] `JWT_SECRET`
  - [ ] `NODE_ENV`
  - [ ] `PORT`
  - [ ] `CORS_ORIGIN`

---

## 🚀 FASE 4: DEPLOYMENT (Settimana 4-5)

### 4.1 VPS Setup
- [ ] Acquistare VPS (Hetzner €5/mese o DigitalOcean)
- [ ] Configurare firewall: apri solo porte 80, 443, 22
- [ ] Installare Docker su VPS
- [ ] Installare Docker Compose su VPS
- [ ] Setup SSH key authentication
- [ ] Disabilitare login root via password

### 4.2 Domain & SSL
- [ ] Acquistare dominio (es: `budgetapp.com`)
- [ ] Puntare DNS A record a IP VPS
- [ ] Installare Certbot su VPS
- [ ] Ottenere certificato SSL Let's Encrypt
- [ ] Configurare Nginx per HTTPS redirect

### 4.3 Deploy Applicazione
- [ ] Clonare repository su VPS
- [ ] Copiare file `.env.production` con valori reali
- [ ] Eseguire `docker-compose up -d`
- [ ] Verificare tutti container running: `docker ps`
- [ ] Verificare logs: `docker-compose logs -f`
- [ ] Testare app da browser: `https://budgetapp.com`

### 4.4 Database Production
- [ ] Eseguire migrations su DB production
- [ ] Creare utente admin test
- [ ] Setup backup automatici giornalieri (cron + pg_dump)
- [ ] Testare restore da backup

### 4.5 Monitoring & Maintenance
- [ ] Setup script auto-restart container in caso crash
- [ ] Installare monitoring: uptime robot o Netdata
- [ ] Setup alert email/Telegram in caso downtime
- [ ] Configurare log rotation
- [ ] Documentare procedura update app

---

## 📄 FASE 5: LEGAL & MARKETING (Settimana 5-6)

### 5.1 Documenti Legali (GDPR)
- [ ] Scrivere Privacy Policy
  - [ ] Quali dati raccogli
  - [ ] Come li usi
  - [ ] Diritto cancellazione
  - [ ] Cookie policy
- [ ] Scrivere Terms of Service
  - [ ] Cosa può/non può fare utente
  - [ ] Limitazione responsabilità
  - [ ] Cancellazione account
- [ ] Implementare pagina `/privacy` e `/terms`
- [ ] Aggiungere checkbox "Accetto Privacy Policy" in registrazione
- [ ] Implementare funzione "Export my data" (GDPR)
- [ ] Implementare funzione "Delete my account" (GDPR)

### 5.2 Landing Page
- [ ] Creare `landing.html` (home page pubblica)
  - [ ] Hero section: valore principale app
  - [ ] Features section: cosa offri
  - [ ] Screenshots app
  - [ ] Pricing (Free vs Premium)
  - [ ] CTA: "Inizia Gratis" → registrazione
  - [ ] Footer: links privacy, terms, contatti
- [ ] Design responsive mobile-first
- [ ] Ottimizzare SEO: meta tags, Open Graph

### 5.3 Analytics
- [ ] Setup Plausible Analytics o PostHog
- [ ] Tracciare eventi chiave:
  - [ ] Registrazioni
  - [ ] Login
  - [ ] Transazioni create
  - [ ] Grafici creati
  - [ ] Errori frontend
- [ ] Dashboard per monitorare uso app

### 5.4 Feedback Loop
- [ ] Aggiungere bottone "Feedback" in app
- [ ] Form feedback: cosa ti piace, cosa manca
- [ ] Sistema notifiche email per nuovi feedback

---

## 🧪 FASE 6: TESTING & REFINEMENT (Settimana 6)

### 6.1 Testing Beta
- [ ] Invitare 10-20 beta tester (amici, famiglia, colleghi)
- [ ] Creare gruppo Telegram/WhatsApp per feedback
- [ ] Preparare questionario feedback:
  - [ ] Facilità uso
  - [ ] Features mancanti
  - [ ] Bug riscontrati
  - [ ] Disponibilità a pagare

### 6.2 Bug Fixing
- [ ] Sistemare tutti bug critici reportati
- [ ] Ottimizzare performance (query lente?)
- [ ] Migliorare UX pain points

### 6.3 Documentation
- [ ] Scrivere README.md per utenti
- [ ] Creare FAQ section
- [ ] Video tutorial (opzionale): "Come iniziare"
- [ ] Documentazione API (se vuoi offrire accesso developers)

---

## 🎉 FASE 7: LAUNCH (Settimana 7)

### 7.1 Pre-Launch
- [ ] Ultimo test completo: registrazione → uso → cancellazione
- [ ] Verificare backup funzionanti
- [ ] Verificare monitoring attivo
- [ ] Preparare comunicato stampa/post blog
- [ ] Preparare contenuti social (screenshots, video)

### 7.2 Soft Launch
- [ ] Annunciare a network personale (LinkedIn, Facebook)
- [ ] Postare su Reddit: r/selfhosted, r/personalfinance, r/Italia
- [ ] Postare su forum italiani (HWUpgrade, IlSoftware)
- [ ] Email a beta tester: "Siamo live!"

### 7.3 Hard Launch
- [ ] Pubblicare su ProductHunt
- [ ] Pubblicare su Hacker News (Show HN)
- [ ] Scrivere articolo Medium/Dev.to
- [ ] Contattare blog/giornali tech italiani

### 7.4 Post-Launch
- [ ] Monitorare feedback primi giorni
- [ ] Rispondere velocemente a bug critici
- [ ] Festeggiare primi 100 utenti! 🎉

---

## 🚀 FASE 8: GROWTH & ITERATION (Ongoing)

### 8.1 Feature Roadmap (priorità utenti)
- [ ] Export Excel/PDF
- [ ] Import da bank statement (CSV)
- [ ] Budget planning (allocazione mensile per categoria)
- [ ] Notifiche: "Hai speso 80% budget mensile"
- [ ] Mobile app (React Native)
- [ ] Sync bancario automatico (open banking APIs)
- [ ] Multi-valuta
- [ ] Previsioni spesa AI/ML

### 8.2 Monetization
- [ ] Implementare Stripe payment
- [ ] Creare pagina pricing
- [ ] Implementare limiti piano Free:
  - [ ] Max 2 conti
  - [ ] Max 6 mesi storico
  - [ ] Max 5 grafici custom
- [ ] Sistema upgrade a Premium
- [ ] Email marketing: drip campaign per conversione

### 8.3 Scale Infrastructure
- [ ] Se >1000 utenti: considerare Redis cache
- [ ] Se >5000 utenti: considerare load balancer
- [ ] Se >10000 utenti: considerare sharding database
- [ ] Migrazione a React (se features complessità aumenta)

---

## 📊 METRICHE DI SUCCESSO

### MVP Success (primi 3 mesi)
- [ ] 100+ registrazioni
- [ ] 50+ utenti attivi mensili (MAU)
- [ ] 10+ utenti paying (conversione 10%+)
- [ ] €50+ MRR (Monthly Recurring Revenue)

### Product-Market Fit (6-12 mesi)
- [ ] 1000+ registrazioni
- [ ] 500+ MAU
- [ ] 50+ paying users
- [ ] €500+ MRR
- [ ] Retention rate >40% (utenti tornano dopo 1 mese)

---

## 🛠️ TOOLS CONSIGLIATI

### Development
- [ ] VS Code + Extensions
- [ ] Postman/Thunder Client (test API)
- [ ] TablePlus/DBeaver (gestione DB)
- [ ] GitHub Desktop (se preferisci GUI)

### Project Management
- [ ] Notion (roadmap, docs)
- [ ] Trello/Linear (task tracking)
- [ ] Figma (mockup UI, opzionale)

### Monitoring
- [ ] Plausible Analytics (privacy-friendly)
- [ ] Sentry (error tracking)
- [ ] UptimeRobot (uptime monitoring)

### Communication
- [ ] Telegram group (beta tester feedback)
- [ ] Mailchimp/Sendinblue (newsletter)

---

## ⏱️ TIMELINE RIASSUNTIVA

| Fase | Durata | Obiettivo |
|------|--------|-----------|
| Fase 0: Prep | 1-2 giorni | Setup ambiente |
| Fase 1: Backend | 2 settimane | API funzionanti |
| Fase 2: Frontend | 1 settimana | Integrazione completa |
| Fase 3: Docker | 3-4 giorni | Containerizzazione |
| Fase 4: Deploy | 3-4 giorni | App online |
| Fase 5: Legal/Marketing | 1 settimana | Compliance + promozione |
| Fase 6: Testing | 1 settimana | Beta testing |
| Fase 7: Launch | 2-3 giorni | Go live! |
| **TOTALE** | **6-7 settimane** | **MVP in produzione** |

---

## 💰 BUDGET STIMATO

| Voce | Costo mensile | Note |
|------|---------------|------|
| VPS Hetzner | €5 | Sufficiente per 0-1000 utenti |
| Dominio | €12/anno | .com/.it |
| SSL Certificate | Gratis | Let's Encrypt |
| Email transazionale | Gratis | Sendgrid free tier (100/giorno) |
| Monitoring | Gratis | UptimeRobot, Plausible free |
| **TOTALE STARTUP** | **€5-7/mese** | |

---

## 🎯 MILESTONE CRUCIALI

### 🏁 Milestone 1: MVP Locale (Fine Fase 3)
**Target:** App funzionante su tuo computer
- Database PostgreSQL con multi-user
- API REST complete
- Frontend integrato con autenticazione
- Docker containerizzato
- **Test:** 2-3 amici possono usarla sul tuo PC

### 🏁 Milestone 2: MVP Online (Fine Fase 4)
**Target:** App accessibile da internet
- Deploy su VPS
- HTTPS attivo
- Backup automatici
- **Test:** 10-20 beta tester da remoto

### 🏁 Milestone 3: Lancio Pubblico (Fine Fase 7)
**Target:** Prodotto commerciale live
- GDPR compliant
- Landing page
- Analytics
- Primi 100 utenti
- **Test:** Primi €50 MRR

---

## 📝 NOTE IMPORTANTI

### Database Schema Reference
```sql
-- Schema principale
users (id, email, password_hash, full_name, subscription_tier, created_at)
accounts (id, user_id, name, type, initial_balance)
transactions (id, user_id, account_id, date, type, category, amount, description)
user_categories (id, user_id, type, category_data JSONB)
custom_charts (id, user_id, title, type, period, options JSONB)
```

### API Endpoints Reference
```
Auth:
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- POST /api/auth/logout

Accounts:
- GET /api/accounts
- POST /api/accounts
- PUT /api/accounts/:id
- DELETE /api/accounts/:id
- GET /api/accounts/:id/balance

Transactions:
- GET /api/transactions?month=X&year=Y&account=Z
- POST /api/transactions
- PUT /api/transactions/:id
- DELETE /api/transactions/:id
- GET /api/transactions/stats

Transfers:
- POST /api/transfers

Categories:
- GET /api/categories
- PUT /api/categories
- POST /api/categories/reset

Charts:
- GET /api/charts
- POST /api/charts
- PUT /api/charts/:id
- DELETE /api/charts/:id
```

### Security Checklist
- [ ] Password: bcrypt con cost factor 12
- [ ] JWT: secret forte (32+ caratteri random)
- [ ] HTTPS: sempre in produzione
- [ ] Rate limiting: max 100 req/15min
- [ ] SQL injection: prepared statements
- [ ] XSS: sanitize input utente
- [ ] CORS: solo domini autorizzati
- [ ] Headers: helmet.js configurato

### Performance Optimization
- [ ] Indici DB su user_id, date, account_id
- [ ] Connection pooling PostgreSQL
- [ ] Gzip compression Nginx
- [ ] Cache headers per assets statici
- [ ] Query optimization (EXPLAIN ANALYZE)

---

## 🤝 QUANDO CHIEDERE AIUTO

Chiedi script/codice per:
1. **Database migrations** → Schema PostgreSQL completo
2. **Autenticazione** → JWT + bcrypt implementazione sicura
3. **API endpoints** → Controllers e routes Express
4. **Frontend integration** → api.js e auth.js helpers
5. **Docker setup** → Dockerfile + docker-compose.yml
6. **Deployment** → Script deploy su VPS
7. **GDPR compliance** → Template privacy policy

---

## 📅 PROSSIMI PASSI

1. **Spunta Fase 0** → Setup ambiente sviluppo
2. **Inizia Fase 1.1** → Database schema
3. **Dimmi quando sei pronto** → Fornirò script completi

---

**Buon lavoro! 🚀**

*Questa roadmap è un documento vivo: aggiorna regolarmente i checkbox e adatta in base ai tuoi progressi!*