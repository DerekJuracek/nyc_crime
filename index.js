const mapConfig = {
  newObjectId: null,
};

require([
  "esri/config",
  "esri/WebMap",
  "esri/layers/FeatureLayer",
  "esri/views/MapView",
  "esri/widgets/Feature",
  "esri/core/promiseUtils",
  "esri/widgets/Sketch",
  "esri/Graphic",
  "esri/layers/GraphicsLayer",
  "esri/widgets/Home",
  "esri/widgets/Expand",
  "esri/widgets/Legend",
], (
  esriConfig,
  WebMap,
  FeatureLayer,
  MapView,
  Feature,
  promiseUtils,
  Sketch,
  Graphic,
  GraphicsLayer,
  Home,
  Expand,
  Legend
) => {
  esriConfig.apiKey =
    "AAPKa00357ac596c4526a5a150c54634c8dbtbEsP1xHa3X68Xs0gqUrrP-yPU5u3tuYkN5jhLC5bOOOjyycCGwQFxevruIKgg68";

  const map = new WebMap({
    portalItem: {
      // autocasts as new PortalItem
      id: "7811c4cf27ed46ba92b877e2719f82dc",
    },
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    zoom: 10,
    popup: {
      autoOpenEnabled: false,
    },
    highlightOptions: {
      haloOpacity: 0.9,
      fillOpacity: 0,
    },
  });

  let fLayer;
  let firstDropdownFilterApplied = false;
  let option2;

  // here the first combobox for arrest boroughs is being built

  let fieldName = "arrest_bor";
  let fieldName2 = "arrest_pre"; // replace with your field name
  let featureLayer = new FeatureLayer({
    url: `https://services8.arcgis.com/iwUICPhW6IlV9RNt/ArcGIS/rest/services/nypd_arrest_data_2023/FeatureServer/0`,
  }); // replace with your layer URL

  // where the acutal filter with where clause are applied to layerView
  const addLayerQuery = function (query) {
    view.whenLayerView(fLayer).then((layerView) => {
      const fLayerView = layerView;
      const filter = {
        where: query.where,
        geometry: query.geometry,
        spatialRelationship: query.spatialRelationship,
      };
      fLayerView.filter = filter;
    });
  };

  // Query for both dropdowns
  let query = featureLayer.createQuery();
  query.where = "1=1"; // This gets all features
  query.returnGeometry = false;
  query.outFields = [fieldName, fieldName2];

  const setSecondDropdownOptions = function (stringVals) {
    let query = fLayer.createQuery();
    query.where = `${fieldName} IN (${stringVals})`;
    query.outFields = [fieldName2];

    // Query the features that match the selected values
    fLayer.queryFeatures(query).then(function (results) {
      let uniqueValues = [];
      let features = results.features;

      // Get the unique values for the second dropdown
      for (let i = 0; i < features.length; i++) {
        let fieldValue = features[i].attributes[fieldName2];
        if (!uniqueValues.includes(fieldValue)) {
          uniqueValues.push(fieldValue);
        }
      }
      // Clear the current options in the second dropdown
      let secondDropdown = document.getElementById("arrest-precint");
      secondDropdown.innerHTML = "";

      if (option2) {
        document
          .getElementById("arrest-precint")
          .removeEventListener("calciteComboboxChange");
      }

      uniqueValues.forEach((value) => {
        let option3 = document.createElement("calcite-combobox-item");
        option3.value = value;
        option3.textLabel = value;
        secondDropdown.appendChild(option3);
        console.log(`List 3 is firing`);
      });
    });
  };

  featureLayer.queryFeatures(query).then(function (results) {
    let uniqueValues2 = [];
    let features = results.features;
    console.log(features);
    for (let i = 0; i < features.length; i++) {
      let fieldValue2 = features[i].attributes[fieldName2];
      if (!uniqueValues2.includes(fieldValue2)) {
        uniqueValues2.push(fieldValue2);
      }
    }

    uniqueValues2.forEach((value) => {
      option2 = document.createElement("calcite-combobox-item");
      option2.value = value;
      option2.textLabel = value;
      const arrestPre = document
        .getElementById("arrest-precint")
        .appendChild(option2);
    });

    document
      .getElementById("arrest-precint")
      .addEventListener("calciteComboboxChange", function (event) {
        // console.log(`List 2 is firing`);
        let choices2 = [];
        let selectedValue2 = event.target.value;
        choices2.push(...selectedValue2);

        selectedValString2 = choices2.map((value) => `${value}`).join(",");
        // console.log(selectedValString);
        let query2 = fLayer.createQuery();
        // query2.where = `${fieldName2} IN (${selectedValString2})`;
        query2.outFields = ["*"];
        if (firstDropdownFilterApplied) {
          setSecondDropdownOptions(selectedValString);

          // If the first dropdown filter has been applied, add it to the query
          query2.where = `${fieldName} IN (${selectedValString}) AND ${fieldName2} IN (${selectedValString2})`;
        } else {
          // If the first dropdown filter has not been applied, only filter by the second dropdown
          query2.where = `${fieldName2} IN (${selectedValString2})`;
        }
        addLayerQuery(query2);
      });
  });

  featureLayer.queryFeatures(query).then(function (results) {
    let uniqueValues1 = [];

    let features = results.features;
    console.log(features);
    for (let i = 0; i < features.length; i++) {
      let fieldValue = features[i].attributes[fieldName];

      if (!uniqueValues1.includes(fieldValue)) {
        uniqueValues1.push(fieldValue);
      }
    }

    let option1;

    uniqueValues1.forEach((value) => {
      option1 = document.createElement("calcite-combobox-item");
      option1.value = value;
      option1.textLabel = value;
      const arrestBor = document
        .getElementById("arrest-borough")
        .appendChild(option1);
    });

    document
      .getElementById("arrest-borough")
      .addEventListener("calciteComboboxChange", function (event) {
        let choices = [];
        let selectedValue = event.target.value;
        choices.push(...selectedValue);

        selectedValString = choices.map((value) => `'${value}'`).join(",");
        // console.log(selectedValString);
        let query = fLayer.createQuery();
        query.where = `${fieldName} IN (${selectedValString})`;
        query.outFields = ["*"];
        // console.log(query.where);
        firstDropdownFilterApplied = true;
        setSecondDropdownOptions(selectedValString);
        addLayerQuery(query);
      });
  });

  view.when().then(() => {
    let mapL = map.allLayers.items;
    mapL.forEach((layer) => {
      if (layer.title === "NYPD Arrest Data 2023 - nypd arrest data 2023") {
        fLayer = layer;
        console.log(fLayer);
      }
    });

    // Create a default graphic for when the application starts
    const graphic = {
      popupTemplate: {
        content: "Click on the Crimes to Learn More About them.",
      },
    };

    // Provide graphic to a new instance of a Feature widget
    const feature = new Feature({
      container: "feature-node",
      graphic: graphic,
      map: view.map,
      spatialReference: view.spatialReference,
    });

    view.whenLayerView(fLayer).then((layerView) => {
      let highlight;
      let objectId;
      // let startGraphic = new Graphic();

      // const loadStatDiv = function () {
      //   highlight?.remove();
      //   const startObjectId = 53975;
      //   feature.graphic = startGraphic;
      //   highlight = layerView.highlight(startGraphic);
      // };

      // loadStatDiv();

      const debouncedUpdate = promiseUtils.debounce(async (event) => {
        // Perform a hitTest on the View
        const hitTest = await view.hitTest(event);
        // Make sure graphic has a popupTemplate
        const results = hitTest.results.filter((result) => {
          return result.graphic.layer.popupEnabled;
        });

        const result = results[0];
        console.log(result);

        if ((mapConfig.newObjectId = null)) {
          mapConfig.newObjectId = 53975;
        } else {
          mapConfig.newObjectId =
            result && result.graphic.attributes[fLayer.objectIdField];
        }

        if (!mapConfig.newObjectId) {
          highlight?.remove();
          objectId = feature.graphic = null;
        } else if (objectId !== mapConfig.newObjectId) {
          highlight?.remove();
          objectId = mapConfig.newObjectId;

          console.log(objectId);
          feature.graphic = result.graphic;
          highlight = layerView.highlight(result.graphic);
        }
      });
      // Listen for the pointer-move event on the View
      view.on("click", (event) => {
        debouncedUpdate(event).catch((err) => {
          if (!promiseUtils.isAbortError(err)) {
            throw err;
          }
        });
      });
    });
  });

  let homeWidget = new Home({
    view: view,
  });

  // adds the home widget to the top left corner of the MapView
  view.ui.add(homeWidget, "top-left");

  var audio = new Audio("bad_boys.mp3"); // replace with your sound file

  document.getElementById("badButton").addEventListener("click", function () {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  });

  let legend = new Legend({
    view: view,
  });

  const legendExpand = new Expand({
    view: view,
    content: legend,
    icon: "annotate-tool",
  });

  view.ui.add(legendExpand, "bottom-right");

  const graphicsLayer = new GraphicsLayer();
  map.add(graphicsLayer);

  let draw = new Sketch({
    view: view,
    layer: graphicsLayer,
    creationMode: "update",
  });
  console.log(draw);

  view.ui.add(draw, "top-right");
  view.ui.add(badButton, "bottom-left");

  let queryDiv = document.getElementById("sketchDiv");

  function queryFeatures(geometry) {
    console.log(`we firing cuz`);
    let query = fLayer.createQuery(); // Create a new query object
    query.geometry = geometry; // Use the input geometry for the query
    query.spatialRelationship = "intersects"; // Only return features that intersect the geometry

    const mainList = document.getElementById("ticketQueries");

    fLayer.queryFeatures(query).then(function (results) {
      let totalResults = results.features;
      totalResults.forEach((result) => {
        const item1 = document.createElement("calcite-list-item");
        item1.value = result.attributes.arrest_key;
        item1.label = `Police Ticket Number: ${result.attributes.arrest_key}`;

        const action = document.createElement("calcite-action");
        action.slot = "actions-end";
        action.icon = "layer-zoom-to";
        action.text = "zoom to";
        item1.appendChild(action);

        mainList.appendChild(item1);

        let currentHighlight;

        action.addEventListener("click", () => {
          view.whenLayerView(fLayer).then((layerView) => {
            if (currentHighlight) {
              console.log(currentHighlight);
              currentHighlight.remove();
            }
            // Set the new highlight
            currentHighlight = layerView.highlight(result);
            console.log(currentHighlight);
            // set the highlight on the first feature returned by the query
          });
          // console.log(result.attributes);
          view.goTo({
            target: result.geometry,
            zoom: 17,
          });
        });
      });

      // logic to build sql (server-side) query

      // console.log(results);

      // This function runs when the promise resolves and the results are available
      // results.features contains the features that were found by the query
      // You can now do something with these features
    });
  }

  draw.on("update", function (event) {
    if (event.state === "complete") {
      console.log(event);
      queryFeatures(event.graphics[0].geometry);
    }
  });
});
