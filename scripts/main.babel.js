const app = {}
app.loca = {};
app.filtered = []
app.destination = {}
app.selected = {}
app.selectedPlace = {};
app.selectedImage = {};
app.foodType = {}


app.baseURL = `restaurant_roulette/`;
let map;

app.displayDatabase = (display) => {
	let userData;
	if(display == 'liked'){
		userData = firebase.database().ref(`users/${app.userId.uid}/${display}`);	
	} else {
		userData = firebase.database().ref(`users/${app.userId.uid}/${display}`).limitToLast(10);
	}

	userData.on('value', function(snapshot) {
		const data = snapshot.val();
		var array = $.map(data, function(value, index){
			return value;
		}).reverse();

		if(array.length == 0){
			$(`#${display}_content`).append(`<h2>You did't like anything yet</h2>`)
		} else {
			if(display == 'liked'){
				$(`#${display}_content`).append(`<h1>You Liked</h1>`)
			} else {
				$(`#${display}_content`).append(`<h1>You Looked At</h1>`)
			}
			
			array.forEach(function(item){
				$(`#${display}_content`).append(app.writeup(item.photo, item.name, item.url, item.phone));
			})
		}
	});
}

app.writeup = (img, title, website, phone) => {
	return `<div class="container">
			<img src="${img}">
			<div class="content">
				<h3 class="place_title">${title}</h3>
				
				<h4 class="website"><a href="${website}">${website}</a></h4>
		
				<h4 class="phone"><a href="tel:${phone}">${phone}</a></h4>
			</div>
		</div>
		<div class="divider content_divider"></div>`
}

app.place = (selected) => {
	app.destination = {
		lat: selected.lat,
		lng: selected.lng
	}
	let priceTier = ''

	if (selected.price == 1){
		priceTier = '$'
	} else if (selected.price = 2){
		priceTier = '$$'
	} else {
		priceTier = '$$$'
	}

	$('#section2 .place_title').text(selected.name);
	$('#section2 #distance').text(`${selected.distance}m`);
	$('#section2 .rating').text(selected.rating);
	$('#section2 #price').text(priceTier);
	$('#section2 #website').html(`<a href="${selected.url}">${selected.url}</a>`);
	$('#section2 #phone').html(`<a href="tel:${selected.phone}">${selected.phone}</a>`);
	$('#tip h3').text(selected.tips);
	$('#img_container').css("background-image", `url('${selected.photo}')`);
	
	app.mapArray(app.selected);
	firebase.database().ref(`/users/${firebase.auth().currentUser.uid}/history`).push(app.selectedPlace);
}

app.getImage = (selected) => {
	$.ajax({
		url: `https://api.foursquare.com/v2/venues/${selected.id}/photos`,
  		method: 'GET',
  		dataType: "json",
  		data: {
			client_id: "VH42GH0DFNZLHDRYB4JULCZIPHD3DA4DUCKVPVBMJQIX350R",
			client_secret: "DLDPDU4LK3ZAGTLHFQLC2JEDGNR01X1MCRRS1NF3VQPV22VL",
			v: 20171120
		}
	}).then(function(data){
		app.selectedImage = `${data.response.photos.items[0].prefix}${data.response.photos.items[0].width}x${data.response.photos.items[0].height}${data.response.photos.items[0].suffix}`;
	}).then(function(){
		app.selectedPlace = {
			id: app.selected.venue.id,
			name: app.selected.venue.name,
			distance: app.selected.venue.location.distance,
			rating: app.selected.venue.rating,
			price: app.selected.venue.price.tier,
			url: app.selected.venue.url,
			phone: app.selected.venue.contact.phone,
			photo: app.selectedImage,
			lat: app.selected.venue.location.lat,
			lng: app.selected.venue.location.lng,
			tips: app.selected.tips[0].text
		}
		app.place(app.selectedPlace);
	})
}

app.pickRandom = (array) => {
	let randomNum = Math.floor(Math.random() * app.filtered.length)
	if(app.filtered.length > 0){
		app.selected = app.filtered[randomNum];
		app.getImage(app.selected.venue);
	} else {
		TweenMax.to($('.warning'),1,{opacity: "1", display : "block"});
	}
}

app.filterResult = (data) => {
	app.filtered = data.filter((data) => {
		return data.venue.rating > 8.5;
	})
}

app.mapArray = (ndelete) => {
	console.log(ndelete);
	const index = app.filtered.indexOf(ndelete);
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
			radius: 2500,
			query: `${what}`,
			openNow: 1,
			v: 20171120
		}
	}).then(function(data){
		app.filterResult(data.response.groups["0"].items);
	}).then(function(){
		app.pickRandom(app.filtered);
		$('#section2').fadeToggle();
		$('#section1').fadeToggle();
		TweenMax.to($('#section2'), 1, {opacity:1, ease:Back.easeOut}).delay(1);
	})
}

app.googleMaps = (loca, desti) => {
	app.googleKey = "AIzaSyB6UumqnkB2X99K9Eeef_RzAQSENqA3I0k";
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

	firebase.auth().onAuthStateChanged(function(user) {	
		if (!user) { 
			firebase.auth().signInWithPopup(provider).then(function(result) {
			// This gives you a Google Access Token. You can use it to access the Google API.
				var token = result.credential.accessToken;
				// The signed-in user info.
				app.userId = result.user;
				// ...
			}).catch(function(error) {
				console.log(error);
				// Handle Errors here.
				var errorCode = error.code;
				var errorMessage = error.message;
				// The email of the user's account used.
				var email = error.email;
				// The firebase.auth.AuthCredential type that was used.
				var credential = error.credential;
				// ...
			});
		} else if ( user  && window.location.pathname == `/${app.baseURL}`){
			window.location = `/${app.baseURL}app.html`;

		} else if ( !user && window.location.pathname == `/${app.baseURL}app.html`){
			window.location = `/${app.baseURL}`;
		}	
	});
}

app.eventFire = () => {
	const $s3back = $('#section3 .btnblue');
	const $s2direction = $('#direction');
	const $s2change = $('#section2 .btnwhite:first-child');
	const $s2another = $('#section2 .btnwhite:last-child');
	const $s2like = $('#like');
	const $s1food = $('.foodbtn');

	const $shlog = $('#log_in');
	const $shheader = $('#header div');

	const $segoogle = $('#loginSection > div');

	$s2like.on("click", function(){
		$(this).addClass('animation');
		firebase.database().ref(`/users/${firebase.auth().currentUser.uid}/liked`).push(app.selectedPlace);
		setTimeout(function(){
			$s2like.removeClass('animation');
		},2000);
	})

	$s3back.on("click", () => {
		$('#section2').fadeToggle();
		$('#section3').fadeToggle();
		$('#map').remove();
		map = null;
		
	})

	$s2direction.on("click", () => {
		$('#section3').prepend(`<div id="map"></div>`);
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
			// app.place(app.selectedPlace);
		}).then(function(){
			$('#section2').css('opacity',0);
			$('#section2').fadeIn();
			// TweenMax.to($('#section2'), 1, {opacity:1, ease:Back.easeOut}).delay(5);
		})	
	})

	$s1food.on("click", function(){
		app.foodType = $(this).data('type');
		TweenMax.to($('.preloader'),1,{display : "flex",opacity: "1"});
		app.location().then(() => {
			
		}).then((resolve) =>{
			app.fourSquare(app.loca, app.foodType)
			TweenMax.to($('.preloader'),1,{opacity: "0", display : "none"});
			
		})	
	})

	$shlog.on("click",function(){
		if (window.location.pathname != `/${app.baseURL}` ){
			firebase.auth().signOut().then(function() {
				window.location = `/${app.baseURL}`;
			}).catch(function(error) {
				console.log(error); 
			});
		}
	})

	$segoogle.on("click", function(){
		let selected = $(this).data('log');
		app.Log(selected);
		console.log(window.location)
	})

	$shheader.on("click", function(){
		if ($(this).hasClass("active")){
			$shheader.removeClass('active');
			$(this).empty();
			if ($(this).is('#liked')){
				$('#liked').append(`<i class="fas fa-thumbs-up"></i>`);
			} else if ($(this).is('#history')){
				$('#history').append(`<i class="fas fa-history"></i>`);
			}
			$('#external_info').removeClass('active');
			TweenMax.to($('#external_info'),1,{opacity: "0", display : "none"});
		} else {
			$shheader.removeClass('active');
			$('#external_info').removeClass('active');
			TweenMax.to($('#external_info'),1,{opacity: "0", display : "none"});
			$('#liked_content').empty();
			$('#history_content').empty();
			$(this).addClass("active");
			$(this).empty();
			$(this).append(`<i class="fas fa-times-circle"></i>`);
			if ($(this).is('#liked')){
				$('#external_info').addClass('active');
				TweenMax.to($('#external_info'),1,{display : "block",opacity: "1"});
				$('#history').empty();
				$('#history').append(`<i class="fas fa-history"></i>`);
				app.displayDatabase('liked');
			} else if ($(this).is('#history')){
				$('#external_info').addClass('active');
				TweenMax.to($('#external_info'),1,{display : "block",opacity: "1"});
				$('#liked').empty();
				$('#liked').append(`<i class="fas fa-thumbs-up"></i>`);
				app.displayDatabase('history');	
			}
		}
	})

	$('.warning .btnblue').on("click",function(){
		TweenMax.to($('.warning'),1,{opacity: "0", display : "none"});
	});
}

app.init = () => {
	app.dataBase();
	TweenMax.to($('.foodbtn'), 2, {opacity:1, ease:Back.easeOut});
}

$(function() {
	app.init();
	app.eventFire();
});