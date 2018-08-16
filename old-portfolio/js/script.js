$(function() {


/*-------------------------------------------
Load Page
---------------------------------------------*/
		
	$('body').waitForImages({
		finished: function() {
				Website();
				$('body').jKit();
		},
		waitForAll: true
	});


/*-------------------------------------------
Ajax link page transitions
---------------------------------------------*/

	$("a.ajax-link").live("click", function(){
		$this = $(this);
		var link = $this.attr('href');
		var current_url = $(location).attr('href');	
		
		if( link != current_url && link != '#') { 
		$.ajax({
			url:link,
		processData:true, 
			dataType:'html', 
			success:function(data){
				document.title = $(data).filter('title').text(); 
				current_url = link;
        if (typeof history.pushState != 'undefined') history.pushState(data, 'Page', link);
        
          setTimeout(function(){						
          $('#preloader').delay(50).fadeIn(600);
          $('html, body').delay(1000).animate({ scrollTop:  0  },1000);						
					
					setTimeout(function(){
							
            $('#ajax-content').html($(data).filter('#ajax-content').html());
            $('#ajax-sidebar').html($(data).filter('#ajax-sidebar').html());

						$('body').waitForImages({
							finished: function() {
								Website();
								backLoading();
								$('.opacity-nav').delay(50).fadeOut(600);
              },										
              waitForAll: true
						});								
					},1000);
					},0);
			}
		});
    }
    drawCircles();
    return false;
	});

/*-------------------------------------------
Scroll link on index - allows a scroll to
-------------------------------------------*/

$("a.scroll-link").click( function(e) {
  e.preventDefault();
  var destination = $(e.currentTarget).attr('href');
  $('.opacity-nav').delay(50).fadeOut(600);
  $(window).scrollTo($(destination), 1000, {axis: 'y'});
});

/*-------------------------------------------
When you click back arrow
---------------------------------------------*/


function backLoading() {  
    $(window).on("popstate", function () {
        $('body').fadeOut('slow',function(){
            location.reload();
        });
        $('body').fadeIn();
    });
}   

/*-------------------------------------------
Load Page - next Open Site
---------------------------------------------*/

function Website() {
		CheckScripts();		
		Masonry();
		$('body').jKit();
		backgroundmenu();
		setTimeout(function(){
			$(".preloader").fadeOut(500);							
		},2000);
		setTimeout(function(){
			$('header').fadeIn();							
		},500);
}


/*-------------------------------------------
Init and check list scripts
---------------------------------------------*/

function CheckScripts() {

  $(document).ready(function(){
    preloaderCheck();
    Typewriting();
    sidebarhero();
  });

}


/*-------------------------------------------
Masonry Check Script
---------------------------------------------*/

function Masonry() {
       var $container = $('.portfolio-grid');
     
       $container.imagesLoaded( function(){
         $container.masonry({
           itemSelector : 'li'
         });
       });
}


/*-------------------------------------------
Multi purpose init Background menu
---------------------------------------------*/

function backgroundmenu() {

  $(document).ready(function(){
     if($("#header-fade").length) {

         $(window).scroll(function(){
            if ($(this).scrollTop() > 10) {
                $('header').fadeOut();
            } else {
                $('header').fadeIn();
            }
        }); 
     }
     
     if($("#header-white").length) {

         $(window).scroll(function(){
            if ($(this).scrollTop() > 10) {
                $('header').css( "background", "white" );
                $('header .logo > a').css( "borderBottom", "0" );

            } else {
                $('header').css( "background", "none" );
            }
        }); 
     }

   
  });

}

/*-------------------------------------------
Typewriting init script
---------------------------------------------*/

function Typewriting() {


$(document).ready(function(){
  drawCircles();
	setTimeout( function(){
		if($("#site-type").length) {
        $(".typewrite span").typed({
            strings: ["hi there", "hi there"],
            typeSpeed: 100,
            backDelay: 1000,
            loop: false,
            contentType: 'text', // or text
            // defaults to false for infinite loop
            // loopCount: 7,
        });
    }
	}, 3000);
});
}

/*-------------------------------------------
skil set
---------------------------------------------*/
$(document).ready(function() {
  $('.css').css('width', '90%');
  $('.html').css('width', '100%');
  $('.adobe-af').css('width', '80%');
  $('.git').css('width', '55%');
  $('.sql').css('width', '95%');
  $('.axure').css('width', '80%');
  $('.python').css('width', '50%');
  $('.jira').css('width', '70%');
});
/*-------------------------------------------
Amazing Fade with scroll Sidebar
---------------------------------------------*/

function sidebarhero() {

  if($("#hero").length) {
    var fadeStart=100,fadeUntil=800,fading = $('#hero');

    $(window).bind('scroll', function(){
        var offset = $(document).scrollTop()
            ,opacity=0
        ;
        if( offset<=fadeStart ){
            opacity=1;
        }else if( offset<=fadeUntil ){
            opacity=1-offset/fadeUntil;
        }
        fading.css('opacity',opacity);
    });
  } 
}


/*-------------------------------------------
Open Check Scription
---------------------------------------------*/

function OpenCheck() {
    setTimeout(function() {
        hidePreloader();
    }, 1000);
}


/*-------------------------------------------
Check Preloader
---------------------------------------------*/

function preloaderCheck() {
    showPreloader();
    $(window).load(function() {
        hidePreloader();
    });
}

/*-------------------------------------------
Functions Show / Hide Preloader
---------------------------------------------*/

function showPreloader() {
  $(".preloader").fadeIn("slow");
}

function hidePreloader() {
  $(".preloader").delay(2000).fadeOut("slow");
}

/*-------------------------------------------
Pie chart / Functions
---------------------------------------------*/

var drawCircles = function() {
  function $$(selector, context) {
    context = context || document;
    var elements = context.querySelectorAll(selector);
    return Array.prototype.slice.call(elements);
  } 

   $$('.pie').forEach(function(pie) {
    var p = parseFloat(pie.textContent);
    var NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(NS, "svg");
    var circle = document.createElementNS(NS, "circle");
    var title = document.createElementNS(NS, "title");
    
    circle.setAttribute("r", 16);
    circle.setAttribute("cx", 16);
    circle.setAttribute("cy", 16);
    circle.setAttribute("stroke-dasharray", p + " 100");
    circle.setAttribute("fill", "#009999")
    
    svg.setAttribute("viewBox", "0 0 32 32");
    svg.setAttribute("width", "100px");
    svg.setAttribute("height", "100px");
    svg.setAttribute("background", "#009999");
    title.textContent = pie.textContent;
    pie.textContent = '';
    svg.appendChild(title);
    svg.appendChild(circle);
    pie.appendChild(svg);
  });


   $$('.label').forEach(function(label) {
    var c = String(label.textContent);
    var NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(NS, "svg");
    var circle = document.createElementNS(NS, "circle");
    var title = document.createElementNS(NS, "title");
    
    svg.setAttribute("viewBox", "0 0 5 5");
    svg.setAttribute("width", "10px");
    svg.setAttribute("height", "10px");
    svg.setAttribute("background", c);
    circle.setAttribute("r", 2);
    circle.setAttribute("cx", 2);
    circle.setAttribute("cy", 2);
    circle.setAttribute("fill", c);
    
    title.textContent = label.textContent;
    svg.appendChild(title);
    svg.appendChild(circle);
    label.appendChild(svg);
  });

   $$('.label2n').forEach(function(label2n) {
    var c = String(label2n.textContent);
    var NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(NS, "svg");
    var circle = document.createElementNS(NS, "circle");
    var title = document.createElementNS(NS, "title");
    
    svg.setAttribute("viewBox", "0 0 5 5");
    svg.setAttribute("width", "10px");
    svg.setAttribute("height", "10px");
    svg.setAttribute("background", "#009999");
    circle.setAttribute("r", 2);
    circle.setAttribute("cx", 2);
    circle.setAttribute("cy", 2);
    circle.setAttribute("fill", "#009999");
    
    title.textContent = label2n.textContent;
    svg.appendChild(title);
    svg.appendChild(circle);
    label2n.appendChild(svg);
  });

  $$('.label2y').forEach(function(label2y) {
    var c = String(label2y.textContent);
    var NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(NS, "svg");
    var circle = document.createElementNS(NS, "circle");
    var title = document.createElementNS(NS, "title");
    
    svg.setAttribute("viewBox", "0 0 5 5");
    svg.setAttribute("width", "10px");
    svg.setAttribute("height", "10px");
    svg.setAttribute("background", "#000");
    circle.setAttribute("r", 2);
    circle.setAttribute("cx", 2);
    circle.setAttribute("cy", 2);
    circle.setAttribute("fill", "#000");
    
    title.textContent = label2y.textContent;
    svg.appendChild(title);
    svg.appendChild(circle);
    label2y.appendChild(svg);
  });
 
};
  



/*-------------------------------------------
Canvas / Stuff
---------------------------------------------*/
  // var c = document.getElementById("PrimaryCanvas");
  // var ctx = c.getContext("2d");

  //   var gradient = ctx.createLinearGradient(0,0,400,0);
  //   gradient.addColorStop(0, 'white');
  //   gradient.addColorStop(0.027, 'peachpuff');
  //   gradient.addColorStop(0.054, 'purple');
  //   gradient.addColorStop(0.081, 'aqua');
  //   gradient.addColorStop(0.108, 'blue');
  //   gradient.addColorStop(0.135, 'lime');
  //   gradient.addColorStop(0.162, 'salmon');
  //   gradient.addColorStop(0.189, 'tan');
  //   gradient.addColorStop(0.216, 'orange');
  //   gradient.addColorStop(0.243, 'teal');
  //   gradient.addColorStop(0.27, 'lightblue');
  //   gradient.addColorStop(0.297, 'fuchsia');
  //   gradient.addColorStop(0.324, 'gray');
  //   gradient.addColorStop(0.351, 'silver');
  //   gradient.addColorStop(0.378, 'navy');
  //   gradient.addColorStop(0.405, 'green');
  //   gradient.addColorStop(0.432, 'lightgreen');
  //   gradient.addColorStop(0.459, 'maroon');
  //   gradient.addColorStop(0.486, 'red');
  //   gradient.addColorStop(0.514, 'pink');
  //   gradient.addColorStop(0.541, 'yellow');
  //   gradient.addColorStop(0.568, 'lightpink');
  //   gradient.addColorStop(0.595, 'khaki');
  //   gradient.addColorStop(0.622, 'saddlebrown');
  //   gradient.addColorStop(0.649, 'olive');
  //   gradient.addColorStop(0.676, 'thistle');
  //   gradient.addColorStop(0.703, 'darkgoldenrod');
  //   gradient.addColorStop(0.73, 'indianred');
  //   gradient.addColorStop(0.757, 'brown');
  //   gradient.addColorStop(0.784, 'peru');
  //   gradient.addColorStop(0.811, 'darkslategray');
  //   gradient.addColorStop(0.838, 'sienna');
  //   gradient.addColorStop(0.865, 'darkseagreen');
  //   gradient.addColorStop(0.892, 'darkolivegreen');
  //   gradient.addColorStop(0.919, 'gainsboro');
  //   gradient.addColorStop(0.946, 'black');
  //   gradient.addColorStop(0.973, 'lightsteelblue');
  //   gradient.addColorStop(1, 'rosybrown');


  // ctx.fillStyle = gradient;

  // ctx.fillRect(0,0,400,200); 

})//End1