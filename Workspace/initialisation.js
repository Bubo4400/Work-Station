// Function to open or create a database
function openDatabase(name, version, onUpgradeNeeded) {
    return new Promise((resolve, reject) => {
        const dbRequest = indexedDB.open(name, version);

        dbRequest.onupgradeneeded = function(event) {
            const db = event.target.result;
            onUpgradeNeeded(db);
        };

        dbRequest.onsuccess = function(event) {
            resolve(event.target.result);
        };

        dbRequest.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

// Function to initialize the Homework database with some data if it doesn't exist
function initializeHomeworkDB() {
    return openDatabase('Homework', 4, function(db) {
        if (!db.objectStoreNames.contains('works')) {
            const objectStore = db.createObjectStore('works', { keyPath: 'id', autoIncrement: true });
            objectStore.createIndex('date', 'date', { unique: false });
            objectStore.createIndex('subject', 'subject', { unique: false });
            objectStore.createIndex('type', 'type', { unique: false });
            objectStore.createIndex('description', 'description', { unique: false });

            // Add initial data
            objectStore.transaction.oncomplete = function() {
                const transaction = db.transaction('works', 'readwrite');
                const worksStore = transaction.objectStore('works');
                worksStore.add({
                    date: '2024-06-22',
                    subject: 'Math',
                    type: 'Homework',
                    description: 'bd day'
                });
                console.log('Initial homework data added.');
            };
        }
    });
}

// Function to initialize the PlansDB database with some data if it doesn't exist
function initializePlansDB() {
    return openDatabase('Plans', 1, function(db) {
        if (!db.objectStoreNames.contains('plans')) {
            const objectStore = db.createObjectStore('plans', { keyPath: 'id', autoIncrement: true });
            objectStore.createIndex('date', 'date', { unique: false });
            objectStore.createIndex('name', 'name', { unique: false });
            objectStore.createIndex('type', 'type', { unique: false });

            // Add initial data
            objectStore.transaction.oncomplete = function() {
                const transaction = db.transaction('plans', 'readwrite');
                const plansStore = transaction.objectStore('plans');
                plansStore.add({
                    date: '2024-06-22',
                    name: 'My bd',
                    type: 'party'
                });
                console.log('Initial plans data added.');
            };
        }
    });
}

// Function to initialize both databases
function initializeDatabases() {
    initializeHomeworkDB().then(() => {
        console.log('Homework database initialized.');
    }).catch(error => {
        console.error('Error initializing Homework database:', error);
    });

    initializePlansDB().then(() => {
        console.log('PlansDB database initialized.');
    }).catch(error => {
        console.error('Error initializing PlansDB database:', error);
    });
}

// Call the function to initialize databases
initializeDatabases();
