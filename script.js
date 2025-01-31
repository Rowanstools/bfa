let winesData = [];

// Load the CSV data when the page loads
window.onload = function () {
    Papa.parse('wines.csv', {
        download: true,
        header: true,
        complete: function (results) {
            winesData = results.data; // Store the parsed data in the winesData array
            console.log(winesData); // Check that data is loaded correctly
        }
    });

    // Dynamic search functionality for wine names
    document.getElementById('wineSearch').addEventListener('input', function (e) {
        const query = e.target.value.toLowerCase();
        const suggestions = winesData.filter(wine => wine.wine_name.toLowerCase().includes(query));
        const dropdown = document.getElementById('searchSuggestions');

        dropdown.innerHTML = '';

        if (query && suggestions.length) {
            dropdown.style.display = 'block'; // Show dropdown

            suggestions.forEach(suggestion => {
                const option = document.createElement('div');
                option.textContent = suggestion.wine_name;
                option.className = 'suggestion-item';

                option.addEventListener('click', function () {
                    const wineSearch = document.getElementById('wineSearch');
                    wineSearch.value = suggestion.wine_name;
                    dropdown.innerHTML = '';
                    dropdown.style.display = 'none'; // Hide dropdown after selection
                });

                dropdown.appendChild(option);
            });
        } else {
            dropdown.style.display = 'none'; // Hide dropdown if no suggestions
        }
    });

    // Lookup functionality
    document.getElementById('lookupButton').addEventListener('click', function () {
        const wineName = document.getElementById('wineSearch').value.trim();
        const vintageYear = document.getElementById('vintageInput').value.trim();
        const numberOfBottles = document.getElementById('bottlesInput').value.trim();

        const wineInfo = winesData.find(wine => wine.wine_name.toLowerCase() === wineName.toLowerCase());

        if (wineInfo && vintageYear && numberOfBottles) {
            let description = `${wineInfo.wine_name} ${vintageYear}, ${wineInfo.description} (${numberOfBottles} bottles)`;
            document.getElementById('outputText').textContent = description;
        } else {
            document.getElementById('outputText').textContent = 'Please provide valid input for all fields.';
        }
    });

    // Clear All functionality
    document.getElementById('clearButton').addEventListener('click', function () {
        document.getElementById('wineSearch').value = '';
        document.getElementById('vintageInput').value = '';
        document.getElementById('bottlesInput').value = '';
        document.getElementById('outputText').textContent = '';
    });
};
