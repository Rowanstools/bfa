let modelsData = [];

// Load the CSV data when the page loads
window.onload = function () {
    Papa.parse('models.csv', {
        download: true,
        header: true,
        complete: function (results) {
            modelsData = results.data.filter(model => model.description); // Ensure valid data
            console.log("Loaded Models Data:", modelsData); // Debugging check
        }
    });

    // Lookup functionality
    document.getElementById('lookupButton').addEventListener('click', performLookup);

    // Enable search filtering
    document.getElementById('descriptionSearch').addEventListener('input', function (e) {
        const query = e.target.value.toLowerCase().trim();
        const dropdown = document.getElementById('searchSuggestions');

        dropdown.innerHTML = ''; // Clear previous suggestions

        if (!query) {
            dropdown.style.display = 'none'; // Hide dropdown if search is empty
            return;
        }

        // Filter models based on search query
        const suggestions = modelsData.filter(model =>
            model.description && model.description.toLowerCase().includes(query)
        );

        if (suggestions.length) {
            dropdown.style.display = 'block'; // Show dropdown when matches exist

            suggestions.forEach(suggestion => {
                const option = document.createElement('div');
                option.textContent = suggestion.description;
                option.className = 'suggestion-item';

                option.addEventListener('click', function () {
                    const modelInput = document.getElementById('modelInput');
                    modelInput.value += modelInput.value ? `, ${suggestion.model_number}` : suggestion.model_number;

                    dropdown.innerHTML = ''; // Clear dropdown
                    dropdown.style.display = 'none'; // Hide dropdown
                    document.getElementById('descriptionSearch').value = ''; // Clear search box

                    performLookup(); // Perform lookup after selection
                });

                dropdown.appendChild(option);
            });
        } else {
            dropdown.style.display = 'none'; // Hide dropdown if no matches found
        }
    });

    // Hide search suggestions when clicking outside
    document.addEventListener('click', function (event) {
        const dropdown = document.getElementById('searchSuggestions');
        if (!event.target.closest('#descriptionSearch') && !event.target.closest('#searchSuggestions')) {
            dropdown.style.display = 'none';
        }
    });

    // Copy to Clipboard functionality
    document.getElementById('copyButton').addEventListener('click', function () {
        const outputElement = document.getElementById('outputText');
        const htmlContent = outputElement.innerHTML; // Preserve HTML formatting
    
        if (!htmlContent.trim()) {
            alert("No description to copy!");
            return;
        }
    
        // Use ClipboardItem to copy HTML content
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const clipboardItem = new ClipboardItem({ 'text/html': blob });
    
        navigator.clipboard.write([clipboardItem]).then(() => {
            alert('Description copied to clipboard with formatting.');
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    });
    

    // Clear All functionality
    document.getElementById('clearButton').addEventListener('click', function () {
        document.getElementById('modelInput').value = '';
        document.getElementById('limitedEditionInput').value = '';
        document.getElementById('descriptionSearch').value = '';
        document.getElementById('outputText').innerHTML = '';
        document.getElementById('copyButton').disabled = true; // Disable copy button after clearing
        document.getElementById('searchSuggestions').innerHTML = ''; // Clear dropdown
        document.getElementById('searchSuggestions').style.display = 'none'; // Hide dropdown
        
        // Uncheck checkboxes
        document.getElementById('baseCheckbox').checked = false;
        document.getElementById('boxCheckbox').checked = false;
        document.getElementById('certificateCheckbox').checked = false;
    });
};

// Function to perform the lookup
function performLookup() {
    const modelNumbers = document.getElementById('modelInput').value.trim().split(',').map(num => num.trim());
    const limitedEditionNumbers = document.getElementById('limitedEditionInput').value.trim().split(',').map(num => num.trim());
    const baseChecked = document.getElementById('baseCheckbox').checked;
    const boxChecked = document.getElementById('boxCheckbox').checked;
    const certificateChecked = document.getElementById('certificateCheckbox').checked;

    let outputs = [];
    let includeBorderFineArts = true;

    modelNumbers.forEach((modelNumber, index) => {
        const modelInfo = modelsData.find(model => model.model_number.toLowerCase() === modelNumber.toLowerCase());

        if (modelInfo) {
            let description = modelInfo.description;

            // Insert limited edition number if available
            if (limitedEditionNumbers[index]) {
                description = description.replace('*/', limitedEditionNumbers[index] + '/');
            }

            // Remove "Border Fine Arts" for all models except the first
            if (!includeBorderFineArts) {
                description = description.replace(/^Border Fine Arts\s*/, '');
            } else {
                includeBorderFineArts = false; // Only include for the first model
            }

            // Make the first part bold
            const firstCommaIndex = description.indexOf(',');
            if (firstCommaIndex !== -1) {
                const boldPart = description.substring(0, firstCommaIndex + 1);
                const restPart = description.substring(firstCommaIndex + 1);
                description = `<strong>${boldPart}</strong>${restPart}`;
            }

            // Ensure no trailing comma after the limited edition number
            description = description.replace(/(\d+\/\d+),?/, '$1');

            outputs.push(description);
        }
    });

    let finalOutput = '';
    if (outputs.length === 1) {
        finalOutput = outputs[0];
    } else if (outputs.length === 2) {
        finalOutput = `${outputs[0]} and ${outputs[1]}`;
    } else if (outputs.length > 2) {
        finalOutput = `${outputs.slice(0, -1).join(', ')}, and ${outputs[outputs.length - 1]}`;
    }

    // Handle checkbox combinations
    const checkboxOutput = getCheckboxOutput(baseChecked, boxChecked, certificateChecked, outputs.length);

    if (checkboxOutput) {
        if (finalOutput !== '') {
            if (!finalOutput.endsWith(',')) {
                finalOutput += `, ${checkboxOutput}`;
            } else {
                finalOutput += checkboxOutput;
            }
        } else {
            finalOutput = checkboxOutput;
        }
    }

    // Append count of models if more than one
    if (outputs.length > 1) {
        finalOutput += ` (${outputs.length})`;
    }

    finalOutput = finalOutput.replace(/^,\s*/, ''); // Remove leading comma if no models found

    document.getElementById('outputText').innerHTML = finalOutput;
    document.getElementById('copyButton').disabled = !finalOutput; // Enable copy if there's output
}

// Function to get the output string based on the checkbox states
function getCheckboxOutput(baseChecked, boxChecked, certificateChecked, numberOfModels) {
    let output = '';

    if (baseChecked && boxChecked && certificateChecked) {
        output = "on wood base, with box and certificate";
    } else if (baseChecked && boxChecked) {
        output = "on wood base, with box";
    } else if (baseChecked && certificateChecked) {
        output = "on wood base and with certificate";
    } else if (boxChecked && certificateChecked) {
        output = "with box and certificate";
    } else if (baseChecked) {
        output = "on wood base";
    } else if (boxChecked) {
        output = "with box";
    } else if (certificateChecked) {
        output = "with certificate";
    }

    if (numberOfModels > 1) {
        output = output.replace("box", "boxes").replace("certificate", "certificates").replace("on wood base", "on wood bases");
    }

    return output;
}
