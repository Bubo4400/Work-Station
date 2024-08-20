document.addEventListener('DOMContentLoaded', function () {
    const request = indexedDB.open('Homework', 4);
    let currentWeekStart, currentWeekEnd;

    request.onsuccess = function(event) {
        const db = event.target.result;
        [currentWeekStart, currentWeekEnd] = getCurrentWeekRange();
        console.log('Week Start:', currentWeekStart);
        console.log('Week End:', currentWeekEnd);
        displayHomeworkEntries(db);
    };

    request.onerror = function(event) {
        console.error('IndexedDB error:', event.target.errorCode);
    };

    function displayHomeworkEntries(db) {
        const transaction = db.transaction(['works'], 'readonly');
        const objectStore = transaction.objectStore('works');

        const weekElement = document.getElementById('week');
    
        const displayStart = new Date(currentWeekStart);
        const displayEnd = new Date(currentWeekEnd);
        
        const weekStartFormatted = formatDateWithoutYear(displayStart);
        const weekEndFormatted = formatDateWithoutYear(displayEnd);
        
        weekElement.innerText = `Week of ${weekStartFormatted} to ${weekEndFormatted}`;

        const dayDivs = {
            monday: document.getElementById('monday').querySelector('#workMax'),
            tuesday: document.getElementById('tuesday').querySelector('#workMax'),
            wednesday: document.getElementById('wednesday').querySelector('#workMax'),
            thursday: document.getElementById('thursday').querySelector('#workMax'),
            friday: document.getElementById('friday').querySelector('#workMax'),
            saturday: document.getElementById('saturday').querySelector('#workMaxEnd'),
            sunday: document.getElementById('sunday').querySelector('#workMaxEnd'),
        };

        Object.values(dayDivs).forEach(div => div.innerHTML = '');

        const index = objectStore.index('date'); 
        const range = IDBKeyRange.bound(currentWeekStart.toISOString(), currentWeekEnd.toISOString(), false, true);

        const request = index.openCursor(range);

        request.onsuccess = function(event) {
            const cursor = event.target.result;

            if (cursor) {
                const { date, subject, type, description } = cursor.value;
                const dayOfWeek = getDayOfWeek(new Date(date));
                
                console.log('Date:', date, 'Day of Week:', dayOfWeek);

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
                    console.warn('No section found for day:', dayOfWeek);
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
    
        // Adjust the start of the week to Monday
        const offsetToMonday = (dayOfWeek === 0 ? -6 : dayOfWeek); // Sunday goes back 6 days, others adjust to Monday
        startOfWeek.setDate(now.getDate()-offsetToMonday);
        startOfWeek.setHours(0, 0, 0, 0); // Set to the start of the day
    
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday of the same week
        endOfWeek.setHours(23, 59, 59, 999); // End of the day
    
        return [startOfWeek, endOfWeek];
    }    

    function getDayOfWeek(date) {
        const days = ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'monday'];
        let dayIndex = date.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
        return days[(dayIndex + 6) % 7]; // Adjust to map Sunday to the last day
    }    

    function formatDateWithoutYear(date) {
        // Create a new date object so that the original date is not modified
        const adjustedDate = new Date(date);
        
        // Add 1 to the date
        adjustedDate.setDate(adjustedDate.getDate() + 1);
        
        // Format the date without the year
        const options = { day: 'numeric', month: 'long' };
        return adjustedDate.toLocaleDateString(undefined, options);
    }

    document.getElementById('leftWeek').addEventListener('click', function() {
        updateWeek(-7);
    });

    document.getElementById('rightWeek').addEventListener('click', function() {
        updateWeek(7);
    });

    function updateWeek(days) {
        currentWeekStart.setDate(currentWeekStart.getDate() + days);
        currentWeekEnd.setDate(currentWeekEnd.getDate() + days);

        const request = indexedDB.open('Homework', 4);
        request.onsuccess = function(event) {
            const db = event.target.result;
            displayHomeworkEntries(db);
        };
    }
});
