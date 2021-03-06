var activeMenu = '';

function mapa_init(idContenedorMapa, idAutocompleteInput, cartodblayer, tooltipTplId, geolocate) {
    var mapa = inicializarMapa(idContenedorMapa);
    
    activeMenu = "."+idAutocompleteInput+"-menu";
    
    //autocomplete del mapa
	$("#"+idAutocompleteInput).geocomplete({
		map: mapa,
		country: 'ar'
	}).bind("geocode:result", function(event, result){
		$("."+idAutocompleteInput+"-menu").hide();
	});
	
    //agrega layer de cartoDB
    cartodb.createLayer(mapa,cartodblayer, {
		cartodb_logo: false
	})
    .addTo(mapa)
    .on('done', function(layer) {   
        if (geolocate) {
			navigator.geolocation.getCurrentPosition(function(geoposition){
				marcarpunto(geoposition,mapa,'#a2001e', true);
			});
		}
        //tooltips
        var sublayer = layer.getSubLayer(0);
        sublayer.infowindow.set('template', $('#'+tooltipTplId).html());
        sublayer.on('featureClick', function(e, pos, latlng, data) {
			app.env.selected_cartodbid = data.cartodb_id;
      });

      sublayer.on('error', function(err) {
          //si hay algun error en el tooltip
      });
      
      setTimeout( function() {
		$(".pac-container").height($(activeMenu).height() - $(activeMenu + " .ui-input-search").outerHeight(true));
		$(".pac-container").width($(activeMenu + " .ui-input-search").width());
		$(".pac-container").css("background-color", $(activeMenu).css("background-color"));
		$(".pac-container").css("overflow", "auto");
		$(".pac-container").css("overflow-x", "hidden");
		$(".pac-container").css("-webkit-overflow-scrolling", "touch");
	  }, 100);
    })
    .on('error', function(error) {
       //si hay algun error con cartoDB
    });
}
      
/*
 * Agrega un marcador al mapa
 */
function marcarpunto(geoposition, mapa, color, centrar) {
    var position = new google.maps.LatLng(geoposition.coords.latitude, geoposition.coords.longitude);
    var marcador = new google.maps.Marker({
                        position: position,
                        map: mapa
                    });
    var circle = new google.maps.Circle({
        map: mapa,
        radius: geoposition.coords.accuracy,    // 10 miles in metres
        fillColor: color,//'#a2001e',
        
        strokeWeight: 0 
      });
    circle.bindTo('center', marcador, 'position');
    if (typeof(centrar) != 'undefined') {
        mapa.setCenter(position);
        mapa.setZoom(15);
    }
}

var mobileSafari = false;

function checkMobileSafari() {
	if (navigator.userAgent.match("iPhone|iPad") && navigator.userAgent.match("Safari")) {
		mobileSafari = true;
    }
}

function inicializarMapa(idContenedorMapa) {
    // opciones del mapa
    var mapOptions = {
      zoom: 3,
      center: new google.maps.LatLng("-34.7235745", "-58.381585"),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    //inicializa mapa
    var mapa = new google.maps.Map(document.getElementById(idContenedorMapa), mapOptions);
    
    //tamaño del mapa (al 100% no funciona en mobile)
    actualizarTamanioMapa(idContenedorMapa, mapa);
    $(window).resize(function() {
       actualizarTamanioMapa(idContenedorMapa, mapa);
    });
    return mapa
} 

function actualizarTamanioMapa(idContenedorMapa, mapa) {
	var domMapa = $("#"+idContenedorMapa);
    domMapa.width($(window).width());
    var winHeight = $(window).height();
    if (mobileSafari)
		winHeight += 60;
    domMapa.height(winHeight - domMapa.parents(".ui-page").children('.ui-header').outerHeight(true) - domMapa.parents(".ui-page").children('.ui-footer').outerHeight(true));  
    $(".pac-container").height($(activeMenu).height() - $(activeMenu + " .ui-input-search").outerHeight(true));
	$(".pac-container").width($(activeMenu + " .ui-input-search").width());
    google.maps.event.trigger(mapa, 'resize'); 
}
function cerrar (elem) {
    $(elem).remove();
}
