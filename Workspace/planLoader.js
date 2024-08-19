document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded. Initializing IndexedDB for upcoming plan entries...');

    const request = indexedDB.open('Plans', 1);

    request.onsuccess = function(event) {
        const db = event.target.result;
        console.log('IndexedDB opened successfully:', db);

        displayUpcomingplan(db);
    };

    request.onerror = function(event) {
        console.error('IndexedDB error:', event.target.errorCode);
        console.error('Detailed error:', event.target.error);
    };

    function formatDate(date) {
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        return new Intl.DateTimeFormat('en-GB', options).format(date);
    }

    function displayUpcomingplan(db) {
        console.log('Starting transaction to read from the "plans" object store...');
        
        try {
            const transaction = db.transaction(['plans'], 'readonly');
            const objectStore = transaction.objectStore('plans');
            const request = objectStore.openCursor();
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const endDate = new Date(today);
            endDate.setDate(today.getDate() + 7);
            console.log(`Today is: ${formatDate(today)}`);
            console.log(`End date is: ${formatDate(endDate)}`);

            const plans = [];

            request.onsuccess = function(event) {
                const cursor = event.target.result;

                if (cursor) {
                    const { date, nom, type } = cursor.value;
                    let planDate = new Date(date);

                    planDate.setDate(planDate.getDate() + 1);

                    if (planDate >= today && planDate <= endDate) {
                        plans.push({ nom, date: planDate, type });
                        console.log(`Found upcoming plan: ${nom} on ${formatDate(planDate)}`);
                    } else {
                        console.log(`Skipping: ${nom} on ${formatDate(planDate)} (Type: ${type})`);
                    }

                    cursor.continue();
                } else {
                    console.log('All items processed. Sorting and displaying upcoming plan entries.');
                    displaySortedplan(plans);
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

    function displaySortedplan(plans) {
        if (plans.length === 0) {
            console.log('No upcoming plan to display.');
            return;
        }

        plans.sort((a, b) => a.date - b.date);

        const planMax = document.getElementById('planMax');

        if (!planMax) {
            console.error('No element found with id "planMax".');
            return;
        }

        planMax.innerHTML = '';

        plans.forEach(plan => {
            const planDiv = document.createElement('div');
            planDiv.className = plan.type.toLowerCase();
            planDiv.innerHTML = `
                <p class="${plan.type}Name">${plan.nom}</p>
                <p class="${plan.type}Date">${formatDate(plan.date)}</p>
            `;
            planMax.appendChild(planDiv);
            console.log(`Added plan to display: ${plan.nom} on ${formatDate(plan.date)}`);
        });

        console.log('Displayed sorted plan entries.');
    }
});
