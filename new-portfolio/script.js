container.onmouseover = container.onmouseout = handler;

		function handler(event) {

		function str(el) {
			if (!el) return "null"
			return el.className || el.tagName;
  			}

  			log.value += event.type + ': ' + 'target=' + str(event.target) +', relatedTarget=' + str(event.relatedTarget) + "\n";
  			log.scrollTop = log.scrollHeight;

		  	if (event.type == 'mouseover') {
		  		event.target.style.background = 'pink'
		  	}
		  	if (event.type == 'mouseout') {
		    event.target.style.background = ''
		  	}
		 }
		    // var idOut = "";
		    // var id = "";
		    // var previousID = "";

		    // window.onmouseover=function(e) {
      //   		id = e.target.id;
      //   		console.log(id + " in");

        		// if (id != "" && idOut != id || (idOut == "" && id == "")) {
        		// var elements = document.querySelectorAll("#"+id);
        		//    // if ( idOut == id && idOut == "") {
        		// 	for (var i = 0; i < elements.length; i++) {
        		// 		elements[i].classList.add("hover")        			
        		// 	}
        		// }
	   //      		for (var i = 0; i < elements.length; i++) {
    //     				elements[i].classList.remove("hover")        			
    //     			}
					// };
				// };
			// };

			// window.onmouseout=function(e) {
			// 	idOut = e.target.id;	
			// 	console.log(idOut + " out");

				// if (idOut != "" && idOut == id) {
				// 	var elements = document.querySelectorAll("#"+idOut);

				// 	for (var i = 0; i < elements.length; i++) {
    //     				elements[i].classList.remove("hover")        			
    //     			}

					// idOut = e.target.id;
					// previousID = e.target.id;

				// }
			// };

