const db = require('../db/flashcards-db');

function makeId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Deck functions (all scoped by userId)
function getDecks(userId) {
  const data = db.getAll();
  return data.decks.filter(d => d.userId === userId);
}

function getDeckById(userId, id) {
  const data = db.getAll();
  const deck = data.decks.find(d => d.id === id && d.userId === userId) || null;
  return deck;
}

function createDeck(userId, { title, description = '' }) {
  if (!userId) { const e = new Error('Unauthorized'); e.status = 401; throw e; }
  if (!title || typeof title !== 'string') {
    const e = new Error('Invalid title'); e.status = 400; throw e;
  }
  const data = db.getAll();
  const newDeck = { id: makeId('d_'), userId, title: title.trim(), description: description || '' };
  data.decks.push(newDeck);
  db.saveAll(data);
  return newDeck;
}

function updateDeck(userId, id, { title, description }) {
  const data = db.getAll();
  const deck = data.decks.find(d => d.id === id && d.userId === userId);
  if (!deck) { const e = new Error('Deck not found'); e.status = 404; throw e; }
  if (title !== undefined) deck.title = String(title);
  if (description !== undefined) deck.description = String(description);
  db.saveAll(data);
  return deck;
}

function deleteDeck(userId, id) {
  const data = db.getAll();
  const deckIndex = data.decks.findIndex(d => d.id === id && d.userId === userId);
  if (deckIndex === -1) { const e = new Error('Deck not found'); e.status = 404; throw e; }
  data.decks.splice(deckIndex, 1);
  data.cards = data.cards.filter(c => !(c.deckId === id && c.userId === userId));
  db.saveAll(data);
  return true;
}

// Card functions (scoped by userId)
function getCardsForDeck(userId, deckId) {
  const data = db.getAll();
  const deck = data.decks.find(d => d.id === deckId && d.userId === userId);
  if (!deck) { const e = new Error('Deck not found'); e.status = 404; throw e; }
  return data.cards.filter(c => c.deckId === deckId && c.userId === userId);
}

function createCard(userId, deckId, { question, answer }) {
  if (!question || !answer) {
    const e = new Error('Question and answer are required'); e.status = 400; throw e;
  }
  const data = db.getAll();
  const deck = data.decks.find(d => d.id === deckId && d.userId === userId);
  if (!deck) { const e = new Error('Deck not found'); e.status = 404; throw e; }
  const newCard = {
    id: makeId('c_'),
    deckId,
    userId,
    question: String(question),
    answer: String(answer)
  };
  data.cards.push(newCard);
  db.saveAll(data);
  return newCard;
}

function updateCard(userId, deckId, cardId, { question, answer }) {
  const data = db.getAll();
  const card = data.cards.find(c => c.id === cardId && c.deckId === deckId && c.userId === userId);
  if (!card) { const e = new Error('Card not found'); e.status = 404; throw e; }
  if (question !== undefined) card.question = String(question);
  if (answer !== undefined) card.answer = String(answer);
  db.saveAll(data);
  return card;
}

function deleteCard(userId, deckId, cardId) {
  const data = db.getAll();
  const idx = data.cards.findIndex(c => c.id === cardId && c.deckId === deckId && c.userId === userId);
  if (idx === -1) { const e = new Error('Card not found'); e.status = 404; throw e; }
  data.cards.splice(idx, 1);
  db.saveAll(data);
  return true;
}

module.exports = {
  getDecks,
  getDeckById,
  createDeck,
  updateDeck,
  deleteDeck,
  getCardsForDeck,
  createCard,
  updateCard,
  deleteCard
};
