# uppdrag
Det här repot innehåller backend och frontend för https://uppdrag.frilansaresverige.se.

# Tekniker
- Vue.js 3 i frontend
- Node.js med Express i backend
- MySQL för lagring

# Utveckling
För att köra det lokalt, klona hem repot och kör
```
$ npm install
```
i katalogerna `backend` och `frontend`.

Öppna `backend/structure.sql` och kör de SQL-frågorna på en MySQL-server.

Kopiera `backend/config.js.example` till `backend/config.js` och fyll i variablerna.

Kör backenden och frontenden parallellt:
```
$ cd backend
$ npm start

$ cd frontend
$ npm start
```

Besök http://localhost:8080 för att se frontenden. Tack vare `frontend/vue.config.js` skickas anrop till `http://localhost:8080/api` vidare till backenden.