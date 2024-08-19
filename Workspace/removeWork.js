// Function to open IndexedDB
function openWorkDatabase() {
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

// Function to populate the work options based on the selected date
document.getElementById('removeDate').addEventListener('change', function() {
    const selectedDate = this.value;
    const removeWorkSelect = document.getElementById('removeWork');

    // Clear previous options
    removeWorkSelect.innerHTML = '';

    openWorkDatabase().then(db => {
        const transaction = db.transaction(['works'], 'readonly');
        const objectStore = transaction.objectStore('works');
        const index = objectStore.index('date');
        const request = index.getAll(selectedDate);

        request.onsuccess = function(event) {
            const works = event.target.result;

            if (works.length === 0) {
                const noWorkOption = document.createElement('option');
                noWorkOption.value = '';
                noWorkOption.textContent = 'No work available on this date';
                removeWorkSelect.appendChild(noWorkOption);
                return;
            }

            works.forEach(work => {
                const option = document.createElement('option');
                option.value = work.id;
                option.textContent = `${work.subject} - ${work.type}: ${work.description}`;
                removeWorkSelect.appendChild(option);
            });
        };

        request.onerror = function(event) {
            console.error('Error fetching work:', event.target.error);
        };
    });
});

// Function to delete the selected work
document.getElementById('removeSubmit').addEventListener('click', function(event) {
    event.preventDefault();

    const selectedWorkId = document.getElementById('removeWork').value;

    if (!selectedWorkId) {
        alert('Please select a work to remove.');
        return;
    }

    openWorkDatabase().then(db => {
        const transaction = db.transaction(['works'], 'readwrite');
        const objectStore = transaction.objectStore('works');
        const request = objectStore.delete(Number(selectedWorkId));

        request.onsuccess = function() {
            document.getElementById('removeWork').innerHTML = ''; // Clear the dropdown
            location.reload();
        };

        request.onerror = function(event) {
            console.error('Error deleting work:', event.target.error);
            alert('Error removing work: ' + event.target.error);
        };
    });
});
