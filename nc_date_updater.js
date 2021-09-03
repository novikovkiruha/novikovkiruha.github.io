let settings;
let dateParameters = [];

// Extension initialization
(function() {
    $(document).ready(function() {
        const table = $('#parameterTable');
        const tableBody = table.children('tbody');

        // This function is called when the extension is initialized
        tableau.extensions.initializeDialogAsync().then(function(openPayload) {
            tableau.extensions.dashboardContent.dashboard.getParametersAsync().then(function(parameters) {
                parameters.forEach(function(parameter) {
<<<<<<< HEAD
                    parameter.addEventListener(tableau.TableauEventType.ParameterChanged, onParameterChange);
=======
                    // parameter.addEventListener(tableau.TableauEventType.ParameterChanged, onParameterChange);
>>>>>>> parent of 55761d3 (work changes)
                    parameterRow(parameter).appendTo(tableBody);

                    if (parameter.dataType === "date" || parameter.dataType === "date-time") {
                        dateParameters.push(parameter.name);
                    }
                });
                
                $('#loading').addClass('hidden');
                
                if (parameters.length === 0) {
                    $('#addParameterWarning').removeClass('hidden').addClass('show');
                } else {
                    $('#parameterTable').removeClass('hidden').addClass('show');
                }
                
                // Dinamyc parameter update if the extension has global settings
                if (Object.keys(tableau.extensions.settings.getAll()).length > 0) {
                    settings = tableau.extensions.settings.getAll();
                    let settingsKeys = Object.keys(settings);
                    let settingsValues = Object.values(settings);
           
                    for (var i = 0; i < settingsKeys.length; i++) {
                        alert("Settings");
                        updateParameter(settingsKeys[i], settingsValues[i]);
                        document.getElementById(settingsKeys[i]).value = settingsValues[i];
                    }
                }
            });
        });
    });

    // Event function that change of parameter value
<<<<<<< HEAD
    // function onParameterChange(parameterChangeEvent) {
    //     parameterChangeEvent.getParameterAsync().then(function(parameter) {
    //         alert("Event");
    //         document.getElementById(`${parameter.id}`).innerText = parameter.currentValue.formattedValue;
    //     });
    // }
=======
    function onParameterChange(parameterChangeEvent) {
        parameterChangeEvent.getParameterAsync().then(function(parameter) {
            alert("Event");
            document.getElementById(`${parameter.id}`).innerText = parameter.currentValue.formattedValue;
        });
    }
>>>>>>> parent of 41a2cbd (columns deleting)
    
    // Name and Data Type columns filling
    function textCell(value) {
        const cellElement = $("<td>");
        cellElement.text(value);
            
        return cellElement;
    }

    // Current Value column filling
    function valueCell(value, id) {
        const cellElement = $(`<td id="${id}">`);
        cellElement.text(value);
            
        return cellElement;
    }
    
    // Custom Value column filling
    function inputCell(id) {
        const row = $("<td>").append(`<input id="${id}" placeholder="set custom date value here..." style="width: 250px;">`);
            
        return row;
    }

    // Parameters table filling
    function parameterRow(parameter) {
        let row = $(`<tr>`);
        
        if (parameter.dataType === "date" || parameter.dataType === "date-time") {
            row.append(textCell(parameter.name));
            row.append(textCell(parameter.dataType));
            row.append(valueCell(parameter.currentValue.formattedValue, parameter.id));
            row.append(inputCell(parameter.name));
        }

        return row;
    }
})();

// This function is called when the Apply Auto-refresh button is clicked
(function() {
    $(document).ready(function() {
        $("#autoRefreshButton").click(function() {            
            for (var i = 0; i < dateParameters.length; i++) {
                var inputDate = document.getElementById(dateParameters[i]).value;
                if (inputDate !== "") {
                    updateParameter(dateParameters[i], inputDate);
                }
            }

            alert("Apply button");
            tableau.extensions.settings.saveAsync();
        });
    });
})();

// Function that update the current value of the parameter according to moment.js library expression.
// It is called during extension initialization and after the clicking the Apply Auto-udpate button
function updateParameter(parameterName, parameterValue) {
    try {
        tableau.extensions.initializeAsync().then(function() {
            tableau.extensions.dashboardContent.dashboard.findParameterAsync(parameterName).then(function(parameter) {
                parameter.changeValueAsync(eval(`moment${parameterValue}`).format('YYYY-MM-DD'));
            });
        });
        
        if (parameterValue !== "") {
            tableau.extensions.settings.set(parameterName, parameterValue);
        }
    } catch (e) {
        alert(e);
    }
};