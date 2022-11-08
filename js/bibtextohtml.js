/*
Biblio
*/

function openNav() {
  document.getElementById("myNav").style.height = "100%";
}

function closeNav() {
  document.getElementById("myNav").style.height = "0%";
}

function displayBibtex(tpl, bibTexCode) {
  tpl.find('.bibtexCodeLink').click(function() 
  {
    var alrt = document.getElementById('overtext');
    var ttl = document.getElementById('overtitle');
    ttl.innerText = "BibTeX Code:";
    alrt.value = (bibTexCode.split("Abstract")[0] + '}').split("  ").join("");
    openNav();
  }
 );
}

function displayAbstract(tpl, bibTexCode) {
  tpl.find('.abstractCodeLink').click(function() 
  {
    var alrt = document.getElementById('overtext');
    var ttl = document.getElementById('overtitle');
    ttl.innerText = "Abstract:";
    alrt.value = (bibTexCode.split("Abstract")[1]).match(/(?<=\{)([\s\S]*?)(?=\})/).pop();
    openNav();
  }
 );
}

function displayArtifact(tpl, bibTexCode) {
  if(bibTexCode.includes("Artifact")){		
     tpl.find('.artifactCodeLink').css('visibility', 'visible');
  }else{
     tpl.find('.artifactCodeLink').remove();
  } 	        
  tpl.find('.artifactCodeLink').click(function() 
  {
    var alrt = document.getElementById('overtext');
    try {
          alrt.value = (bibTexCode.split("Artifact")[1]).match(/\{(.*)\}/).pop();
	  window.location.href = alrt.value;
    } catch(err) {
    }
  }
 );
}

function displayAward(tpl, bibTexCode) {
  if(bibTexCode.includes("Award")){		
     tpl.find('.awardCodeLink').css('visibility', 'visible');
     try {
	  tpl.find('.fa-trophy').html((" " + (bibTexCode.split("Award")[1]).match(/\{(.*)\}/).pop()));
	 } catch(err) {
	  }
     	
  }else{
     	tpl.find('.awardCodeLink').remove();
  }
}

function displayInfo(tpl, bibTexCode) {
  if(bibTexCode.includes("Miscellaneous")){		
     tpl.find('.infoCodeLink').css('visibility', 'visible');
     try {
	  tpl.find('.infoCodeLink').html(" " + (bibTexCode.split("Miscellaneous")[1]).match(/\{(.*)\}/).pop());
	 } catch(err) {
	  }
     	
  }else{
     	tpl.find('.infoCodeLink').remove();
  }
}

function BibtexDisplay() {
  this.fixValue = function (value) {
    value = value.replace(/\\glqq\s?/g, "&bdquo;");
    value = value.replace(/\\grqq\s?/g, '&rdquo;');
    value = value.replace(/\\ /g, '&nbsp;');
    value = value.replace(/\\url/g, '');
    value = value.replace(/---/g, '&mdash;');
    value = value.replace(/{\\"a}/g, '&auml;');
    value = value.replace(/\{\\"o\}/g, '&ouml;');
    value = value.replace(/{\\"u}/g, '&uuml;');
    value = value.replace(/{\\"A}/g, '&Auml;');
    value = value.replace(/{\\"O}/g, '&Ouml;');
    value = value.replace(/{\\"U}/g, '&Uuml;');
    value = value.replace(/\\ss/g, '&szlig;');
    value = value.replace(/\{(.*?)\}/g, '$1');
    return value;
  }
  
  this.displayBibtex = function(input, output) {
    // parse bibtex input
    var b = new Parser();
    b.setInput(input);
    b.metadata("BIBTEXCODE");
    var counter = 0;
    var eid = 'artifact';

    var yearOfPreviousEntry = undefined;
    // save old entries to remove them later
    var old = output.find("*");    

    // iterate over bibTeX entries
    var entries = b.getEntries();
    for (var entryKey in entries) {
	if(!entries[entryKey]["BIBTEXCODE"].startsWith("@proceedings{")){
      	      var entry = entries[entryKey];
      
	      if(entry["YEAR"] != yearOfPreviousEntry)
	      {
		    output.append("<div class='yearpublication'>" + entry["YEAR"] + "</div>");
		    yearOfPreviousEntry = entry["YEAR"];
	      }

	      // find template
	      var tpl = $(".bibtex_template").clone().removeClass('bibtex_template');
	       
	      
	      // find all keys in the entry
	      var keys = [];
	      for (var key in entry) {
		keys.push(key.toUpperCase());
	      }
	      
	      // find all ifs and check them
	      var removed = false;
	      do {
		// find next if
		var conds = tpl.find(".if");
		if (conds.length == 0) {
		  break;
		}
		
		// check if
		var cond = conds.first();
		cond.removeClass("if");
		var ifTrue = true;
		var classList = cond.attr('class').split(' ');
		$.each( classList, function(index, cls){
		  if(keys.indexOf(cls.toUpperCase()) < 0) {
		    ifTrue = false;
		  }
		  cond.removeClass(cls);
		});
		
		// remove false ifs
		if (!ifTrue) {
		  cond.remove();
		}
	      } while (true);
	      
	      // fill in remaining fields 
	      for (var index in keys) {
		var key = keys[index];
		var value = entry[key] || "";
		tpl.find("span:not(a)." + key.toLowerCase()).html(this.fixValue(value));
		tpl.find("a." + key.toLowerCase()).attr('href', this.fixValue(value));
	      }
	      
	      bibTexCode =  entry['BIBTEXCODE'];
	      // Display biblio
	      displayBibtex(tpl, bibTexCode);
	      // Display Abstract
	      displayAbstract(tpl, bibTexCode);
	      // Dispaly Artifact
	      displayArtifact(tpl, bibTexCode);
	      // Display Awards
	      displayAward(tpl, bibTexCode);
	      // Display additional info
	      displayInfo(tpl, bibTexCode);	    
	    	    
	      output.append(tpl);	      
	      tpl.show();
	    }
	}  
    // remove old entries
    old.remove();
  }
}

function bibtexShow(bibtexCode, div)
{
  (new BibtexDisplay()).displayBibtex(bibtexCode, div);
}

function page_draw() {
  $(".bibtex_template").hide();
  bibtexShow($("#bibtex_input").val(), $("#bibtex_display"));
}

function loadFile(address) {
// Bind event
  var outputField = document.getElementById('bibtex_input');
  doCORSRequest({
   method: 'GET',
   url: address,
  }, function printResult(result) {
       outputField.value = result;
     })
};

// check whether or not jquery is present
if (typeof jQuery == 'undefined') {  
  // an interesting idea is loading jquery here. this might be added
  // in the future.
  alert("Please include jquery in all pages using bibtex_js!");
} else {
  // draw bibtex when loaded
  $(document).ready(function () {
    loadFile('https://raw.githubusercontent.com/hnemati/hnemati.github.io/master/biblio.bib');
  });
}
