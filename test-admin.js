const admin = require('firebase-admin');
admin.initializeApp({
  projectId: "utopian-truth-xt3g1"
});
const db = admin.firestore();
db.settings({ databaseId: "ai-studio-e6d2f5ae-bd98-4b8a-b3f8-9969088a2937" });
db.collection('users').get().then(snap => {
  snap.forEach(doc => console.log(doc.id, doc.data()));
});
