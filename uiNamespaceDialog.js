'use strict';

const defaultIntervalInMin = '5';
// Function to initialize extension and make Configure settings
(function () {
  let activeDatasourceIdList = [];

  $(document).ready(function () {
    tableau.extensions.initializeAsync({'configure': configure}).then(function () {
      tableau.extensions.settings.addEventListener(tableau.TableauEventType.SettingsChanged, (settingsEvent) => {
        updateExtensionBasedOnSettings(settingsEvent.newSettings);
      });
    });
  });

  function configure () {
    const popupUrl = `${window.location.origin}/Samples/UINamespace/uiNamespaceDialog.html`;
    tableau.extensions.ui.displayDialogAsync(popupUrl, defaultIntervalInMin, { height: 500, width: 500 }).then((closePayload) => {
      $('#inactive').hide();
      $('#active').show();

      $('#interval').text(closePayload);
      setupRefreshInterval(closePayload);
    }).catch((error) => {
      switch (error.errorCode) {
        case tableau.ErrorCodes.DialogClosedByUser:
          console.log('Dialog was closed by user');
          break;
        default:
          console.error(error.message);
      }
    });
  }

  /**
   * This function sets up a JavaScript interval based on the time interval selected
   * by the user. This interval will refresh all selected datasources.
   */
  function setupRefreshInterval (interval) {
    setInterval(function () {
      let dashboard = tableau.extensions.dashboardContent.dashboard;
      dashboard.worksheets.forEach(function (worksheet) {
        worksheet.getDataSourcesAsync().then(function (datasources) {
          datasources.forEach(function (datasource) {
            if (activeDatasourceIdList.indexOf(datasource.id) >= 0) {
              datasource.refreshAsync();
            }
          });
        });
      });
    }, interval * 60 * 1000);
  }

  /**
   * Helper that is called to set state anytime the settings are changed.
   */
  function updateExtensionBasedOnSettings (settings) {
    if (settings.selectedDatasources) {
      activeDatasourceIdList = JSON.parse(settings.selectedDatasources);
      $('#datasourceCount').text(activeDatasourceIdList.length);
    }
  }
})();

// Function after clicking the Configure button in the context menu
(function () {
  /**
   * This extension collects the IDs of each datasource the user is interested in
   * and stores this information in settings when the popup is closed.
   */
  const datasourcesSettingsKey = 'selectedDatasources';
  let selectedDatasources = [];

  $(document).ready(function () {
    tableau.extensions.initializeDialogAsync().then(function (openPayload) {
      $('#interval').val(openPayload);
      $('#closeButton').click(closeDialog);

      let dashboard = tableau.extensions.dashboardContent.dashboard;
      let visibleDatasources = [];
      selectedDatasources = parseSettingsForActiveDataSources();

      dashboard.worksheets.forEach(function (worksheet) {
        worksheet.getDataSourcesAsync().then(function (datasources) {
          datasources.forEach(function (datasource) {
            let isActive = (selectedDatasources.indexOf(datasource.id) >= 0);

            if (visibleDatasources.indexOf(datasource.id) < 0) {
              addDataSourceItemToUI(datasource, isActive);
              visibleDatasources.push(datasource.id);
            }
          });
        });
      });
    });
  });

  /**
   * Helper that parses the settings from the settings namesapce and
   * returns a list of IDs of the datasources that were previously
   * selected by the user.
   */
  function parseSettingsForActiveDataSources () {
    let activeDatasourceIdList = [];
    let settings = tableau.extensions.settings.getAll();
    if (settings.selectedDatasources) {
      activeDatasourceIdList = JSON.parse(settings.selectedDatasources);
    }

    return activeDatasourceIdList;
  }

  /**
   * Helper that updates the internal storage of datasource IDs
   * any time a datasource checkbox item is toggled.
   */
  function updateDatasourceList (id) {
    let idIndex = selectedDatasources.indexOf(id);
    if (idIndex < 0) {
      selectedDatasources.push(id);
    } else {
      selectedDatasources.splice(idIndex, 1);
    }
  }

  /**
   * UI helper that adds a checkbox item to the UI for a datasource.
   */
  function addDataSourceItemToUI (datasource, isActive) {
    let containerDiv = $('<div />');

    $('<input />', {
      type: 'checkbox',
      id: datasource.id,
      value: datasource.name,
      checked: isActive,
      click: function () { updateDatasourceList(datasource.id); }
    }).appendTo(containerDiv);

    $('<label />', {
      'for': datasource.id,
      text: datasource.name
    }).appendTo(containerDiv);

    $('#datasources').append(containerDiv);
  }

  /**
   * Stores the selected datasource IDs in the extension settings,
   * closes the dialog, and sends a payload back to the parent.
   */
  function closeDialog () {
    tableau.extensions.settings.set(datasourcesSettingsKey, JSON.stringify(selectedDatasources));

    tableau.extensions.settings.saveAsync().then((newSavedSettings) => {
      tableau.extensions.ui.closeDialog($('#interval').val());
    });
  }
})();
