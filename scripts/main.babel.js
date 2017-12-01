const app = {}
app.loca = {};
app.filtered = []
app.destination = {}


app.place = (selected) => {

	app.destination = {
		lat: selected.venue.location.lat,
		lng: selected.venue.location.lng
	}

	let priceTier = ''

	if (selected.venue.price.tier == 1){
		priceTier = '$'
	} else if (selected.venue.price.tier = 2){
		priceTier = '$$'
	} else {
		priceTier = '$$$'
	}

	let imgUrl = ''

	if(selected.venue.photos.count == 0){
		imgUrl = 'assets/img/noimage.jpg'
	}else{
		imgUrl = selected.venue.photos.groups[0].url
	}

	console.log(selected)
	$('#img_container').css("background-image", `url('${imgUrl}')`);

	$('#place_title').text(selected.venue.name);
	$('#distance').text(`${selected.venue.location.distance}m`);
	$('#rating').text(selected.venue.rating);
	$('#price').text(priceTier);
	$('#website').text(selected.venue.url);
	$('#phone').text(selected.venue.contact.phone);

	$('#tip h3').text(selected.tips[0].text);
}

app.getImage = (selected) => {
	$.ajax({
		url: `https://api.foursquare.com/v2/venues/${selected.venue.id}/photos`,
  		method: 'GET',
  		dataType: "json",
  		data: {
			client_id: "VH42GH0DFNZLHDRYB4JULCZIPHD3DA4DUCKVPVBMJQIX350R",
			client_secret: "DLDPDU4LK3ZAGTLHFQLC2JEDGNR01X1MCRRS1NF3VQPV22VL",
			v: 20171120
		}
	}).fail(function(err){
		console.log(err);
	}).done(function(data){
		console.log(data.response.photos.items[0])
		$('#img_container').css("background-image", `url('${data.response.photos.items[0].prefix}${data.response.photos.items[0].suffix.substr(1)}')`);
		// for (let i = 0; i < data.response.photos.items.length; i++){
			// const markUp = `<div class="carousel-cell"><img class="carousel-cell-image"
		//    data-flickity-lazyload="${data.response.photos.items[0].prefix}${data.response.photos.items[0].suffix.substr(1)}" /></div>`
      // console.log(markUp)
			// $('.main-carousel').appendTo(markUp);
		// }
	})
}

app.pickRandom = (array) => {
	const randomNum = Math.floor(Math.random() * array.length)
	if(array.length > 0){
		app.place(array[randomNum]);
		// app.getImage(array[randomNum]);
	} else {
		swal(`Couldn't find any Nice Place for you`);
	}
}

app.filterResult = (data) => {
	app.filtered = data.filter((data) => {
		return data.venue.rating > 8.5;
	})
}

app.googleMaps = (loca, desti) => {
	app.googleKey = "AIzaSyB6UumqnkB2X99K9Eeef_RzAQSENqA3I0k";

	let map;
	var markerArray = [];

	const origin = new google.maps.LatLng(loca.lat, loca.long);
	const destination = new google.maps.LatLng(desti.lat,desti.lng);
	const map_container = $('#map')[0];
	const mapInfo = {
		center: {
			lat: loca.lat,
			lng: loca.long
		},
		zoom: 20
			// styles: options
		}

	// Instantiate a directions service.
	var directionsService = new google.maps.DirectionsService;

	map = new google.maps.Map(map_container, mapInfo);
	// home = new google.maps.Marker({
	// 	position: new google.maps.LatLng(mapInfo.center.lat, mapInfo.center.lng),
	// 	map:map
	// });

	// Create a renderer for directions and bind it to the map.
    var directionsDisplay = new google.maps.DirectionsRenderer({map: map});

    // Instantiate an info window to hold step text.
    var stepDisplay = new google.maps.InfoWindow;
    // Display the route between the initial start and end selections.
	calculateAndDisplayRoute(directionsDisplay, directionsService, markerArray, stepDisplay, map);

	function calculateAndDisplayRoute(directionsDisplay, directionsService,
	  markerArray, stepDisplay, map) {
		// First, remove any existing markers from the map.
		for (var i = 0; i < markerArray.length; i++) {
		  markerArray[i].setMap(null);
		}

	// Retrieve the start and end locations and create a DirectionsRequest using
	// WALKING directions.
		directionsService.route({
			origin: origin,
			destination: destination,
			travelMode: 'WALKING'
		}, function(response, status) {
			// Route the directions and pass the response to a function to create
			// markers for each step.
			if (status === 'OK') {
				// document.getElementById('warnings-panel').innerHTML =
			 //    '<b>' + response.routes[0].warnings + '</b>';
				directionsDisplay.setDirections(response);
				showSteps(response, markerArray, stepDisplay, map);
			} else {
				window.alert('Directions request failed due to ' + status);
			}
		});
	}

	function showSteps(directionResult, markerArray, stepDisplay, map) {
		// For each step, place a marker, and add the text to the marker's infowindow.
		// Also attach the marker to an array so we can keep track of it and remove it
		// when calculating new routes.
		var myRoute = directionResult.routes[0].legs[0];
		for (var i = 0; i < myRoute.steps.length; i++) {
			var marker = markerArray[i] = markerArray[i] || new google.maps.Marker;
			marker.setMap(map);
			// marker.setPosition(myRoute.steps[i].start_location);
			// attachInstructionText(stepDisplay, marker, myRoute.steps[i].instructions, map);
		}
	}

	function attachInstructionText(stepDisplay, marker, text, map) {
		google.maps.event.addListener(marker, 'click', function() {
		// Open an info window when the marker is clicked on, containing the text
		// of the step.
			stepDisplay.setContent(text);
			stepDisplay.open(map, marker);
		});
	}
}

app.fourSquare = (loca, what) => {
	app.clientId = "VH42GH0DFNZLHDRYB4JULCZIPHD3DA4DUCKVPVBMJQIX350R";
	app.clientSecret = "DLDPDU4LK3ZAGTLHFQLC2JEDGNR01X1MCRRS1NF3VQPV22VL";
	$.ajax({
		url: 'https://api.foursquare.com/v2/venues/explore',
  		method: 'GET',
  		dataType: "json",
  		data: {
			client_id: "VH42GH0DFNZLHDRYB4JULCZIPHD3DA4DUCKVPVBMJQIX350R",
			client_secret: "DLDPDU4LK3ZAGTLHFQLC2JEDGNR01X1MCRRS1NF3VQPV22VL",
			ll: `${loca.lat},${loca.long}`,
			// section: "food",
			radius: 1500,
			query: `${what}`,
			openNow: 1,
			v: 20171120
		}
	}).fail(function(err){
		console.log(err);
	}).done(function(data){
		app.filterResult(data.response.groups["0"].items);
	}).then(() =>{
		app.pickRandom(app.filtered);
	})
}

app.location = () => {
	return new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition((position) =>{
			resolve(position);	
			app.loca = {
				lat: position.coords.latitude,
				long: position.coords.longitude,
			}
		})
	})
}

app.init = () => {
	// $('.main-carousel').flickity({  
	// });
}

app.eventFire = () => {
	const $s3back = $('#section3 .btnblue');
	const $s2direction = $('#section2 .btnblue');
	const $s2change = $('#section2 .btnwhite:first-child');
	const $s2another = $('#section2 .btnwhite:last-child');
	const $s1food = $('.foodbtn');

	$s3back.on("click", () => {
		$('#section2').fadeToggle();
		$('#section3').fadeToggle();
	})

	$s2direction.on("click", () => {
		app.googleMaps(app.loca, app.destination);
		$('#section3').fadeToggle();
		$('#section2').fadeToggle();

	})

	$s2change.on("click", () => {
		$('#section1').fadeToggle();
		$('#section2').fadeToggle();
	})

	$s2another.on("click", () => {
		app.pickRandom(app.filtered)
		
	})

	$s1food.on("click", function(){
		const $selection = $(this).data('type');
		console.log($selection);

		app.location().then((resolve) =>{
			app.fourSquare(app.loca, $selection)
		})
		

		$('#section2').fadeToggle();
		$('#section1').fadeToggle();
	})
}

$(function() {
	app.init();
	app.eventFire();
});