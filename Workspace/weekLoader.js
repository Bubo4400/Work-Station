document.addEventListener('DOMContentLoaded', function () {
    const request = indexedDB.open('Homework', 4);
    let currentWeekStart, currentWeekEnd;

    request.onsuccess = function(event) {
        const db = event.target.result;
        // Initialize with the current week
        [currentWeekStart, currentWeekEnd] = getCurrentWeekRange();
        displayHomeworkEntries(db);
    };

    request.onerror = function(event) {
        console.error('IndexedDB error:', event.target.errorCode);
    };

    function displayHomeworkEntries(db) {
        const transaction = db.transaction(['works'], 'readonly');
        const objectStore = transaction.objectStore('works');

        const weekElement = document.getElementById('week');
    
        // Create new Date objects to avoid modifying the original start and end dates
        const displayStart = new Date(currentWeekStart);
        const displayEnd = new Date(currentWeekEnd);
        
        // Add one day to the start and end dates
        displayStart.setDate(displayStart.getDate() + 1);
        displayEnd.setDate(displayEnd.getDate() + 1);
        
        // Format the dates
        const weekStartFormatted = formatDateWithoutYear(displayStart);
        const weekEndFormatted = formatDateWithoutYear(displayEnd);
        
        weekElement.innerText = `Week of ${weekStartFormatted} to ${weekEndFormatted}`;

        // Adjust the IDs to match your HTML structure
        const dayDivs = {
            monday: document.getElementById('monday').querySelector('#workMax'),
            tuesday: document.getElementById('tuesday').querySelector('#workMax'),
            wednesday: document.getElementById('wednesday').querySelector('#workMax'),
            thursday: document.getElementById('thursday').querySelector('#workMax'),
            friday: document.getElementById('friday').querySelector('#workMax'),
            saturday: document.getElementById('saturday').querySelector('#workMaxEnd'),
            sunday: document.getElementById('sunday').querySelector('#workMaxEnd'),
        };

        // Clear all sections before displaying
        Object.values(dayDivs).forEach(div => div.innerHTML = '');

        const index = objectStore.index('date'); // Assuming you have an index on date
        const range = IDBKeyRange.bound(currentWeekStart.toISOString(), currentWeekEnd.toISOString(), false, true);

        const request = index.openCursor(range);

        request.onsuccess = function(event) {
            const cursor = event.target.result;

            if (cursor) {
                const { date, subject, type, description } = cursor.value;

                // Determine day of the week from the date
                const dayOfWeek = getDayOfWeek(new Date(date));
                
                console.log('Date:', date, 'Day of Week:', dayOfWeek); // Debug log

                // Check if the day is in the dayDivs object
                if (dayDivs[dayOfWeek]) {
                    const entry = document.createElement('div');
                    entry.className = subject.toLowerCase();
                    entry.innerHTML = `
                        <div class="workDetail">
                            <p class="workDetailText">${description}</p>
                        </div>
                        <p class="workMiniTitle">${subject}</p>
                    `;
                    dayDivs[dayOfWeek].appendChild(entry);
                } else {
                    console.warn('No section found for day:', dayOfWeek); // Debug log
                }

                cursor.continue();
            } else {
                console.log('No more entries.');
            }
        };

        request.onerror = function(event) {
            console.error('Cursor error:', event.target.errorCode);
        };
    }

    function getCurrentWeekRange() {
        const now = new Date();
        const dayOfWeek = now.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
        const startOfWeek = new Date(now);
        
        // Calculate start of week (Monday)
        const offsetToMonday = (dayOfWeek === 0 ? -7 : 1 - dayOfWeek); // If Sunday, set offset to -6, otherwise adjust to Monday
        startOfWeek.setDate(now.getDate() + offsetToMonday);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // End of the week (Sunday)
        endOfWeek.setHours(23, 59, 59, 999);

        return [startOfWeek, endOfWeek];
    }

    // Corrected function to get day of the week starting from Monday
    function getDayOfWeek(date) {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        let dayIndex = date.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
        return days[(dayIndex + 7) % 7]; // Adjust to map Sunday to the last day
    }

    // Helper function to format a date without the year
    function formatDateWithoutYear(date) {
        const options = { day: 'numeric', month: 'long' };
        return date.toLocaleDateString(undefined, options);
    }

    // Update the week based on button clicks
    document.getElementById('leftWeek').addEventListener('click', function() {
        updateWeek(-7); // Go to the previous week
    });

    document.getElementById('rightWeek').addEventListener('click', function() {
        updateWeek(7); // Go to the next week
    });

    function updateWeek(days) {
        // Adjust the current week start and end dates
        currentWeekStart.setDate(currentWeekStart.getDate() + days);
        currentWeekEnd.setDate(currentWeekEnd.getDate() + days);

        // Re-display the homework entries with the updated week
        const request = indexedDB.open('Homework', 4);
        request.onsuccess = function(event) {
            const db = event.target.result;
            displayHomeworkEntries(db);
        };
    }
});
