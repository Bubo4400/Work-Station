function openDatabase() {
    return new Promise((resolve, reject) => {
        const dbRequest = indexedDB.open('Plans', 1);

        dbRequest.onupgradeneeded = function(event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('plans')) {
                const objectStore = db.createObjectStore('plans', { keyPath: 'id', autoIncrement: true });
                objectStore.createIndex('date', 'date', { unique: false });
                objectStore.createIndex('type', 'type', { unique: false });
                objectStore.createIndex('nom', 'nom', { unique: false });
            }
        };

        dbRequest.onsuccess = function(event) {
            resolve(event.target.result);
        };

        dbRequest.onerror = function(event) {
            reject(event.target.error);
        };
    });
}
// Function to handle form submission
document.getElementById('addPlan').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    const date = document.getElementById('planDate').value;
    const nom = document.getElementById('planName').value;
    const type = document.getElementById('planType').value;

    if (!date || !nom || !type) {
        alert('Please fill in all fields.');
        return;
    }

    const plan = { date, nom, type };

    openDatabase().then(db => {
        const transaction = db.transaction(['plans'], 'readwrite');
        const objectStore = transaction.objectStore('plans');
        const requestAdd = objectStore.add(plan);

        requestAdd.onsuccess = function() {
            document.getElementById('addPlan').reset(); // Reset the form
            removeOldPlans(); // Optional: remove old plans after adding a new one
            location.reload();
        };

        requestAdd.onerror = function(event) {
            console.error('Add request error occurred:', event.target.error);
            alert('Add request error occurred: ' + event.target.error);
        };
    }).catch(error => {
        console.error('Error opening database:', error);
    });
});

// Function to remove old plans
function removeOldPlans() {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    openDatabase().then(db => {
        const transaction = db.transaction(['Plans'], 'readwrite');
        const objectStore = transaction.objectStore('Plans');
        const index = objectStore.index('Date');
        const cursorRequest = index.openCursor();

        cursorRequest.onsuccess = function(event) {
            const cursor = event.target.result;
            if (cursor) {
                const planDate = new Date(cursor.value.Date);
                if (planDate < oneMonthAgo) {
                    objectStore.delete(cursor.primaryKey);
                    console.log('Removed old plan:', cursor.value);
                }
                cursor.continue();
            }
        };

        cursorRequest.onerror = function(event) {
            console.error('Cursor request error:', event.target.error);
        };
    }).catch(error => {
        console.error('Error opening database:', error);
    });
}

// Function to delete the existing database (for debugging)
function deleteDatabase() {
    const deleteRequest = indexedDB.deleteDatabase('Plans');
    deleteRequest.onsuccess = function() {
        console.log('Database deleted successfully.');
    };
    deleteRequest.onerror = function(event) {
        console.error('Database deletion error:', event.target.error);
    };
}

// Uncomment the following line to delete the database for a fresh start:
// deleteDatabase();
