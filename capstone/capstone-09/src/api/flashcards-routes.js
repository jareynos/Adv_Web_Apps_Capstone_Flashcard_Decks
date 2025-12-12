const express = require('express');
const router = express.Router();
const svc = require('../services/flashcards-service');

// middleware to require auth
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
  next();
}

// Base: /api
router.use(requireAuth);

// Decks
router.get('/decks', (req, res, next) => {
  try {
    const decks = svc.getDecks(req.session.userId);
    res.json(decks);
  } catch (err) { next(err); }
});

router.post('/decks', (req, res, next) => {
  try {
    const deck = svc.createDeck(req.session.userId, req.body);
    res.status(201).json(deck);
  } catch (err) { next(err); }
});

router.get('/decks/:id', (req, res, next) => {
  try {
    const deck = svc.getDeckById(req.session.userId, req.params.id);
    if (!deck) return res.status(404).json({ error: 'Deck not found' });
    res.json(deck);
  } catch (err) { next(err); }
});

router.put('/decks/:id', (req, res, next) => {
  try {
    const deck = svc.updateDeck(req.session.userId, req.params.id, req.body);
    res.json(deck);
  } catch (err) { next(err); }
});

router.delete('/decks/:id', (req, res, next) => {
  try {
    svc.deleteDeck(req.session.userId, req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
});

// Cards within deck
router.get('/decks/:id/cards', (req, res, next) => {
  try {
    const cards = svc.getCardsForDeck(req.session.userId, req.params.id);
    res.json(cards);
  } catch (err) { next(err); }
});

router.post('/decks/:id/cards', (req, res, next) => {
  try {
    const card = svc.createCard(req.session.userId, req.params.id, req.body);
    res.status(201).json(card);
  } catch (err) { next(err); }
});

router.put('/decks/:deckId/cards/:cardId', (req, res, next) => {
  try {
    const card = svc.updateCard(req.session.userId, req.params.deckId, req.params.cardId, req.body);
    res.json(card);
  } catch (err) { next(err); }
});

router.delete('/decks/:deckId/cards/:cardId', (req, res, next) => {
  try {
    svc.deleteCard(req.session.userId, req.params.deckId, req.params.cardId);
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;
