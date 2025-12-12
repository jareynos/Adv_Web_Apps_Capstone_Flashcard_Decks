const api = path => '/api' + path;

async function request(url, opts = {}){
  opts.credentials = opts.credentials || 'same-origin'; // important so cookies (session) are sent
  if (opts.body && typeof opts.body === 'object' && !(opts.body instanceof FormData)) {
    opts.headers = Object.assign({'Content-Type':'application/json'}, opts.headers || {});
    opts.body = JSON.stringify(opts.body);
  }
  const res = await fetch(url, opts);
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const body = await res.json();
    if (!res.ok) throw body;
    return body;
  }
  if (!res.ok) throw new Error('Network error');
  return null;
}

// auth elements
const authSection = document.getElementById('auth-section');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authMsg = document.getElementById('auth-msg');

// app elements
const appSection = document.getElementById('app-section');
const welcome = document.getElementById('welcome');
const logoutBtn = document.getElementById('logout');

const decksList = document.getElementById('decks-list');
const decksSection = document.getElementById('decks-section');
const newDeckForm = document.getElementById('new-deck-form');

const cardsSection = document.getElementById('cards-section');
const backToDecksBtn = document.getElementById('back-to-decks');
const deckTitle = document.getElementById('deck-title');
const deckMeta = document.getElementById('deck-meta');
const cardsList = document.getElementById('cards-list');
const newCardForm = document.getElementById('new-card-form');

let currentDeckId = null;
let currentUserId = null;

// check session
async function checkSession() {
  try {
    const me = await request('/api/auth/me');
    if (me && me.id) {
      currentUserId = me.id;
      showApp();
    } else {
      showAuth();
    }
  } catch (err) {
    showAuth();
  }
}

function showAuth(){ authSection.classList.remove('hidden'); appSection.classList.add('hidden'); }
function showApp(){ authSection.classList.add('hidden'); appSection.classList.remove('hidden'); loadDecks(); welcome.textContent = 'Welcome'; authMsg.textContent = ''; }

// auth handlers
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authMsg.textContent = '';
  const username = e.target.username.value.trim();
  const password = e.target.password.value;
  try {
    const user = await request('/api/auth/login', { method: 'POST', body: { username, password } });
    currentUserId = user.id;
    showApp();
  } catch (err) {
    authMsg.textContent = err.error || err.message || 'Login failed';
  }
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authMsg.textContent = '';
  const username = e.target.username.value.trim();
  const password = e.target.password.value;
  try {
    const user = await request('/api/auth/register', { method: 'POST', body: { username, password } });
    currentUserId = user.id;
    showApp();
  } catch (err) {
    authMsg.textContent = err.error || err.message || 'Register failed';
  }
});

logoutBtn.addEventListener('click', async () => {
  await request('/api/auth/logout', { method: 'POST' });
  currentUserId = null;
  showAuth();
});

// decks & cards (same as before)
async function loadDecks(){
  try{
    const decks = await request(api('/decks'));
    renderDecks(decks);
  }catch(err){
    alert(err.error || err.message || 'Failed to load decks');
  }
}

function renderDecks(decks){
  decksList.innerHTML = '';
  if (decks.length === 0) decksList.innerHTML = '<li class="small">No decks yet. Create one!</li>';
  decks.forEach(d => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <strong>${escapeHtml(d.title)}</strong>
        <div class="small">${escapeHtml(d.description || '')}</div>
      </div>
      <div>
        <button data-id="${d.id}" class="open">Open</button>
        <button data-id="${d.id}" class="delete secondary">Delete</button>
      </div>
    `;
    decksList.appendChild(li);
  });
}

function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

newDeckForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const title = form.title.value.trim();
  const description = form.description.value.trim();
  if (!title) return alert('Title required');
  try{
    await request(api('/decks'), {method:'POST', body:{title,description}});
    form.reset();
    loadDecks();
  }catch(err){ alert(err.error || err.message || 'Failed to create deck'); }
});

decksList.addEventListener('click', async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;
  if (e.target.classList.contains('open')){
    openDeck(id);
  } else if (e.target.classList.contains('delete')){
    if (!confirm('Delete this deck?')) return;
    try{
      await request(api(`/decks/${id}`), { method: 'DELETE' });
      loadDecks();
    }catch(err){ alert(err.error || err.message || 'Failed to delete deck'); }
  }
});

backToDecksBtn.addEventListener('click', () => {
  currentDeckId = null;
  cardsSection.classList.add('hidden');
  decksSection.classList.remove('hidden');
});

async function openDeck(id){
  try{
    const deck = await request(api(`/decks/${id}`));
    currentDeckId = id;
    deckTitle.textContent = deck.title;
    deckMeta.textContent = deck.description || '';
    decksSection.classList.add('hidden');
    cardsSection.classList.remove('hidden');
    loadCards(id);
  }catch(err){ alert(err.error || err.message || 'Failed to open deck'); }
}

async function loadCards(id){
  try{
    const cards = await request(api(`/decks/${id}/cards`));
    renderCards(cards);
  }catch(err){ alert(err.error || err.message || 'Failed to load cards'); }
}

function renderCards(cards){
  cardsList.innerHTML = '';
  if (cards.length === 0) cardsList.innerHTML = '<li class="small">No cards yet. Add one!</li>';
  cards.forEach(c => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="card-flip" data-id="${c.id}">
        <div><strong>Q:</strong> ${escapeHtml(c.question)}</div>
        <div class="small"><strong>A:</strong> <span class="answer hidden">${escapeHtml(c.answer)}</span></div>
      </div>
      <div>
        <button data-id="${c.id}" class="flip">Flip</button>
        <button data-id="${c.id}" class="delete-card secondary">Delete</button>
      </div>
    `;
    cardsList.appendChild(li);
  });
}

cardsList.addEventListener('click', async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;
  if (e.target.classList.contains('flip')){
    const li = e.target.closest('li');
    const answerSpan = li.querySelector('.answer');
    answerSpan.classList.toggle('hidden');
  } else if (e.target.classList.contains('delete-card')){
    if (!confirm('Delete this card?')) return;
    try{
      await request(api(`/decks/${currentDeckId}/cards/${id}`), { method: 'DELETE' });
      loadCards(currentDeckId);
    }catch(err){ alert(err.error || err.message || 'Failed to delete card'); }
  }
});

newCardForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const question = form.question.value.trim();
  const answer = form.answer.value.trim();
  if (!question || !answer) return alert('Question and answer required');
  try{
    await request(api(`/decks/${currentDeckId}/cards`), { method: 'POST', body: {question, answer} });
    form.reset();
    loadCards(currentDeckId);
  }catch(err){ alert(err.error || err.message || 'Failed to add card'); }
});

// init
checkSession();
