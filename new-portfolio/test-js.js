var s, love = {

	config : {
		data: null,
		mobile: $('body').is('#mobile'),
		firstTime: true,
		notRendered: true,
		lastPage: null,
		current: null,
		portals: ['charms','store','videos','rhymes','commercials','contact'],
		portalClasses: 'charms store videos rhymes commercials contact',
		browser: null,
		hasFlash: false,
		hasVid: false,
		winW: $(window).width(),
		winH: $(window).height(),
		orientation: null,
		scrollTop: null,
		hc: null,
		chc: null,
		sc: null,
		vc: null,
		rc: null,
		cc: null,
		tc: null,
		imageTank: []
	},

	init : function() {

		/* set up shortcut config vars */
		s 	   = this.config;
		s.hc   = love.home.config;
		s.chc  = love.charms.config;
		s.sc   = love.store.config;
		s.vc   = love.videos.config;
		s.rc   = love.rhymes.config;
		s.cc   = love.commercials.config;
		s.tc   = love.contact.config;

		/* fire browser detect */
		love.helpers.browserDetect();
		love.helpers.flashDetect();
		love.helpers.formatCheck();
		love.global.onReadyResize();

	},

	/**
	 * General assistive functions
	 */
	helpers : {

		browserDetect : function(){

			var ua = navigator.userAgent;
			if (/MSIE (\d+\.\d+);/.test(ua))
				s.browser = 'internet-explorer';
			else if (/Firefox[\/\s](\d+\.\d+)/.test(ua))
		    s.browser = 'firefox';
			else if (/Chrome[\/\s](\d+\.\d+)/.test(ua))
		    s.browser = 'chrome';
			else if (/Opera[\/\s](\d+\.\d+)/.test(ua))
		    s.browser = 'opera';
			else if (ua.toLowerCase().indexOf('safari') > 0)
		    s.browser = 'safari';

		},

		map : function(a1,b1,a2,b2,value){

			return (value-a1)/(b1-a1) * (b2 - a2) + a2;

		},

		flashDetect : function(){

			try {
			  var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
			  if(fo) s.hasFlash = true;
			} catch(e){
			  if(navigator.mimeTypes ["application/x-shockwave-flash"] != undefined) s.hasFlash = true;
			}

		},

		formatCheck : function(){ // check if our browser can handle mp4...
		
			var v = document.createElement('video');
			if(v.canPlayType && v.canPlayType('video/mp4').replace(/no/, ''))
				s.hasVid =  true;

		},

		replaceSvg : function(){

			if(!Modernizr.svg) {
			    $('img[src*="svg"]').attr('src', function() {
			        return $(this).attr('src').replace('.svg', '.png');
			    });
			}

		}

	},

	/**
	 * Contains functions shared between home and portals
	 */
	global : {

		init : function(){			

			love.global.onReadyResize();
			love.helpers.replaceSvg();
			
		},

		prldr : function(parent, namespace){

			var prldrs = (parent) ? parent.find('.prld') : $('.prld')
			  , wait   = (s.current == 'home' && s.firstTime) ? 3000 : 0
			  , fade 	 = (s.current == 'home') ? 0 : 200
			  , namespace = (namespace) ? '.'+namespace : '';
			
			prldrs.each(function(){
				var src = $(this).data('src')
				  , img = new Image()
				  , first = $(this).is(':first-child');
					img.src = src;

				if(namespace == '.home'){
					$(this).css('background-image','url("'+src+'")').removeAttr('data-src').removeClass('prld').addClass('home-image').append($(img));
					if(!first) $(this).css('display','none');
				} else {
					if(first)
						$(this).replaceWith($(img));
					else {
						if(s.current == 'store')
							$(this).replaceWith($(img).css('opacity',0));
						else
							$(this).replaceWith($(img).css('display','none'));
					}
				}
			}).promise().done( function(){
				if(s.firstTime && s.current != 'home'){
					$('body').trigger('preload-complete'+namespace);
				} else if (s.current == 'home') {
					$('.portal-wrap, .home-wrap').imagesLoaded(function(){
						setTimeout(function(){ // force delay on homepage load
							$('body').trigger('preload-complete'+namespace);
						},wait);
					}).progress( function( instance, image ) { 
						// this progress method was added later to add images 
						// as they loaded to the imageTank to use in homepage loader
						if (namespace == '.home') {
							var ext = image.img.src.split('.').pop()
							if (ext != 'svg') {
								s.imageTank.push(image.img.src)
							}
						}
  				});

				} else {
					$('.portal-wrap').imagesLoaded(function(){
						$('.preloader').fadeOut(fade).promise().done(function(){
							$('body').trigger('preload-complete'+namespace);
							$('body').trigger('show-back');
							$('.preloader img').removeClass('hideMe')
						});
						if (!s.hc.hovers) {
							love.home.portalHover();
							love.home.portalClick();
						}
					})
				}
			});

		},

		onReadyResize : function(){

			$(window).off('ready.global resize.global').on('ready.global resize.global', function(){
				s.winW = $(window).width();
				s.winH = $(window).height();
				s.orientation = ((s.winW/s.winH)>1) ? 'landscape' : 'portrait';
				$(window).trigger('orientation-set');
			});

		}

	},

	/**
	 * Homepage is rendered via js routing
	 */
	home : {

		config : {
			portalW: null,
			portalH: null,
			rows: null,
			savedOrientation: null,

			portalImages: null,
			portalWrap: $('.portals'),
			portalTxt: $('.portals-type'),
			portalImg: $('.portals-images'),
			portalLnk: $('.portal-nav'),
			
			portals: null,
			tportals: null,
			iportals: null,
			links: null,

			hovers: false,

			portalLoadPause: false,
			portalLoadIndex: [],
			hoverTrack: [],
			justTapped: null,
			zoom: null,
			zoomPositions: 'top-left top-center top-right bottom-left bottom-center bottom-right center-left center-right',
			translate: null,
			timer: null,
			total: null,
			count: 0,
			preloadAnimationTimer: null,
			preloadDone : false
		},

		init : function(){ //home setup, this is only called once

			love.home.listens();
			love.home.buildPage();
			love.home.onResize();

			// trigger home preload animation thang
			if (s.current == 'home') {
				love.home.preloadAnimation()
			} else {
				$('.preloader img').removeClass('hideMe')
			}

		},

		preloadAnimation : function() {
			var count = 0
			console.log('start preload animation')
			s.hc.preloadAnimationTimer = setInterval(function() {
				if (s.hc.preloadDone) {
					clearInterval(s.hc.preloadAnimationTimer)
					love.home.removePreloader()
				} else {
					if (s.imageTank.length) {
						var image = s.imageTank[count]
						$('.preloader').css('background-image', 'url(' + image + ')')
						count++
						if (count >= s.imageTank.length) count = 0
					}
				}
			}, 300)
		},

		removePreloader : function() {
			console.log('remove preloader')
			$('.preloader').fadeOut(0).promise().done(function(){
				
				// reset preloader for the rest of the site
				$('.preloader img').removeClass('hideMe')
				$('.preloader').css('background-image', '')
				
				if (!s.mobile) {
					love.home.doLoaderTransition()
				} else {
					love.home.portalHover();
					love.home.portalClick();
					var kickOffDelay = setTimeout(function(){
						love.home.portalLoadKickoff();
					},700);
				}

			});
		},

		doLoaderTransition : function() {
			console.log('do transition')
			$('body').trigger('home-flashing-complete'); 
		},

		listens : function(){

			$('body').one('home-dom-ready', function(){
				var toRender = (s.current == 'home') ? 5 : 1;
					toRender = (s.mobile) ? 1 : toRender;
				// console.log('The DOM is ready and now we setup '+toRender+' image per portal. Also trigger portal orientation setup');
				love.home.setupImages(toRender);
			});

			$('body').one('home-begin-preload', function(){
				// console.log('The images are in place so we can begin our preload.');
				love.global.prldr($('.home-wrap'), 'home');
			});

			$('body').one('preload-complete.home', function(){
				s.hc.preloadDone = true
			});

			$('body').one('home-flashing-complete', function(){
				console.log('transition done')
				
				love.home.portalHover();
				love.home.portalClick();
				var kickOffDelay = setTimeout(function(){
					love.home.portalLoadKickoff();
				},700);
				
			});

			$('body').on('can-zoom', function(){

				if(s.current != 'home'){

					var zoomer   = s.current
					  , $portal  = s.hc.portalWrap.find('#'+zoomer)
					  , origin   = $portal.attr('data-position')
					  , bgColor  = $portal.css('background-color');
					$('html').css('background-color', bgColor);
					
					s.hc.portalLoadPause = true; //pause image loading as soon as we have zoom capabilities
					// console.log('pause loading');

					$('.portals').each(function(){ 
						$(this).addClass(origin);
					}).promise().done(function(){
						love.home.zoomIn();
					});

				} else {

					var zoomer   = s.lastPage
					  , $portal  = s.hc.portalWrap.find('#'+zoomer)
					  , origin   = $portal.attr('data-position')
					  , bgColor  = $portal.css('background-color');
					$('html').css('background-color', bgColor);

					$('.portals').each(function(){ 
						$(this).addClass(origin);
					}).promise().done(function(){
						love.home.zoomOut();
					});

				}
				
			});

			$('body').on('show-back', function(){
				$('.back').removeClass('hider');
			});

			$('body').on('hide-back', function(){
				$('.back').addClass('hider');
			});

		},

		buildPage : function(){

			$.ajax({
				url: '/k/portals',
				async: false,
				dataType: 'json',
				success: function (data) {
					
					$.each(data.portals, function(i){
						s.hc.portalTxt.append('<section id="'+this.slug+'"><img class="title" draggable="false" src="/static/img/svg/'+this.slug+'.svg"></section>');
						s.hc.portalImg.append('<section><div class="images"></div></section>');
						s.hc.portalLnk.append('<a href="'+this.url+'" data-link="'+this.slug+'"></section>');
						s.hc.hoverTrack[i] = 0; 
						s.hc.portalLoadIndex[i] = (!s.mobile) ? 5 : 1;
					});
					$('<a href="/" class="back hider">&larr;</a>').insertAfter('.portal-wrap');
					$('<div class="close hider">&times;</div>').insertAfter('.portal-wrap');
					s.hc.portals  = $('.portals>section');
					s.hc.tportals = $('.portals-type>section');
					s.hc.iportals = $('.portals-images>section');
					s.hc.links    = $('.portal-nav>a');

					$('body').trigger('home-dom-ready');
					
			  	}
			});

		},

		setupImages : function(imagesToRender){

			$.ajax({
				url: '/k',
				async: false,
				dataType: 'json',
				success: function (data) {
					s.hc.portalImages = data.images;
					
					var counter = 1;
					$.each(data.images, function(category,images){
						var $section = s.hc.iportals.filter(':nth-child('+counter+')');
							$section.attr('id',category);
						for(var p = 0; p < imagesToRender; p++)
							$section.find('.images').append('<span class="prld" data-src="'+images[p].filename+'"></span>');
						counter++;
					});

					s.hc.total = s.hc.iportals.filter(':first-child').find('.images').children().length; 
					$('body').trigger('home-begin-preload');

			  	}
			});

		},

		flashImages : function(){

			// var timer = setInterval(function(){
			// 	$('.home-wrap .images').each(function(){
			// 		love.home.cycleImages($(this));
			// 	});
			// 	s.hc.count = (s.hc.total == s.hc.count) ? 0 : s.hc.count+1;
			// 	if((s.hc.total-1) == s.hc.count){ //stop after we get through all images
			// 		clearInterval(timer);
			// 		$('body').trigger('home-flashing-complete'); 
			// 	}
			// }, 100); //switch image every 100 milliseconds

			$('body').trigger('home-flashing-complete'); 
			$('.preloader').css('background-image', '')

			// console.log('what?')

		},

		cycleImages : function(ele){

			ele.find('.home-image:first-child').hide()
			   .next('.home-image').show()
			   .end().appendTo(ele);	

		},

		portalLoadKickoff : function(){

			s.hc.iportals.each(function(i){
				love.home.portalLoad(s.hc.portalLoadIndex[i], $(this).attr('id'), $(this), i);
			});

		},

		/**
		 * Portal image loading happens for each portal individually. Each portal 
		 * has an array element which tracks it's current load index, and images
		 * are pulled from the json. We perform a check to see if loading is paused
		 * (in a portal), if not, we keep loading images until there are no more
		 * images to load in that category. At that point, we set the load index of
		 * that portal to the max number of images so when we reinit loading when 
		 * coming back to the homepage, that portal doesn't try to load images 
		 * already loaded. Loading is paused as soon as a portal can zoom (can-zoom)
		 * and begun as soon as the animation back to the homepage is complete.
		 */
		portalLoad : function(loadCounter, category, ele, index){

			if(!s.hc.portalLoadPause){ //check if portal image loading is paused
					var imgsToLoad = (!s.mobile) ? s.hc.portalImages[category].length : 6;
					if(loadCounter < imgsToLoad){
						var src = encodeURI(s.hc.portalImages[category][loadCounter].filename)
						  , $img = $( '<img src="' + src + '" style="display:none;">' )
						  , $imgSpan = $('<span class="home-image" style="display:none; background-image:url('+src+');" />');
						$img.one( 'load', function(){
							$imgSpan.appendTo(ele.find('.images'));
						    loadCounter++;
						    if(loadCounter < imgsToLoad)
						    	love.home.portalLoad(loadCounter, category, ele, index);
						    else
						    	s.hc.portalLoadIndex[index] = loadCounter;
						});
						if( $img[0].width ){ $img.trigger( 'load' ); }
					}
			} else {
				s.hc.portalLoadIndex[index] = loadCounter;
			}

		},

		positioning : function(){

			s.hc.rows = Math.ceil((s.orientation=='landscape') ? 6/3 : 6/2);
			if(s.browser == 'safari') love.home.portalSize(); //only do the portal resize fix for idiot safari
			
			if(s.hc.savedOrientation != s.orientation){
				love.home.portalPosition();
				s.hc.savedOrientation = s.orientation;
				if(s.hc.portalWrap.hasClass('zoom')){
					var pos = s.hc.tportals.filter('.active').attr('data-position');
					s.hc.portalWrap.removeClass(s.hc.zoomPositions).addClass(pos);
				}
			}

		},

		onResize : function(){

			$(window).on('ready.home resize.home orientation-set', function(){
				love.home.positioning();

				
				if(s.orientation == 'landscape'){
					var pW = s.winW/3;
					s.hc.translate = (s.winW - (pW*2))/2;
				} else {
					var pH = s.winH/3;
					s.hc.translate = (s.winH - (pH*2))/2;
					// s.hc.translate = (s.winH - (s.winH*.66666))/2;
				}
				
				if(s.hc.portalWrap.hasClass('zoom')){ // adjust scale values based on orientation
					TweenLite.set(s.hc.portalTxt.filter('.top-center, .bottom-center, .center-left, .center-right'), {scale:2, x:0, y:0});
					if(s.orientation == 'landscape'){
						TweenLite.set(s.hc.portalImg, {scaleY:2, scaleX:3});	
						TweenLite.set(s.hc.portalTxt.filter('.top-left, .bottom-left'), {scale:2, x:s.hc.translate+"px", y:0});
						TweenLite.set(s.hc.portalTxt.filter('.top-right, .bottom-right'), {scale:2, x:-s.hc.translate+"px", y:0});
					} else {
						TweenLite.set(s.hc.portalImg, {scaleY:3, scaleX:2});	
						TweenLite.set(s.hc.portalTxt.filter('.top-left, .top-right'), {scale:2, y:s.hc.translate+"px", x:0});
						TweenLite.set(s.hc.portalTxt.filter('.bottom-left, .bottom-right'), {scale:2, y:-s.hc.translate+"px", x:0});
					}
					s.hc.savedOrientation = s.orientation;
				}
			});

		},

		portalSize : function(){ //sets size of portals (for safari) 

			s.hc.portalW = Math.floor((s.orientation=='landscape') ? s.winW/3 : s.winW/2);
			s.hc.portalH = Math.floor((s.orientation=='landscape') ? s.winH/2 : s.winH/3);
			var leftoverW = (s.orientation=='landscape') ? s.winW%3 : s.winW%2
			  , leftoverH = (s.orientation=='landscape') ? s.winH%2 : s.winH%3;
			s.hc.portals.css({ 'width': s.hc.portalW, 'height': s.hc.portalH });
			if(s.orientation=='landscape'){
				s.hc.portals.filter(':nth-child(3n+3)').css('width',s.hc.portalW+leftoverW);
				s.hc.portals.filter(':nth-child(3n+4),:nth-child(3n+5),:nth-child(3n+6)').css('height',s.hc.portalH+leftoverH);
			} else {
				s.hc.portals.filter(':nth-child(2n+2)').css('width',s.hc.portalW+leftoverW);
				s.hc.portals.filter(':nth-child(2n+5),:nth-child(2n+6)').css('height',s.hc.portalH+leftoverH);
			}

		},

		portalPosition : function(){ // simplified portal position code using coordinates while we just have 6 portals

			s.hc.tportals.each(function(i){
				var row = love.home.getRow(i)
				  , col = love.home.getCol(i)
				  , pos = '';

				if(s.orientation=='landscape'){
					pos += (row == 1) ? 'top-' : 'bottom-';
					pos += (col == 0) ? 'left' : ((col == 1) ? 'center' : 'right');
				} else {
					pos += (row == 1) ? 'top-' : ((row == 2) ? 'center-' : 'bottom-');
					pos += (col == 0) ? 'left' : 'right';
				}
				
				$(this).attr('data-position',pos);
				
			});

		},

		portalHover : function(){

			s.hc.hovers = true;

			s.hc.tportals.hover(function(){
				if(!s.hc.portalWrap.hasClass('zoom')){

					var index = $(this).index()
					  , $that = $(this)
					  , $pair = s.hc.iportals.filter(':nth-child('+(index+1)+')')
					  , imgContainer = $pair.find('.images')
					  , images = $pair.find('.home-image').length;
					
					if(!s.mobile){
						s.hc.portals.removeClass('active');
						$that.addClass('hover');
						$pair.addClass('hover');
						clearTimeout(s.hc.timer);
						s.hc.timer = setTimeout(function(){ // remove hover class if no movement for 750ms
							$that.removeClass('hover');
							$pair.removeClass('hover');
						}, 750);
					}

					// swap image, when cycled through all, shuffle and reset hover counter
					$pair.find('.home-image:first-child').hide().next('.home-image').show().end().appendTo(imgContainer);
					s.hc.hoverTrack[index]++;
					if(s.hc.hoverTrack[index] == images){
						imgContainer.shuffle();
						imgContainer.find('.home-image').hide();
						imgContainer.find('.home-image:first-child').show();
						s.hc.hoverTrack[index] = 0; 
					}

				}
				
			}, function(){
				if(!s.hc.portalWrap.hasClass('zoom')){
					
					var index = $(this).index()
					  , $that = $(this);
					$that.removeClass('hover');
					s.hc.iportals.filter(':nth-child('+(index+1)+')').removeClass('hover');

				}
			});

		},

		portalClick : function(){

			if(!s.mobile){
				s.hc.tportals.on('mousedown', function(){
					if(!s.hc.portalWrap.hasClass('zoom')){
						var index = $(this).index()
						  , $pair = s.hc.iportals.filter(':nth-child('+(index+1)+')')
						  , bgColor = $(this).css('background-color');
						s.hc.portals.removeClass('active');
						$(this).addClass('active');
						$pair.addClass('active');
						$('html').css('background-color', bgColor);
					}
				}).on('mouseup', function(e){
					if(!s.hc.portalWrap.hasClass('zoom')){
						var index = $(this).index()
						  , $link = s.hc.links.filter(':nth-child('+(index+1)+')');
						if($link.is('[data-link="rhymes"]')){
							window.open('http://rhym.es/', '_blank');
							s.hc.portals.removeClass('active');
						} else {
							if($(this).hasClass('active'))
								$link.click();
							else
								s.hc.portals.removeClass('active');
						}
					}
				});
			} else {
				s.hc.tportals.on('touchstart', function(){
					if(!s.hc.portalWrap.hasClass('zoom')){
						var index = $(this).index()
						  , $pair = s.hc.iportals.filter(':nth-child('+(index+1)+')')
						  , bgColor = $(this).css('background-color');
						s.hc.portals.removeClass('active');
						$(this).addClass('active');
						$pair.addClass('active');
						$('html').css('background-color', bgColor);
					}
				}).on('touchend', function(e){
					if(!s.hc.portalWrap.hasClass('zoom')){
						var index = $(this).index()
						  , $link = s.hc.links.filter(':nth-child('+(index+1)+')');
						if(s.hc.justTapped == $(this).attr('id')){
							s.hc.justTapped = null;
							if($link.is('[data-link="rhymes"]')){
								window.open('http://rhym.es/', '_blank');
								s.hc.portals.removeClass('active');
							} else if($link.is('[data-link="charms"]')){
								window.open('http://instagram.com/l_o_v_e_x_x_x', '_blank');
								s.hc.portals.removeClass('active');
							} else {
								if($(this).hasClass('active'))
									$link.click();
								else
									s.hc.portals.removeClass('active');
							}
						} else {
							s.hc.justTapped = $(this).attr('id');
							console.log(s.hc.justTapped);
						}
					}
				});
			}

		},

		portalOffClick : function(){
			s.hc.tportals.off();
		},

		getRow : function(index){ //gets row of portal
			return (s.orientation == 'landscape') ? Math.ceil((index+1)/3) : Math.ceil((index+1)/2);
		},
		
		getCol : function(index){ //gets col of portal
			return (s.orientation == 'landscape') ? index%3 : index%2;
		},

		zoomIn : function(portal){

			s.hc.savedOrientation = s.orientation;
			$('.portals').addClass('zoom');
			TweenLite.to(s.hc.portalTxt.filter('.top-center, .bottom-center, .center-left, .center-right'), 0.6, {scale:2, x:0, y:0, ease:Power2.easeInOut});
			if(s.orientation == 'landscape'){
				TweenLite.to(s.hc.portalImg, 0.6, {scaleY:2, scaleX:3, ease:Power2.easeInOut, onStart:love.home.beginZoom, onComplete:love.home.endZoom});	
				TweenLite.to(s.hc.portalTxt.filter('.top-left, .bottom-left'), 0.6, {scale:2, x:s.hc.translate+"px", y:0, ease:Power2.easeInOut});
				TweenLite.to(s.hc.portalTxt.filter('.top-right, .bottom-right'), 0.6, {scale:2, x:-s.hc.translate+"px", y:0, ease:Power2.easeInOut});
			} else {
				TweenLite.to(s.hc.portalImg, 0.6, {scaleY:3, scaleX:2, ease:Power2.easeInOut, onStart:love.home.beginZoom, onComplete:love.home.endZoom});	
				TweenLite.to(s.hc.portalTxt.filter('.top-left, .top-right'), 0.6, {scale:2, y:s.hc.translate+"px", x:0, ease:Power2.easeInOut});
				TweenLite.to(s.hc.portalTxt.filter('.bottom-left, .bottom-right'), 0.6, {scale:2, y:-s.hc.translate+"px", x:0, ease:Power2.easeInOut});
			}

		},

		zoomOut : function(portal){
			$('body').off('mousemove.charms mouseleave.charms'); //charms reset
			$('.close').addClass('no-animate hider'); //charms reset
			$('body').trigger('hide-back');
			$('.portal-wrap').addClass('fade-out').delay(300).promise().done(function(){
				$('.portal-wrap').scrollTop(0).removeClass('reveal fade-out').empty(); //empty after 300ms after the css opacity fadeout happens
			});
			TweenLite.to(s.hc.portalWrap, 0.6, {delay:0.5, scale:1, x:0, y:0, ease:Power2.easeInOut, onStart:love.home.beginZoom, onComplete:love.home.endZoom});
			//added additional delay here to avoid weird flashing bug in chrome

		},

		beginZoom: function(){
			// console.log('zoom started');
			s.hc.portalWrap.addClass('zooming');
			if(s.current == 'home'){
				s.hc.portalWrap.removeClass('zoom');
			} else {
				if(!s.notRendered){
					$('.preloader-wrap img').attr('src','static/img/svg/'+s.current+'.svg');
					$('.preloader').removeClass(s.portalClasses).addClass(s.current);
					s.notRendered = false;
				}
			}
			$('body').off('mousemove.charms mouseleave.charms'); //charms reset
			$('.close').addClass('no-animate hider'); //charms reset
		},

		endZoom: function(){
			// console.log('zoom done');
			s.hc.portalWrap.removeClass('zooming');
			if(s.current == 'home'){
				s.hc.portals.removeClass('active');
				$('.back').removeClass('black')
				$('.close').removeClass('white')
				if(s.hc.portalLoadPause){
					s.hc.portalLoadPause = false;
					love.home.portalLoadKickoff();
					// console.log('start loading more...');
				}
			} else {
				// s.hc.tportals.filter('.active').find('img').addClass('thump');
				//figure out how to bring loader in play here
				$('.preloader').show();
				love.home.loadPortal();
			}
			$('body').off('mousemove.charms mouseleave.charms'); //charms reset
			$('.close').addClass('no-animate hider'); //charms reset
		},

		enterPortal : function(portal){ 

			// console.log(s.current);
			$('.portals').removeClass(s.hc.zoomPositions);
			/* the following code triggers when our dom is ready for a zoom */
			if(s.current != 'home'){
				var zoomer   = s.current
				  , $portal  = s.hc.portalWrap.find('#'+zoomer)
				  , origin   = $portal.attr('data-position');
				
				var keepChecking = setInterval(function(){
					$portal  = s.hc.portalWrap.find('#'+zoomer);
					origin   = $portal.attr('data-position');
					if(origin) {
						clearInterval(keepChecking);	
						$('body').trigger('can-zoom');
						$portal.addClass('active');
					}
				},1);	
			}

		},

		exitPortal : function(){

			$('.portals').removeClass(s.hc.zoomPositions);
			if(s.current == 'home' && s.lastPage){
				
				var zoomer   = s.lastPage
				  , $portal  = s.hc.portalWrap.find('#'+zoomer)
				  , origin   = $portal.attr('data-position');
				
				var keepChecking = setInterval(function(){
					$portal  = s.hc.portalWrap.find('#'+zoomer);
					origin   = $portal.attr('data-position');
					if(origin) {
						clearInterval(keepChecking);	
						$('body').trigger('can-zoom');
					}
				},1);
			}

		},

		loadPortal : function(){
			
			var slug = s.current;
				if(slug == 'about') slug = 'contact';
			$('.portal-wrap').load('/static/templates/'+slug+'.php', function(){
				// console.log(slug+' loaded');
				clearInterval(s.tc.timer);
				
				if(!s.mobile){
					$('.close').removeClass('no-animate');
					love[slug].init();
				}
				else{
					$('.close').addClass('hider');
					$('#mobile .portal-wrap').removeClass('store');
					clearInterval(love.mobile.store.config.animationTimer);
					love.mobile[slug].init();
				}
				$('.portal-wrap').removeClass('scroll').addClass('reveal');
			});
			
			
		}

	},

	/**
	 * The following pages are rendered into .portal-wrap
	 */
	charms : {

		config : {
			mask: null,
			loader: null,
			stills: null,
			charmFilms: null,
			charmFilm: null,
			charmFilmsCount: null,
			player: null,
			slug: null,
			timecode: null,
			close: null,
			lastMouse: null,
			closeVisible: false
		},

		init : function(){

			s.chc.mask = $('.charms-mask');
			s.chc.loader = $('.charms-heart');
			s.chc.stills = $('.charms-stills');
			s.chc.charmFilms = $('.charms-projects');
			s.chc.charmFilm = $('.charms-projects li');
			s.chc.charmFilmsCount = $('.charms-projects li').length;
			s.chc.player = $('.charms-video-wrapper');
			s.chc.close = $('.close');

			love.global.prldr($('.portal-wrap'), 'charms');

			love.helpers.replaceSvg();
			love.charms.onReadyResize();
			love.charms.selectorSetup();
			love.charms.selectorClick();
			love.charms.closeClick();
			love.charms.listenVideo();
			$('.charms-mask').imagesLoaded(function(){
				love.charms.maskSize();
			});
			$('body').on('preload-complete.charms', function(){
				love.charms.closeShow();
			});

		},

		onReadyResize : function(){

			$('.back').addClass('black')

			$(window).on('ready.charms resize.charms', function(){
				love.charms.maskSize();
			});

		},

		selectorSetup : function(){

			var width = 100/s.chc.charmFilmsCount;
			s.chc.charmFilm.css('width',width+'%');
			love.charms.selectorHover();

		},

		selectorHover : function(){

			s.chc.charmFilm.on('mouseenter.charms', function(){
				var slug = $(this).attr('data-slug');
				// var index = $(this).index()+1;
				s.chc.stills.children('li').hide();
				s.chc.stills.find('[data-slug="'+slug+'"]').show();
			});

		},

		selectorClick : function(){

			s.chc.charmFilm.on('mousedown', function(){
				// if(!s.chc.mask.hasClass('hide')){
					s.chc.slug = $(this).attr('data-slug');
					s.chc.timecode = $(this).data('timecode');
					s.chc.charmFilm.off('mouseenter.charms');
					s.chc.mask.addClass('hide');
					s.chc.loader.removeClass('hide');
					// s.chc.close.removeClass('hider');

					if(!s.hasFlash && !s.hasVid){
						s.chc.loader.find('.heart-wrap').html('<img src="/static/img/svg/no-flash.svg">');
						$('.no-flash').remove(); 
						$('<div class="no-flash">You need <a href="http://get.adobe.com/flashplayer/" target="_blank">Flash</a> to view these videos.</div>').insertAfter(s.chc.loader);
					}
					window.parent.$('body').trigger('hide-back');
					
					$('.close').addClass('no-animate');
					$('body').trigger('hide-close');
				// } else {
				// 	$('body').trigger('video-quit');	
				// }
			}).on('mouseup', function(){
				// if(!s.chc.mask.hasClass('hide')){
					$('.close').removeClass('no-animate');
					if(s.hasVid || s.hasFlash){
						var $iframe = $('<iframe src="/static/templates/playercharms.php?page=charms&slug=' + s.chc.slug + '&timecode=' + s.chc.timecode + '" />');
						s.chc.player.append($iframe);
						s.chc.loader.addClass('thump');
						s.chc.charmFilms.addClass('dontclick');
					}
					
				// }
			});

		},

		listenVideo : function(){

			$('body').on('video-begin', function(){
				// console.log('video-start');
				s.chc.loader.fadeOut(300, function(){
					$(this).addClass('hide').removeClass('thump').attr('style','');
				});
				s.chc.stills.fadeOut(300, function(){
					$(this).addClass('hide').attr('style','');
				});
				s.chc.charmFilms.addClass('hide');
			});

			$('body').on('video-end', function(){
				// console.log('video-end');
				s.chc.stills.removeClass('hide');
				s.chc.charmFilms.removeClass('hide dontclick');
				s.chc.mask.removeClass('hide');
				love.charms.selectorHover();
				
				$('body').trigger('show-back');
				s.chc.close.addClass('hider');
			});

			$('body').on('video-kill', function(){
				// console.log('video-kill');
				s.chc.player.empty();
			});

			$('body').on('show-close', function(){
				s.chc.close.removeClass('hider');
				s.chc.closeVisible = true;
			});

			$('body').on('hide-close', function(){
				s.chc.close.addClass('hider');
				s.chc.closeVisible = false;
			});

			

		},

		closeClick : function(){

			s.chc.close.addClass('white');
			s.chc.close.on('click', function(){
				s.chc.player.empty();
				s.chc.loader.addClass('hide').removeClass('thump').attr('style','');
				s.chc.charmFilms.removeClass('hide dontclick');
				s.chc.stills.removeClass('hide');
				s.chc.mask.removeClass('hide');
				love.charms.selectorHover();
				$('body').trigger('show-back');
				s.chc.close.addClass('hider');
			});

		},

		closeShow : function(){

			var i = null;
			$("body").on('mousemove.charms',function(e) {
			    clearTimeout(i);
			    if(!s.chc.closeVisible){
					if(s.chc.lastMouse!=0){
				    	if(Math.abs(s.chc.lastMouse-e.pageX)>0.5){
				    		// console.log('show');
				    		$('body').trigger('show-close');
				    	}
				    }
				}
			    s.chc.lastMouse = e.pageX;
			    i = setTimeout(function(){
			    	// console.log('hide');
			    	$('body').trigger('hide-close');
			    }, 650);
			}).on('mouseleave.charms', function(e) {
			    clearTimeout(i);
			    s.chc.lastMouse = 0;
			    // console.log('hide');
			    $('body').trigger('hide-close');
			});

		},

		maskSize : function(){

			var maskW = $('.heart-wrap img').width()
		  	  , maskH = $('.heart-wrap img').height()
		  	  , maskD = (maskW >= maskH) ? maskH : maskW;

		  	$('.mask-border').css({
		  		width: maskD-10,
		  		height: maskD-10
		  	});

		}

	},

	store : {

		config : {
			productWrap: null,
			products: null,
			storeProducts: null,
			cloudAR: 2888/750 // will need to make dynamic when we find different clouds
		},

		init : function(){
			s.sc.productWrap = $('.products');
			s.sc.products = $('.products a');
			
			love.global.prldr($('.portal-wrap'), 'store');
			love.helpers.replaceSvg();
			love.store.onReadyResize();
			love.store.onScrollr();
			love.store.cloudInit();
			love.store.partitionCreate();

			$('body').off('preload-complete.store').on('preload-complete.store', function(){
				$('.portal-wrap').addClass('scroll');
				love.store.productLoadKickoff();
			});
			
		},

		onReadyResize : function(){

			$(window).on('ready.store resize.store', function(){
				love.store.cloudSize();

				// restart animation once browser is resized
				clearTimeout($.data(this, 'resizeTimer'));
				$.data(this, 'resizeTimer', setTimeout(function() {
				   $('.cloud').addClass('animate');
				}, 50));
			});

		},

		onScrollr : function(){ // hack to force repaint on safari
			$(window).on('scroll.store', function(){
				s.sc.products.css("z-index", 1);
			});
		},

		cloudInit : function(){

			$('.clouds').imagesLoaded(function(){
				love.store.cloudSize();
				$('.cloud').addClass('animate');
			});

		},

		cloudSize : function(){

			var cloudW = (s.winH > 480) ? s.winH*s.sc.cloudAR : 480*s.sc.cloudAR;
			$('.cloud').removeClass('animate').css({
				height: s.winH,
				width: cloudW
			});
	
		},

		productLoadKickoff : function(){

			$.ajax({ // get the rest of our products from the store json
				url: '/k/store',
				async: false,
				dataType: 'json',
				success: function (data) {
					s.sc.storeProducts = data.projects;
			  	}
			});
			
			love.store.productLoad(9); // kick off loader from product 9 (since we already loaded first 9)

		},

		productLoad : function(loadCounter){

			var productsToLoad = s.sc.storeProducts.length
			  , product = s.sc.storeProducts[loadCounter]
			  , partitionWidth = 100/product.images.length
			  , $product = $('<a style="display:none;" href="'+product.url+'" id="'+product.slug+'" target="_blank"><div class="images"></div><div class="flipper"></div></a>');

			$.each(product.images, function(i){
				var $img = $('<img style="opacity:0;" src="' + this.filename + '">');
				if(i==0) $img.css('opacity','1');
				$product.find('.images').append($img);
				$product.find('.flipper').append('<section style="width:'+partitionWidth+'%;" />');
			});

			$product.imagesLoaded(function(){
				s.sc.productWrap.append($product);
				$product.fadeIn();

				if(!$product.is('#lamp'))
					love.store.partitionHover($product.find('.flipper'));
				else
					love.store.lampHover($product.find('.flipper'));
				
				loadCounter++;
				if(loadCounter < productsToLoad)
					love.store.productLoad(loadCounter);
			});

		},

		partitionCreate : function(){

			s.sc.products.each(function(){
				var images 	= $(this).find('.images').children()
				  , width 	= 100/images.length
				  , flipper = $(this).find('.flipper');
				images.each(function(){
					flipper.append('<section style="width:'+width+'%;" />');
				});
			}).promise().done( function(){
				love.store.partitionHoverSetup();
			});

		},

		partitionHoverSetup : function(){

			$('.flipper').each(function(){
				love.store.partitionHover($(this));
			});

		},

		partitionHover : function(ele){

			var images = ele.siblings('.images').find('img');
			ele.find('section').hover(function(){
				var index = $(this).index()+1;
				images.css('opacity',0).filter(':nth-child('+index+')').css('opacity',1);
			}, function(){
				//null
			});

		},

		lampHover : function(ele){

			ele.siblings('.images').find('img').css('display','');
			ele.hover(function(){
				$(this).siblings('.images').toggleClass('on');
				$('.clouds').toggleClass('night');
				// $('.back').toggleClass('white');
			}, function(){
				//null
			});

		}

	},

	videos : {

		config : {
			projects: null,
			videoTitle: null,
			player: null,
			close: null
		},

		init : function(){

			s.vc.projects = $('.video-projects:not(.commercial-projects)>li');
			s.vc.videoTitle = $('.video-title');
			s.vc.player = $('.video-wrapper');
			s.vc.close = $('.close');

			love.global.prldr($('.portal-wrap'), 'videos');
			love.helpers.replaceSvg();
			love.videos.setupInfinite();
			love.videos.onScroll();
			love.videos.partitionClick();
			love.videos.closeClick();
			love.videos.listenVideo();

			$('body').on('preload-complete.videos', function(){
				console.log('videos loaded')
				love.videos.loadRest()
			});

		},

		setupInfinite : function() {
			$('[data-video]:eq(0)').clone().appendTo('.video-projects')
			$('[data-video]:eq(1)').clone().appendTo('.video-projects')
		},

		loadRest : function() {
			$('[data-load-after]').each(function() {
				$(this).css('background-image', 'url(' + $(this).data('src') + ')');
			});
		},

		onScroll : function() {
			var timeout
			$('.video-projects').on('scroll', function() {
				$(this).addClass('noHover')
				if ($('[data-video]:nth-last-child(2)').offset().top < 0) {
					$('.video-projects').scrollTop(1)
				} else if ($('.video-projects').scrollTop() <= 0) {
					$('.video-projects').scrollTop($('[data-video]:nth-last-child(2)').position().top)
				}
				clearTimeout(timeout)
				timeout = setTimeout(function() {
					$('.video-projects').removeClass('noHover')	
				}, 50) 
			})
		},

		partitionClick : function(){

			$('.video-projects:not(.commercial-projects)>li')
			.off('click')
			.on('click', function(){
				if(s.hasVid || s.hasFlash){
					var slug = $(this).attr('id')
					  , $iframe = $('<iframe src="/static/templates/player.php?page=videos&slug=' + slug + '&autoplay=true" style="visibility:hidden;" onload="this.style.visibility=\'visible\';" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true" />');
					  s.vc.player.find('.video-player').append($iframe);
					  s.vc.player.fadeIn(300);
					  s.vc.close.removeClass('hider');
					  window.parent.$('body').trigger('hide-back');
				} else if(!s.hasVid && !s.hasFlash){
					$('.no-flash').remove(); 
					$('<div class="no-flash">You need <a href="http://get.adobe.com/flashplayer/" target="_blank">Flash</a> to view these videos.</div>').insertAfter(s.vc.videoTitle);
				}
			});

		},

		closeClick : function(){

			s.vc.close.click(function(){
				s.vc.player.fadeOut(300, function(){
					s.vc.player.find('.video-player').empty();
				});
				$('body').trigger('show-back');
				s.vc.close.addClass('hider');
			});

		},

		listenVideo : function(){

			$('body').on('video-begin', function(){
				// s.vc.player.find('.video-player').removeClass('black');
			}).on('video-kill', function(){
				s.vc.close.click();
			});

		}

	},

	rhymes : {

		config : {

		},

		init : function(){
			
		}

	},

	commercials : {

		config : {
			projects: null,
			videoTitle: null,
			player: null,
			close: null
		},

		init : function(){

			s.cc.projects = $('.video-projects.commercial-projects>li');
			s.cc.videoTitle = $('.video-title');
			s.cc.player = $('.video-wrapper');
			s.cc.close = $('.close');

			love.global.prldr($('.portal-wrap'), 'commercials');
			love.helpers.replaceSvg();
			love.commercials.setupInfinite();
			love.commercials.onScroll();
			// love.commercials.onHover();
			love.commercials.partitionClick();
			love.commercials.closeClick();
			love.commercials.listenVideo();
			// love.commercials.setupLogos();

			$('body').on('preload-complete.commercials', function(){
				console.log('commercials loaded')
				love.commercials.loadRest()
			});

		},

		setupInfinite : function() {
			$('[data-video]:eq(0)').clone().appendTo('.video-projects')
			$('[data-video]:eq(1)').clone().appendTo('.video-projects')
		},

		loadRest : function() {
			$('[data-load-after]').each(function() {
				$(this).css('background-image', 'url(' + $(this).data('src') + ')');
			});
		},

		setupLogos : function() {
			$('.video-projects.commercial-projects>li').each(function() {
				if ($(this).find('[data-icon]').attr('data-icon') != '') {
					$img = $('<img>', {
						'src' : $(this).find('[data-icon]').attr('data-icon'),
						'class' : 'commercial-logo'
					})
					$img.insertAfter($(this).find('[data-icon]'))
				}
			})
		},

		onScroll : function() {
			var timeout
			$('.video-projects').on('scroll', function() {
				$(this).addClass('noHover')
				if ($('[data-video]:nth-last-child(2)').offset().top < 0) {
					$('.video-projects').scrollTop(1)
				} else if ($('.video-projects').scrollTop() <= 0) {
					$('.video-projects').scrollTop($('[data-video]:nth-last-child(2)').position().top)
				}
				clearTimeout(timeout)
				timeout = setTimeout(function() {
					$('.video-projects').removeClass('noHover')	
				}, 50) 
			})
		},

		onHover : function() {
			$('[data-video-title]')
				.off()
				.on('mouseenter', function() {
					$(this).siblings('.commercial-logo').css('opacity', 1);
					// TweenLite.to($(this).parents('.title-wrap').siblings('.images'), 9, {scaleX:1.2, scaleY:1.2});
				})
				.on('mouseleave', function() {
					$(this).siblings('.commercial-logo').css('opacity', 0);
					// TweenLite.to($(this).parents('.title-wrap').siblings('.images'), 5, {scaleX:1, scaleY:1});
					// console.log($(this).html())
				})
		},

		partitionClick : function(){

			$('.video-projects.commercial-projects>li')
			.off('click')
			.on('click', function(){
				if(s.hasVid || s.hasFlash){
					var slug = $(this).attr('id')
					  , $iframe = $('<iframe src="/static/templates/player.php?page=commercials&slug=' + slug + '&autoplay=true" style="visibility:hidden;" onload="this.style.visibility=\'visible\';" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true" />');
					  s.cc.player.find('.video-player').append($iframe);
					  s.cc.player.fadeIn(300);
					  s.cc.close.removeClass('hider');
					  window.parent.$('body').trigger('hide-back');
				} else if(!s.hasVid && !s.hasFlash){
					$('.no-flash').remove(); 
					$('<div class="no-flash">You need <a href="http://get.adobe.com/flashplayer/" target="_blank">Flash</a> to view these videos.</div>').insertAfter(s.cc.videoTitle);
				}
			});

		},

		closeClick : function(){

			s.cc.close.click(function(){
				s.cc.player.fadeOut(300, function(){
					s.cc.player.find('.video-player').empty();
				});
				$('body').trigger('show-back');
				s.cc.close.addClass('hider');
			});

		},

		listenVideo : function(){

			$('body').on('video-begin', function(){
				// s.cc.player.find('.video-player').removeClass('black');
			}).on('video-kill', function(){
				s.cc.close.click();
			});

		}

	},

	contact : {

		config : {
			imageWrap: null,
			count: 0,
			total: null,
			timer: null
		},

		init : function(){

			s.tc.imageWrap = $('.contact-images .center-fix');
			love.helpers.replaceSvg();
			
			$('body').off('preload-complete.contact').on('preload-complete.contact', function(){
				love.contact.flashKickOff();
				love.contact.stopIt();

				$.each(s.hc.portalImages, function(cat,images){
					love.contact.addMore(4, cat);
				});
			});
			love.contact.setupImages();

			$(window).on('resize.contact', function(){
				$('.email').css("z-index", 1);
			});

			$('.about-text a').off('click').on('click', function(e) {
				e.preventDefault()
				window.open($(this).attr('href'),'_blank')
			})

		},

		setupImages : function(){
			// console.log('go');
			var categories = ['celebrity','controversial','emotional','historical','nature','objects'];

			for(var p = 0; p < 4; p++){
				$.each(categories, function(index,cat){
					// console.log(this.length);
					s.tc.imageWrap.append('<span class="prld" data-src="'+s.hc.portalImages[cat][p].filename+'"></span>');
				});
			}
			love.global.prldr($('.portal-wrap'), 'contact');

		},

		flashKickOff : function(){

			s.tc.timer = setInterval(function(){
				love.contact.flashImages();
			}, 100); //switch image every 100 milliseconds

		},

		flashImages : function(){
			
			s.tc.imageWrap.each(function(){
				love.contact.cycleImages($(this));
			});
			if(s.tc.total == s.tc.imageWrap.find('img').length){
				s.tc.count = 0;
				s.tc.imageWrap.shuffle();
				s.tc.imageWrap.find('img').hide();
      			s.tc.imageWrap.find('img:first-child').show();
			} else {
				s.tc.count++;
			}	

		},

		cycleImages : function(ele){

			ele.find('img:first-child').hide()
			   .next('img').show()
			   .end().appendTo(ele);	

		},

		addMore : function(loadCounter, category){

			var imgsToLoad = s.hc.portalImages[category].length
			  , $img = $('<img class="new" src="'+s.hc.portalImages[category][loadCounter].filename+'" style="display:none;">');

			$img.one('load', function(){
				$img.appendTo(s.tc.imageWrap);
			    loadCounter++;
			    if(loadCounter < imgsToLoad)
			    	love.contact.addMore(loadCounter, category);
			})
			if( $img[0].width ){ $img.trigger( 'load' ); }

		},

		stopIt : function(){

			$(document).on('mousedown touchstart',function(ev){
    			clearInterval(s.tc.timer);
    			$('.text').addClass('clear')
    			// $('.text-wrap').hide();
    			// $('.credit').hide();
    			// $('.email').show();
			}).on('mouseup touchend',function(ev){
				clearInterval(s.tc.timer);
				$('.text').removeClass('clear')
				// $('.text-wrap').show();
				// $('.credit').show();
				// $('.email').hide();
    			s.tc.timer = setInterval( function(){
    				love.contact.flashImages();
    			}, 100)	;
			});

		}

	},

	mobile : {

		config : {
			// tablet: $('body').is('.tablet')
		},

		global : {

			videoModal : function(url){

				var $iframe = $('<iframe src="/static/templates/player.php?src=' + url + '" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true" />');
				$('.video-player').append($iframe);
				$('.video-player').parent().fadeIn(300);
				$('.close').removeClass('hider');

			},

			closeClick : function(){

				$('.close').click(function(){
					$('.close').addClass('hider');
					$('.video-player').parent().fadeOut(300);
					$('.video-player').empty();
				});
				
			}

		},

		charms : {

			init : function(){

				love.global.prldr($('.portal-wrap'), 'charms');
				love.mobile.charms.videoClick();
				love.mobile.global.closeClick();

			},

			videoClick : function(){
				
				$('.charms-stills li').click(function(){
					// if(!love.mobile.config.tablet){
					// 	window.location = $(this).data('video');	
					// } else {
						love.mobile.global.videoModal($(this).data('video'));
					// }
				});

			}

		},

		store : {

			config : {
				animationTimer: null,
				storeProducts: null,
				productWrap: null
			},

			init : function(){

				love.mobile.store.config.productWrap = $('.products');
				$('.products a:nth-child(n+4)').remove();
				love.global.prldr($('.portal-wrap'), 'store');
				$('body').off('preload-complete.store').on('preload-complete.store', function(){
					love.mobile.store.productLoadKickoff();
				});
				$('#mobile .portal-wrap').addClass('store');
				love.mobile.store.productAnimations();
				love.mobile.store.config.animationTimer = setInterval(love.mobile.store.productAnimations, 200);

			},

			productAnimations : function(){
				$('.products .images').each(function(){
					$(this).find('img:first-child').css('opacity','0')
						.next('img').css('opacity','1')
						.end().appendTo($(this));
				});
			},

			productLoadKickoff : function(){

				$.ajax({
					url: '/k/store',
					async: false,
					dataType: 'json',
					success: function (data) {
						love.mobile.store.config.storeProducts = data.projects;
				  	}
				});
				love.mobile.store.productLoad(3);

			},

			productLoad : function(loadCounter){

				var productsToLoad = love.mobile.store.config.storeProducts.length
				  , product = love.mobile.store.config.storeProducts[loadCounter]
				  , $product = $('<a style="display:none;" href="'+product.url+'" id="'+product.slug+'" target="_blank"><div class="images"></div></a>');

				$.each(product.images, function(i){
					var $img = $('<img style="opacity:0;" src="' + this.filename + '">');
					if(i==0) $img.css('opacity','1');
					$product.find('.images').append($img);
				});

				$product.imagesLoaded(function(){
					love.mobile.store.config.productWrap.append($product);
					$product.fadeIn();
					loadCounter++;
					if(loadCounter < productsToLoad)
						love.mobile.store.productLoad(loadCounter);
				});

			}



		},

		videos : {

			init : function(){

				// $('.video-slides li').filter(':not(:nth-child(3n+1))').remove();
				love.global.prldr($('.portal-wrap'), 'videos');
				// this.addTitles();
				$(window).on('resize.videos', function(){
					$('.video-slides li').css("z-index", 1);
				});
				love.mobile.videos.videoClick();
				love.mobile.global.closeClick();
				setTimeout(function() {
					love.mobile.videos.loadRest()
				}, 50)

			},

			addTitles : function(){

				$('.video-projects li').each(function(i){
					var title = $(this).html();
					$('.video-slides li').filter(':nth-child('+(i+1)+')').attr('data-title',title);
				});

			},

			videoClick : function(){
				
				$('.video-projects li').click(function(){

					  var url = $(this).data('video')
					// if(!love.mobile.config.tablet){
					// 	window.location = url;	
					// } else {
						love.mobile.global.videoModal(url);
					// }

				});

			},

			loadRest : function() {
				$('[data-load-after]').each(function() {
					$(this).css('background-image', 'url(' + $(this).data('src') + ')');
				});
			}

		},

		rhymes : {

			init : function(){

				love.global.prldr($('.portal-wrap'), 'rhymes');

			}

		},

		commercials : {

			init : function(){

				love.global.prldr($('.portal-wrap'), 'commercials');
				// this.addTitles();
				$(window).on('resize.videos', function(){
					$('.video-slides li').css("z-index", 1);
				});
				love.mobile.commercials.videoClick();
				love.mobile.global.closeClick();

				setTimeout(function() {
					love.mobile.videos.loadRest()
				}, 50)
				
			},

			videoClick : function(){
				
				$('.commercial-projects li').click(function(){

					  var url = $(this).data('video')
					// if(!love.mobile.config.tablet){
					// 	window.location = url;	
					// } else {
						love.mobile.global.videoModal(url);
					// }

				});

			}

		},

		contact : {

			init : function(){

				s.tc.imageWrap = $('.contact-images .center-fix');
				love.helpers.replaceSvg();

				$('.credit').appendTo($('.about-text'))
				
				$('body').off('preload-complete.contact').on('preload-complete.contact', function(){
					love.contact.flashKickOff();
					love.contact.stopIt();

					$.each(s.hc.portalImages, function(cat,images){
						love.mobile.contact.addMore(4, cat);
					});
				});
				love.contact.setupImages();

				$(window).on('resize.contact', function(){
					$('.email').css("z-index", 1);
				});

			}, 

			addMore : function(loadCounter, category){

				var imgsToLoad = 10
				  , $img = $('<img class="new" src="'+s.hc.portalImages[category][loadCounter].filename+'" style="display:none;">');

				$img.one('load', function(){
					$img.appendTo(s.tc.imageWrap);
				    loadCounter++;
				    if(loadCounter < imgsToLoad)
				    	love.contact.addMore(loadCounter, category);
				})
				if( $img[0].width ){ $img.trigger( 'load' ); }

			}

		}

	}

};

