const log = console.log;
let db = null;

const btnOpenDB = document.getElementById('btnOpenDB');
btnOpenDB.addEventListener('click', () => openDB((_db) => (db = _db)));

const btnAdd_tNote = document.getElementById('btnAdd_tNote');
btnAdd_tNote.addEventListener('click', () => {
    const key_tNote = document.getElementById('txtKey_tNote').value;
    const val_tNote = document.getElementById('txtVal_tNote').value;
    const doc = {
        title: key_tNote,
        description: val_tNote,
    };

    insert('todo_note', doc, (data) => log(data));
});

const btnAdd_pNote = document.getElementById('btnAdd_pNote');
btnAdd_pNote.addEventListener('click', () => {
    const key_pNote = document.getElementById('txtKey_pNote').value;
    const val_pNote = document.getElementById('txtVal_pNote').value;
    const doc = {
        title: key_pNote,
        description: val_pNote,
    };
    insert('personal_note', doc, (data) => log(data));
});

const btnFindByPK = document.getElementById('btnFindByPK');
btnFindByPK.addEventListener('click', () => {
    findByPK('personal_note', 1, (data) => log('pNote', data));
    findByPK('todo_note', 'a', (data) => log('tNote', data));
});

function openDB(cb = () => {}) {
    const dbName = document.getElementById('txtDB').value;
    const dbVersion = document.getElementById('txtVersion').value;

    const request = indexedDB.open(dbName, dbVersion);
    request.onupgradeneeded = (e) => {
        // DDL operation can only be done here.
        const db = e.target.result;
        cb(db);
        // create two table or collection 'personal_note' & 'todo_note'
        const pNotes = db.createObjectStore('personal_note', { autoIncrement: true });
        const tNotes = db.createObjectStore('todo_note', { keyPath: 'title' }); // primary key: title
        log('upgrade is called');
    };
    request.onsuccess = (e) => {
        const db = e.target.result;
        cb(db);

        log('success is called');
        log({ name: db?.name ?? 'name', version: db?.version ?? 'version' });
    };
    request.onerror = (e) => {
        log(`error is called`);
        log(`reason: ${e.target.error}`);
    };
}

function insert(collectionName, document, cb = () => {}) {
    // - create transaction
    const txn = db.transaction([collectionName], 'readwrite');
    txn.onerror = (e) => log(['error', `reason: ${e.target.error}`]);

    const collection = txn.objectStore(collectionName);
    const request = collection.add(document);
    request.onsuccess = (e) => cb(e.target.result);
    request.onerror = (e) => log(['error', `reason: ${e.target.error}`]);
}

function findByPK(collectionName, primaryKey, cb = () => {}) {
    const txn = db.transaction([collectionName], 'readonly'); // - create transaction
    txn.onerror = (e) => log(['error', `reason: ${e.target.error}`]);
    const collection = txn.objectStore(collectionName);

    const request = collection.get(primaryKey); // - make request
    request.onsuccess = (e) => cb(e.target.result);
    request.onerror = (e) => log(['error', `reason: ${e.target.error}`]);
}

function updateByPK(collectionName, primaryKey, valuesToUpdate, cb = () => {}) {
    const txn = db.transaction([collectionName], 'readwrite'); // - create transaction
    txn.onerror = (e) => log(['error', `reason: ${e.target.error}`]);
    const collection = txn.objectStore(collectionName);

    const request = collection.get(primaryKey); // - make request
    request.onsuccess = (e) => {
        const result = e.target.result;
        const prev = JSON.parse(JSON.stringify(result));

        for (const [k, v] of Object.entries(valuesToUpdate)) result[k] = v;
        const request = collection.put(result);

        request.onsuccess = (e) => cb({ prev: prev, new: e.target.result });
        request.onerror = (e) => log(['error', `reason: ${e.target.error}`]);
    };
    request.onerror = (e) => log(['error', `reason: ${e.target.error}`]);
}

function deleteByPK(collectionName, primaryKey, cb = () => {}) {
    const txn = db.transaction([collectionName], 'readwrite'); // - create transaction
    txn.onerror = (e) => log(['error', `reason: ${e.target.error}`]);
    const collection = txn.objectStore(collectionName);

    const request = collection.delete(primaryKey);
    request.onsuccess = (e) => cb(e.target.result);
    request.onerror = (e) => log(['error', `reason: ${e.target.error}`]);
}

// cursor
// https://binary-studio.com/2015/06/15/indexed-db-part-iii/