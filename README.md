# Bet Master League

Una Progressive Web App (PWA) completa per scommesse sportive e tornei con comparazione quote.

## 🚀 Caratteristiche

- **Autenticazione completa**: Registrazione, login e gestione profilo utente
- **Sistema tornei**: Partecipazione a tornei gratuiti e premium con classifiche
- **Pronostici sportivi**: Sistema completo di scommesse con schedina interattiva
- **Comparazione quote**: Confronto quote tra diversi bookmaker
- **Classifiche**: Sistema di ranking generale e personale
- **Sistema crediti**: Gestione crediti utente e acquisti
- **Notifiche**: Sistema di notifiche in tempo reale
- **Design responsive**: Interfaccia ottimizzata per mobile, tablet e desktop

## 🛠️ Tecnologie

### Frontend
- **React 18** con TypeScript
- **Tailwind CSS** per lo styling
- **Wouter** per il routing
- **TanStack Query** per state management
- **Radix UI** componenti accessibili
- **Framer Motion** per animazioni

### Backend
- **Node.js** con Express
- **MongoDB** con Mongoose
- **Session-based authentication**
- **RESTful API**

### PWA Features
- **Service Worker** per offline support
- **Manifest** per installazione app
- **Cache strategies** per performance

## 📱 Funzionalità Principali

### Per Utenti Guest
- Visualizzazione tornei e partite
- Accesso alle quote
- Registrazione guidata

### Per Utenti Registrati
- Partecipazione ai tornei
- Creazione pronostici
- Gestione schedina
- Cronologia scommesse
- Sistema badge e achievement
- Inviti referral

## 🎨 Design

- **Colori primari**: #112244 (header/footer), #FFD700 (accenti)
- **Design mobile-first** con breakpoint responsive
- **UI/UX ottimizzata** per esperienza betting
- **Navigazione intuitiva** con bottom navigation

## 🏗️ Struttura Progetto

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componenti riutilizzabili
│   │   ├── pages/          # Pagine dell'applicazione
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utilities e tipi
├── server/                 # Backend Express
│   ├── models/             # Modelli MongoDB
│   ├── routes.ts           # API routes
│   └── storage.ts          # Data layer
└── shared/                 # Tipi condivisi
```

## 🚀 Avvio Rapido

1. **Installazione dipendenze**:
   ```bash
   npm install
   ```

2. **Avvio sviluppo**:
   ```bash
   npm run dev
   ```

3. **Build produzione**:
   ```bash
   npm run build
   ```

## 📄 Licenza

Questo progetto è proprietario. Tutti i diritti riservati.

---

**Bet Master League** - La tua piattaforma per scommesse sportive e tornei