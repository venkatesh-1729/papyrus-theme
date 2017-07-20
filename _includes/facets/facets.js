function setupVis() {
    var fileupload1 = $("#fileupload1")[0];
    var fileupload2 = $("#fileupload2")[0];
    var data_from;
    var slot;
    $("#uploadbutton1")[0].onclick = function() {
        data_from = fileupload1;
        slot = 1;
        fileupload1.click();
    };
    $("#uploadbutton2")[0].onclick = function() {
        data_from = fileupload2;
        slot = 2;
        fileupload2.click();
    };
    var readFiles = function (obj) {
      var count = obj.files.length;
      var datasetsList = [];

      var whendone = function(obj) {
        var overview = $("#foelem")[0];
        var dive = $("#fdelem")[0];
        if(slot==1){
          var proto = overview.getStatsProto(datasetsList);
          overview.protoInput = proto;
        }
        if(slot==2){
          if (datasetsList.length < 2) {
            dive.data = datasetsList[0].data;
          } else {
            var newFeatureForDive = 'csv-source';
            var columns = datasetsList.length > 0 ? datasetsList[0].data.columns : [];
            while (columns.indexOf(newFeatureForDive) > -1) {
              newFeatureForDive = newFeatureForDive + newFeatureForDive;
            }
            datasetsList.forEach(function(dataset) {
              dataset.data.forEach(function(datapoint) {
                datapoint[newFeatureForDive] = dataset.name;
              });
            });
            var alldata = datasetsList.reduce(function(a, b){
              return a.concat(b.data);
            }, []);
            dive.data = alldata;
            dive.colorBy = newFeatureForDive;
          }
        }
      }
      var readFile = function(file) {
        var reader = new FileReader();
        reader.onload = function() {
          var parsedData = d3.csvParse(reader.result);
          parsedData.forEach(function(row) {
            parsedData.columns.forEach(function(column) {
              var coercedNum = +row[column];
              if (!isNaN(coercedNum)) {
                row[column] = coercedNum;
              }
            });
          });
          datasetsList.push({data: parsedData, name: file.name});
          if (!--count) {
            whendone();
          }
        }
        reader.readAsBinaryString(file);
      };

      for (var i = 0; i < count; i++) {
        readFile(data_from.files[i]);
      }
    }
    fileupload1.addEventListener('change', function(){ readFiles(data_from); });
    fileupload2.addEventListener('change', function(){ readFiles(data_from); });
    $.when(trainAjax(), testAjax()).done(function(trainAjax, testAjax) {
      var overview = $("#foelem")[0];
      var proto = overview.getStatsProto([
        {data: trainAjax[0], name: "train"},
        {data: testAjax[0], name: "test"}]);
      overview.protoInput = proto;

      $("#fdelem")[0].data = testAjax[0];
    });
    function trainAjax() {
      return $.getJSON({url: "/data/facets/train.json"});
    }
    function testAjax() {
      return $.getJSON({url: "/data/facets/test.json"});
    }
  }

  window.addEventListener('WebComponentsReady', function() {
      var dive = document.createElement("facets-dive");
      dive.id = "fdelem";
      $(".facets-dive-demo")[0].appendChild(dive);

      var overview = document.createElement("facets-overview");
      overview.id = "foelem";
      $(".facets-ov-demo")[0].appendChild(overview);

      setupVis();
  });
