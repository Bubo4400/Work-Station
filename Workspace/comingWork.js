document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded. Initializing IndexedDB for upcoming work entries...');

    const request = indexedDB.open('Homework', 4); // Ensure the version matches your setup

    request.onsuccess = function(event) {
        const db = event.target.result;
        console.log('IndexedDB opened successfully:', db);

        displayUpcomingWork(db);
    };

    request.onerror = function(event) {
        console.error('IndexedDB error:', event.target.errorCode);
        console.error('Detailed error:', event.target.error);
    };

    function formatDate(date) {
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        return new Intl.DateTimeFormat('en-GB', options).format(date);
    }

    function displayUpcomingWork(db) {
        console.log('Starting transaction to read from the "works" object store...');
        
        try {
            const transaction = db.transaction(['works'], 'readonly');
            const objectStore = transaction.objectStore('works');
            const request = objectStore.openCursor();
            
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time for accurate comparison
            const endDate = new Date(today);
            endDate.setDate(today.getDate() + 7);
            console.log(`Today is: ${formatDate(today)}`);
            console.log(`End date is: ${formatDate(endDate)}`);

            const works = [];

            request.onsuccess = function(event) {
                const cursor = event.target.result;

                if (cursor) {
                    const { subject, date, type, description } = cursor.value;
                    let workDate = new Date(date);

                    // Add 1 to the day of the work date
                    workDate.setDate(workDate.getDate() + 1);

                    // Check if the work is of type 'Work' and falls within the next 7 days
                    if (type === 'Work' || type ==='Project') {
                        if (workDate >= today && workDate <= endDate) { 
                            works.push({ subject, date: workDate, description });
                            console.log(`Found upcoming work: ${subject} on ${formatDate(workDate)}`);
                        }
                    } else {
                        console.log(`Skipping: ${subject} on ${formatDate(workDate)} (Type: ${type})`);
                    }

                    cursor.continue();
                } else {
                    console.log('All items processed. Sorting and displaying upcoming work entries.');
                    displaySortedWork(works);
                }
            };

            request.onerror = function(event) {
                console.error('Cursor error:', event.target.errorCode);
                console.error('Detailed cursor error:', event.target.error);
            };
        } catch (error) {
            console.error('Transaction error:', error);
        }
    }

    function displaySortedWork(works) {
        if (works.length === 0) {
            console.log('No upcoming work to display.');
            return;
        }

        works.sort((a, b) => a.date - b.date); // Sort works by date

        const workBorder = document.getElementById('workBorder');
        const workMaxDiv = document.getElementById('workMax');

        if (!workBorder || !workMaxDiv) {
            console.error('Required HTML elements not found.');
            return;
        }

        workMaxDiv.innerHTML = ''; // Clear any existing content

        works.forEach(work => {
            const workDiv = document.createElement('div');
            workDiv.className = work.subject.toLowerCase(); // Class based on subject
            workDiv.innerHTML = `
                <div class="workDetail">
                    <p class="workDetailText">${work.description}</p>
                </div>
                <p class="workMiniTitle">${work.subject}</p>
                <p class="workText">${formatDate(work.date)}</p>
            `;
            workMaxDiv.appendChild(workDiv);
            console.log(`Added work to display: ${work.subject} on ${formatDate(work.date)}`);
        });

        console.log('Displayed sorted work entries.');
    }
});
