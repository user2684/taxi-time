// Disable form submissions if there are invalid fields
(() => {
  'use strict'
  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')
  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()

// store taxi in/out information once retrieved
var taxi_in_database = {};
var taxi_out_database = {}

// update the select id with the content retrieved from the given url and store the results in the database
function update_airports(id, url, database) {
  // fetch the data from the url
  $.get(url, function(data) {
    // convert the csv into an object
    var items = $.csv.toObjects(data);
    // for each airport add it to the select
    for (i = 0; i < items.length; i++) {
      var item = items[i];
      var item_id = item["ICAO"];
      // skip malformed items
      if (item_id.length != 4) continue;
      // store it in the database
      database[item_id] = item;
      // do not add it if already there
      if ($('#'+id).find("option[value='" + item_id + "']").length) continue;
      // add the option to the select
      var newOption = new Option(item["ICAO"]+"/"+item["IATA"]+" ("+item["Airport Name"]+")", item_id, false, false);
      $('#'+id).append(newOption);
    }
  }, "text");
}

// reload the data if season is changed
function reload_data() {
  // get the selected season
  var season = $('input[name="season"]:checked').val()
  // empty the databases
  taxi_in_database = {}
  taxi_out_database = {}
  // update departure and arrival airport select
  update_airports("departure","data/taxi-out-"+season+".csv", taxi_out_database)
  update_airports("arrival","data/taxi-in-"+season+".csv", taxi_in_database)
}

// update the taxi time
function update_taxi_time(id, database, target) {
  var item_id = $('#'+id).select2('data')[0]["id"];
  if (database[item_id] === undefined) return;
  var item = database[item_id];
  var median = Number(item["Median"]);
  var best = Number(item["10th Pctl"]);
  var worst = Number(item["90th Pctl"]);
  $('#taxi_'+target+'_average').html(median+" minutes");
  $('#taxi_'+target+'_range').html(best+"-"+worst+" minutes");
}

// calculate taxi in and out time
function calculate_taxi_times() {
  update_taxi_time("departure", taxi_out_database, "out");
  update_taxi_time("arrival", taxi_in_database, "in");
}


// initialize the form once the document is ready
$( document ).ready(function() {
  // use select2 for departure and arrival select
  $('#departure').select2({theme: 'bootstrap-5'});
  $('#arrival').select2({theme: 'bootstrap-5'});
  // when the season is changed, reload the data
  $('input[type=radio][name=season]').change(function() {
    reload_data();  
  });
  // when the button is clicked, calculate
  $( "#calculate" ).on( "click", function() {
    calculate_taxi_times();
  });
  // load the data
  reload_data();
});

