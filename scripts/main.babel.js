const app = {}
app.loca = {};
app.filtered = []
app.destination = {}

app.selectedPlace = {};


app.displayLiked = () => {
	const userData = firebase.database().ref(`users/${app.userId.uid}`);

	const writeup = (img, title, website, phone) => {
		return `<div class="container">
				<img src="${img}">
				<div class="content">
					<h1 class="place_title">${title}</h2>
					<hr>
					<h2 class="website">${website}</h2>
					<hr>
					<h2 class="phone">${phone}</h2>
				</div>
			</div>
			<hr class="content_divider">`
	
	}

	userData.on('value', function(snapshot) {
		const data = snapshot.val();
		var array = $.map(data, function(value, index){
			return value;
		}).reverse();
		console.log(array);

		if(array.length == 0){
			$('#liked_content').append(`<h1>You did't like anything yet</h1>`)
		} else {
			array.forEach(function(item){
				$('#liked_content').append(writeup(" ", item.venue.name, item.venue.url, item.venue.contact.phone));
				
			})
		}
	});
}

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

	$('#section2 .place_title').text(selected.venue.name);
	$('#section2 #distance').text(`${selected.venue.location.distance}m`);
	$('#section2 .rating').text(selected.venue.rating);
	$('#section2 #price').text(priceTier);
	$('#section2 #website').text(selected.venue.url);
	$('#section2 #phone').text(selected.venue.contact.phone);

	

	if(selected.tips.length > 0){
		$('#tip h3').text(selected.tips[0].text);
	} 	

	app.mapArray();
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
	}).then(function(data){
		const placeimage = `${data.response.photos.items[0].prefix}${data.response.photos.items[0].width}x${data.response.photos.items[0].height}${data.response.photos.items[0].suffix}`;
		$('#img_container').css("background-image", `url('${placeimage}')`);
	})
}

app.pickRandom = (array) => {
	let randomNum = Math.floor(Math.random() * app.filtered.length)
	if(app.filtered.length > 0){
		app.selectedPlace = app.filtered[randomNum];
	} else {
		swal(`Couldn't find any Nice Place for you`);
	}
	console.log(app.filtered);
	console.log(app.filtered[randomNum]);	
}

app.filterResult = (data) => {
	app.filtered = data.filter((data) => {
		return data.venue.rating > 8.5;
	})
}

app.mapArray = () => {
	const index = app.filtered.indexOf(app.selectedPlace);
	const newArray = app.filtered.splice(index,1);
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
			// openNow: 1,
			v: 20171120
		}
	}).then(function(data){
		
		app.filterResult(data.response.groups["0"].items);
	}).then(function(){
		app.pickRandom(app.filtered);
	}).then(function(){
		app.place(app.selectedPlace);
		app.getImage(app.selectedPlace);
		// app.mapArray();
		
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

app.dataBase = () => {

	const config = {
		apiKey: "AIzaSyCsA8GKOpORb7xuyhUNH7JhDtFWzJ6IYWg",
	    authDomain: "project3-f7eba.firebaseapp.com",
	    databaseURL: "https://project3-f7eba.firebaseio.com",
	    projectId: "project3-f7eba",
	    storageBucket: "project3-f7eba.appspot.com",
	    messagingSenderId: "925278152263"
	}

	firebase.initializeApp(config);
	const database = firebase.database();

	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
		    app.userId = firebase.auth().currentUser;
		} else {
		// No user is signed in.
		}
	});	
}

app.Log = (type) => {
	if ( type == "facebook"){
		var provider = new firebase.auth.FacebookAuthProvider();
	} else if ( type == "google"){
		var provider = new firebase.auth.GoogleAuthProvider();
	} else if ( type == "github"){
		var provider = new firebase.auth.GithubAuthProvider();
	}

	console.log({provider});

	firebase.auth().onAuthStateChanged(function(user) {	

	console.log({user});
	

		if (!user && window.location.pathname == '/') { 
			firebase.auth().signInWithPopup(provider).then(function(result) {
			// This gives you a Google Access Token. You can use it to access the Google API.
				var token = result.credential.accessToken;
				// The signed-in user info.
				app.userId = result.user;
				console.log("push");
				console.log({result});
				// ...
			}).catch(function(error) {
				console.log({error});
				// Handle Errors here.
				var errorCode = error.code;
				var errorMessage = error.message;
				// The email of the user's account used.
				var email = error.email;
				// The firebase.auth.AuthCredential type that was used.
				var credential = error.credential;
				// ...
			});
		} else if ( user && window.location.pathname == '/'){
			window.location = 'app.html';

		} else if ( !user && window.location.pathname == '/app.html'){
			window.location = '/';
		}
		
	});
}

app.eventFire = () => {
	const $s3back = $('#section3 .btnblue');
	const $s2direction = $('#section2 .btnblue');
	const $s2change = $('#section2 .btnwhite:first-child');
	const $s2another = $('#section2 .btnwhite:last-child');
	const $s2like = $('#like');
	const $s1food = $('.foodbtn');

	const $shlog = $('#log_in');
	const $shliked = $('#liked');
	const $shhistory = $('#history');

	const $segoogle = $('#loginSection > div');


	$s2like.on("click", function(){
		$(this).addClass('animation');
		firebase.database().ref(`/users/${firebase.auth().currentUser.uid}`).push(app.selectedPlace);
		setTimeout(function(){
			$s2like.removeClass('animation');
		},2000);
		
		console.log("saved");
	})

	$s3back.on("click", () => {
		$('#section2').fadeToggle();
		$('#section3').fadeToggle();
		$('#map').empty();
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
		const action = new Promise (function (resolve){
			$('#section2').fadeOut();
			// setTimeout(function(){
				resolve()
			// },2000);
		}).then(function(){
			app.pickRandom(app.filtered);
			app.place(app.selectedPlace);
			app.getImage(app.selectedPlace);
		}).then(function(){
			$('#section2').fadeIn();
			console.log("clicked")
		})
		
	})

	$s1food.on("click", function(){
		const $selection = $(this).data('type');

		app.location().then((resolve) =>{
			app.fourSquare(app.loca, $selection)
		})
		$('#section2').fadeToggle();
		$('#section1').fadeToggle();
	})

	$shlog.on("click",function(){
		console.log("clicked")
		if (window.location.pathname != '/' ){
			firebase.auth().signOut().then(function() {
				window.location = '/';
				console.log("logedout");
			}).catch(function(error) {
			  console.log(error);
			});
		}
	})

	$segoogle.on("click", function(){
		let selected = $(this).data('log');
		console.log(selected);
		app.Log(selected);
	})

	$shliked.on("click", function(){
		$('#liked_content').empty();
		$('#section2').fadeToggle();
		$('#liked_content').fadeToggle();
		$('#liked_content').toggleClass('active');
		app.displayLiked();	

		if($('#liked_content').hasClass('active')){
			$('#liked').empty()
			$('#liked').append(`<i class="fas fa-times-circle fa-2x"></i>`);
		} else {
			$('#liked').empty()
			$('#liked').append(`<i class="fas fa-thumbs-up fa-2x"></i>`);
			
		}
	})

	$shhistory.on("click", function(){
		$('#history_content').toggleClass('active');
		if($('#history_content').hasClass('active')){
			$('#history').empty()
			$('#history').append(`<i class="fas fa-times-circle fa-2x"></i>`);
		} else {
			$('#history').empty()
			$('#history').append(`<i class="fas fa-history fa-2x"></i>`);
			
		}
	})
}

app.init = () => {
	app.dataBase();
}
$(function() {
	app.init();
	app.eventFire();
});