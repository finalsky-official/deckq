import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCagf_q1hlBY2vgzqi_9o4eXSYBV3z1tFw",
  authDomain: "deck-wordle.firebaseapp.com",
  databaseURL: "https://deck-wordle-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "deck-wordle",
  storageBucket: "deck-wordle.firebasestorage.app",
  messagingSenderId: "272834397552",
  appId: "1:272834397552:web:f2d01c19380db8ed437bb5"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 指定日のデッキを取得
export async function getDeckByDate(dateStr) {
  const snapshot = await get(ref(db, `decks/${dateStr}`));
  return snapshot.exists() ? snapshot.val() : null;
}

// 指定日にデッキを保存
export async function saveDeckByDate(dateStr, deckData) {
  await set(ref(db, `decks/${dateStr}`), deckData);
}

// 全デッキ一覧を取得
export async function getAllDecks() {
  const snapshot = await get(ref(db, "decks"));
  return snapshot.exists() ? snapshot.val() : {};
}

// 指定日のデッキを削除
export async function deleteDeckByDate(dateStr) {
  await set(ref(db, `decks/${dateStr}`), null);
}


export { db };
