"use strict";var app={};app.loca={},app.filtered=[],app.destination={},app.selectedPlace={},app.displayLiked=function(){var e=function(e,t,n,a){return'<div class="container">\n\t\t\t\t<img src="'+e+'">\n\t\t\t\t<div class="content">\n\t\t\t\t\t<h1 class="place_title">'+t+'</h2>\n\t\t\t\t\t<hr>\n\t\t\t\t\t<h2 class="website">'+n+'</h2>\n\t\t\t\t\t<hr>\n\t\t\t\t\t<h2 class="phone">'+a+'</h2>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<hr class="content_divider">'};firebase.database().ref("users/"+app.userId.uid).on("value",function(t){var n=t.val(),a=$.map(n,function(e,t){return e}).reverse();console.log(a),0==a.length?$("#liked_content").append("<h1>You did't like anything yet</h1>"):a.forEach(function(t){$("#liked_content").append(e(" ",t.venue.name,t.venue.url,t.venue.contact.phone))})})},app.place=function(e){app.destination={lat:e.venue.location.lat,lng:e.venue.location.lng};var t="";t=1==e.venue.price.tier?"$":(e.venue.price.tier=2)?"$$":"$$$",$("#section2 .place_title").text(e.venue.name),$("#section2 #distance").text(e.venue.location.distance+"m"),$("#section2 .rating").text(e.venue.rating),$("#section2 #price").text(t),$("#section2 #website").text(e.venue.url),$("#section2 #phone").text(e.venue.contact.phone),e.tips.length>0&&$("#tip h3").text(e.tips[0].text),app.mapArray()},app.getImage=function(e){$.ajax({url:"https://api.foursquare.com/v2/venues/"+e.venue.id+"/photos",method:"GET",dataType:"json",data:{client_id:"VH42GH0DFNZLHDRYB4JULCZIPHD3DA4DUCKVPVBMJQIX350R",client_secret:"DLDPDU4LK3ZAGTLHFQLC2JEDGNR01X1MCRRS1NF3VQPV22VL",v:20171120}}).then(function(e){var t=""+e.response.photos.items[0].prefix+e.response.photos.items[0].width+"x"+e.response.photos.items[0].height+e.response.photos.items[0].suffix;$("#img_container").css("background-image","url('"+t+"')")})},app.pickRandom=function(e){var t=Math.floor(Math.random()*app.filtered.length);app.filtered.length>0?app.selectedPlace=app.filtered[t]:swal("Couldn't find any Nice Place for you"),console.log(app.filtered),console.log(app.filtered[t])},app.filterResult=function(e){app.filtered=e.filter(function(e){return e.venue.rating>8.5})},app.mapArray=function(){var e=app.filtered.indexOf(app.selectedPlace);app.filtered.splice(e,1)},app.fourSquare=function(e,t){app.clientId="VH42GH0DFNZLHDRYB4JULCZIPHD3DA4DUCKVPVBMJQIX350R",app.clientSecret="DLDPDU4LK3ZAGTLHFQLC2JEDGNR01X1MCRRS1NF3VQPV22VL",$.ajax({url:"https://api.foursquare.com/v2/venues/explore",method:"GET",dataType:"json",data:{client_id:"VH42GH0DFNZLHDRYB4JULCZIPHD3DA4DUCKVPVBMJQIX350R",client_secret:"DLDPDU4LK3ZAGTLHFQLC2JEDGNR01X1MCRRS1NF3VQPV22VL",ll:e.lat+","+e.long,radius:1500,query:""+t,v:20171120}}).then(function(e){app.filterResult(e.response.groups[0].items)}).then(function(){app.pickRandom(app.filtered)}).then(function(){app.place(app.selectedPlace),app.getImage(app.selectedPlace)})},app.googleMaps=function(e,t){function n(e,t,n,a){for(var o=e.routes[0].legs[0],i=0;i<o.steps.length;i++){(t[i]=t[i]||new google.maps.Marker).setMap(a)}}app.googleKey="AIzaSyB6UumqnkB2X99K9Eeef_RzAQSENqA3I0k";var a=void 0,o=[],i=new google.maps.LatLng(e.lat,e.long),c=new google.maps.LatLng(t.lat,t.lng),p=$("#map")[0],s={center:{lat:e.lat,lng:e.long},zoom:20},l=new google.maps.DirectionsService;a=new google.maps.Map(p,s);var r=new google.maps.DirectionsRenderer({map:a}),u=new google.maps.InfoWindow;!function(e,t,a,o,p){for(var s=0;s<a.length;s++)a[s].setMap(null);t.route({origin:i,destination:c,travelMode:"WALKING"},function(t,i){"OK"===i?(e.setDirections(t),n(t,a,o,p)):window.alert("Directions request failed due to "+i)})}(r,l,o,u,a)},app.location=function(){return new Promise(function(e,t){navigator.geolocation.getCurrentPosition(function(t){e(t),app.loca={lat:t.coords.latitude,long:t.coords.longitude}})})},app.dataBase=function(){var e={apiKey:"AIzaSyCsA8GKOpORb7xuyhUNH7JhDtFWzJ6IYWg",authDomain:"project3-f7eba.firebaseapp.com",databaseURL:"https://project3-f7eba.firebaseio.com",projectId:"project3-f7eba",storageBucket:"project3-f7eba.appspot.com",messagingSenderId:"925278152263"};firebase.initializeApp(e);firebase.database();firebase.auth().onAuthStateChanged(function(e){e&&(app.userId=firebase.auth().currentUser)})},app.Log=function(e){if("facebook"==e)var t=new firebase.auth.FacebookAuthProvider;else if("google"==e)var t=new firebase.auth.GoogleAuthProvider;else if("github"==e)var t=new firebase.auth.GithubAuthProvider;firebase.auth().onAuthStateChanged(function(e){e?e&&"/"==window.location.pathname?window.location="app.html":e||"/app.html"!=window.location.pathname||(window.location="/"):(console.log("test"),firebase.auth().signInWithPopup(t).then(function(e){e.credential.accessToken;app.userId=e.user}).catch(function(e){e.code,e.message,e.email,e.credential}))})},app.eventFire=function(){var e=$("#section3 .btnblue"),t=$("#section2 .btnblue"),n=$("#section2 .btnwhite:first-child"),a=$("#section2 .btnwhite:last-child"),o=$("#like"),i=$(".foodbtn"),c=$("#log_in"),p=$("#liked"),s=$("#history"),l=$("#loginSection > div");o.on("click",function(){$(this).addClass("animation"),firebase.database().ref("/users/"+firebase.auth().currentUser.uid).push(app.selectedPlace),setTimeout(function(){o.removeClass("animation")},2e3),console.log("saved")}),e.on("click",function(){$("#section2").fadeToggle(),$("#section3").fadeToggle(),$("#map").empty()}),t.on("click",function(){app.googleMaps(app.loca,app.destination),$("#section3").fadeToggle(),$("#section2").fadeToggle()}),n.on("click",function(){$("#section1").fadeToggle(),$("#section2").fadeToggle()}),a.on("click",function(){new Promise(function(e){$("#section2").fadeOut(),e()}).then(function(){app.pickRandom(app.filtered),app.place(app.selectedPlace),app.getImage(app.selectedPlace)}).then(function(){$("#section2").fadeIn(),console.log("clicked")})}),i.on("click",function(){var e=$(this).data("type");app.location().then(function(t){app.fourSquare(app.loca,e)}),$("#section2").fadeToggle(),$("#section1").fadeToggle()}),c.on("click",function(){console.log("clicked"),"/"!=window.location.pathname&&firebase.auth().signOut().then(function(){window.location="/",console.log("logedout")}).catch(function(e){console.log(e)})}),l.on("click",function(){var e=$(this).data("log");console.log(e),app.Log(e)}),p.on("click",function(){$("#liked_content").empty(),$("#section2").fadeToggle(),$("#liked_content").fadeToggle(),$("#liked_content").toggleClass("active"),app.displayLiked(),$("#liked_content").hasClass("active")?($("#liked").empty(),$("#liked").append('<i class="fas fa-times-circle fa-2x"></i>')):($("#liked").empty(),$("#liked").append('<i class="fas fa-thumbs-up fa-2x"></i>'))}),s.on("click",function(){$("#history_content").toggleClass("active"),$("#history_content").hasClass("active")?($("#history").empty(),$("#history").append('<i class="fas fa-times-circle fa-2x"></i>')):($("#history").empty(),$("#history").append('<i class="fas fa-history fa-2x"></i>'))})},app.init=function(){app.dataBase()},$(function(){app.init(),app.eventFire()});
//# sourceMappingURL=main.js.map