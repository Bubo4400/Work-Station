// Function to open IndexedDB
function openDatabase() {
    return new Promise((resolve, reject) => {
        const dbRequest = indexedDB.open('Homework', 4);

        dbRequest.onupgradeneeded = function(event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('works')) {
                const objectStore = db.createObjectStore('works', { keyPath: 'id', autoIncrement: true });
                objectStore.createIndex('date', 'date', { unique: false });
                objectStore.createIndex('subject', 'subject', { unique: false });
                objectStore.createIndex('type', 'type', { unique: false });
                objectStore.createIndex('description', 'description', { unique: false });
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

// Function to add homework to IndexedDB
document.getElementById('addWorks').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    const date = document.getElementById('date').value;
    const subject = document.getElementById('subject').value;
    const type = document.getElementById('type').value;
    const description = document.getElementById('description').value;

    if (!date || !subject || !type || !description) {
        alert('Please fill in all fields.');
        return;
    }

    const homework = { date, subject, type, description };

    openDatabase().then(db => {
        const transaction = db.transaction(['works'], 'readwrite');
        const objectStore = transaction.objectStore('works');
        const requestAdd = objectStore.add(homework);

        requestAdd.onsuccess = function() {
            document.getElementById('addWorks').reset(); // Reset the form
            removeOldWorks(); // Call to remove old works after adding new work
            location.reload();
        };

        requestAdd.onerror = function(event) {
            console.error('Add request error occurred:', event.target.error);
            alert('Add request error occurred: ' + event.target.error);
        };
    });
});

// Function to remove works older than 1 month
function removeOldWorks() {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1); // Set date to one month ago

    openDatabase().then(db => {
        const transaction = db.transaction(['works'], 'readwrite');
        const objectStore = transaction.objectStore('works');
        const index = objectStore.index('date');
        const cursorRequest = index.openCursor();

        cursorRequest.onsuccess = function(event) {
            const cursor = event.target.result;
            if (cursor) {
                const workDate = new Date(cursor.value.date);
                if (workDate < oneMonthAgo) {
                    objectStore.delete(cursor.primaryKey);
                    console.log('Removed old work:', cursor.value);
                }
                cursor.continue();
            }
        };

        cursorRequest.onerror = function(event) {
            console.error('Cursor request error:', event.target.error);
        };
    });
}
