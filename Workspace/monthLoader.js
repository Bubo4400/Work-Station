document.addEventListener('DOMContentLoaded', function () {
    console.log('DOMContentLoaded event triggered.');

    const request = indexedDB.open('Homework', 4);
    console.log('Opening IndexedDB database...');

    let currentDate = new Date(); // Current date, will be modified for navigation

    request.onsuccess = function(event) {
        const db = event.target.result;
        console.log('Database opened successfully:', db);

        setCurrentMonth(); // Set initial month display
        createCalendar(); // Generate initial calendar
        displayMonthlyHomeworkEntries(db); // Display homework entries

        // Add event listeners for month navigation buttons
        document.getElementById('leftMonth').addEventListener('click', function() {
            changeMonth(-1, db);
        });
        document.getElementById('rightMonth').addEventListener('click', function() {
            changeMonth(1, db);
        });
    };

    request.onerror = function(event) {
        console.error('IndexedDB error:', event.target.error);
    };

    function setCurrentMonth() {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const currentMonth = monthNames[currentDate.getMonth()];
        const currentYear = currentDate.getFullYear();

        const monthElement = document.getElementById('month');
        if (monthElement) {
            monthElement.textContent = `${currentMonth.toUpperCase()} ${currentYear}`;
            console.log('Current month set to:', currentMonth, currentYear);
        } else {
            console.error('#month element not found.');
        }
    }

    function createCalendar() {
        console.log('Creating calendar.');

        const calendarContainer = document.getElementById('monthly');
        if (!calendarContainer) {
            console.error('Calendar container element not found.');
            return;
        }

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const startingDay = firstDay.getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        console.log('First day of the month:', firstDay);
        console.log('Starting day:', startingDay);
        console.log('Days in month:', daysInMonth);

        const today = new Date();
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
        const todayDate = today.getDate();

        let calendarHTML = '';
        let dayCount = 1;
        let weekCount = 1;

        for (let i = 0; i < 6; i++) {
            if (dayCount > daysInMonth) break;

            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < startingDay) {
                    calendarHTML += '<div class="day empty"></div>';
                } else if (dayCount > daysInMonth) {
                    calendarHTML += '<div class="day empty"></div>';
                } else {
                    const weekClass = `w${weekCount}`;
                    const dayNumber = dayCount.toString().padStart(2, '0'); // Format day number with leading zero

                    // Replace leading zero with a 5px space
                    const formattedDayNumber = dayNumber.replace(/^0/, '<span style="padding-right: 0.5rem;"></span>');

                    const isToday = isCurrentMonth && dayCount === todayDate;
                    const todayClass = isToday ? ' today' : '';

                    calendarHTML += `<div class="day ${weekClass}${todayClass}" id="day-${dayNumber}"><h4>${formattedDayNumber}</h4><div class="monthMax"></div></div>`;
                    dayCount++;
                }
            }
            weekCount++;
        }

        calendarContainer.innerHTML = calendarHTML;
        console.log('Calendar HTML generated and added to the container.');
    }

    function displayMonthlyHomeworkEntries(db) {
        console.log('Displaying monthly homework entries.');

        const transaction = db.transaction(['works'], 'readonly');
        const objectStore = transaction.objectStore('works');
        const request = objectStore.openCursor();

        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        request.onsuccess = function(event) {
            const cursor = event.target.result;

            if (cursor) {
                const { date, subject, description } = cursor.value;
                const entryDate = new Date(date);
                const entryMonth = entryDate.getMonth();
                const entryYear = entryDate.getFullYear();

                if (entryMonth === currentMonth && entryYear === currentYear) {
                    let dayOfMonth = entryDate.getDate() + 1;

                    const daysInMonth = new Date(entryYear, entryMonth + 1, 0).getDate();
                    if (dayOfMonth > daysInMonth) {
                        dayOfMonth = daysInMonth;
                    }

                    dayOfMonth = dayOfMonth.toString().padStart(2, '0');

                    console.log('Homework entry:', { date, subject, description, dayOfMonth });

                    const dayDiv = document.getElementById(`day-${dayOfMonth}`);

                    if (dayDiv) {
                        const monthMaxDiv = dayDiv.querySelector('.monthMax');

                        if (monthMaxDiv) {
                            const entry = document.createElement('div');
                            let displaySubject = subject.toUpperCase();
                            if (displaySubject === 'ELECTRONICS') {
                                displaySubject = 'ELECTRO';
                            }

                            entry.className = `month${subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase()}`;
                            entry.innerHTML = `
                                <div class="monthDetail">
                                    <p class="monthDetailText">${description}</p>
                                </div>
                                <p class="monthMiniTitle">${displaySubject}</p>
                            `;

                            monthMaxDiv.appendChild(entry);
                            console.log(`Added homework entry for ${dayOfMonth}:`, { subject, description });
                        } else {
                            console.warn(`.monthMax not found for #day-${dayOfMonth}`);
                        }
                    } else {
                        console.warn(`#day-${dayOfMonth} not found`);
                    }
                }

                cursor.continue();
            } else {
                console.log('All homework entries have been displayed.');
            }
        };

        request.onerror = function(event) {
            console.error('Cursor error:', event.target.error);
        };
    }

    function changeMonth(direction, db) {
        currentDate.setMonth(currentDate.getMonth() + direction); // Change month by direction (-1 for previous, +1 for next)
        setCurrentMonth(); // Update the month display
        createCalendar(); // Regenerate calendar
        displayMonthlyHomeworkEntries(db); // Update displayed homework entries
    }
});
