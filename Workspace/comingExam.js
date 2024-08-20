document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded. Initializing IndexedDB for upcoming exams...');

    const request = indexedDB.open('Homework', 4); // Ensure the version matches the one used in your setup

    request.onsuccess = function(event) {
        const db = event.target.result;
        console.log('IndexedDB opened successfully:', db);

        displayUpcomingExams(db);
    };

    request.onerror = function(event) {
        console.error('IndexedDB error:', event.target.errorCode);
    };

    function formatDate(date) {
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        return new Intl.DateTimeFormat('en-GB', options).format(date);
    }

    function displayUpcomingExams(db) {
        console.log('Starting transaction to read from the "works" object store...');
        const transaction = db.transaction(['works'], 'readonly');
        const objectStore = transaction.objectStore('works');
        const request = objectStore.openCursor();
        
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time for accurate comparison
        console.log(`Today is: ${formatDate(today)}`);

        const exams = [];

        request.onsuccess = function(event) {
            const cursor = event.target.result;

            if (cursor) {
                let { subject, date, type, description } = cursor.value;
                let examDate = new Date(date);

                // Add 1 to the day of the exam date
                examDate.setDate(examDate.getDate() + 1);

                if (type === 'Exam' && examDate > today) {
                    exams.push({ subject, date: examDate, description });
                    console.log(`Found upcoming exam: ${subject} on ${formatDate(examDate)}`);
                } else {
                    console.log(`Skipping: ${subject} on ${formatDate(examDate)} (Type: ${type})`);
                }

                cursor.continue();
            } else {
                console.log('All items processed. Sorting and displaying upcoming exams.');
                displaySortedExams(exams);
            }
        };

        request.onerror = function(event) {
            console.error('Cursor error:', event.target.errorCode);
        };
    }

    function displaySortedExams(exams) {
        if (exams.length === 0) {
            console.log('No upcoming exams to display.');
            return;
        }

        exams.sort((a, b) => a.date - b.date); // Sort exams by date

        const examBorder = document.getElementById('examBorder');
        const examMaxDiv = document.getElementById('examMax');

        if (!examBorder || !examMaxDiv) {
            console.error('Required HTML elements not found.');
            return;
        }

        examMaxDiv.innerHTML = ''; // Clear any existing content

        exams.forEach(exam => {
            const examDiv = document.createElement('div');
            examDiv.className = 'exams';
            examDiv.innerHTML = `
                <div class="workDetail">
                    <p class="workDetailText">${exam.description}</p>
                </div>
                <p class="examMiniTitle">${exam.subject}</p>
                <p class="examText">${formatDate(exam.date)}</p>
            `;
            examMaxDiv.appendChild(examDiv);
            console.log(`Added exam to display: ${exam.subject} on ${formatDate(exam.date)}`);
        });

        console.log('Displayed sorted exams.');
    }
});
