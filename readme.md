# Flashcard Decks App — With Plaintext Accounts (Demo)

## Quick start
1. `npm install`
2. `npm start`
3. Open `http://localhost:3000` and register or login

This demo adds simple plaintext user accounts and server-side sessions so each user has their own decks. **Passwords are stored in plaintext for demo purposes only — do not use this pattern in production.**

## Notes
- User data stored in `data/users.json`
- Flashcards stored in `data/flashcards.json`
- Sessions use in-memory store (express-session). For production, use a persistent session store.
