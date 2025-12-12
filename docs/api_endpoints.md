# API Endpoints
Base path: `/api`

## Auth
- `POST /api/auth/register` - body: { username, password } -> registers and logs in
- `POST /api/auth/login` - body: { username, password } -> logs in
- `POST /api/auth/logout` - logs out
- `GET /api/auth/me` - returns { id } if logged in

## Decks
- `GET /api/decks` - list all decks for logged-in user
- `POST /api/decks` - create deck. body: { title, description }
- `GET /api/decks/:id` - get deck by id (must belong to user)
- `PUT /api/decks/:id` - update deck
- `DELETE /api/decks/:id` - delete deck and its cards

## Cards
- `GET /api/decks/:id/cards` - get cards for deck
- `POST /api/decks/:id/cards` - create card in deck (body: { question, answer })
- `PUT /api/decks/:deckId/cards/:cardId` - update card
- `DELETE /api/decks/:deckId/cards/:cardId` - delete card
