/*
Blog
*/

function displayPost(tpl, POSTCODE) {
    var alrt = (POSTCODE.split("Text")[1]).match(/\{([\s\S]*?)\}/).pop();
    tpl.find('.textCodeLink').html(" " + alrt);
}

function BlogDisplay() {
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
  
  this.displayPost = function(input, output) {
    // parse bibtex input
    var b = new Parser();
    b.setInput(input);
    b.metadata("POSTCODE");

    // save old entries to remove them later
    var old = output.find("*");    

    // iterate over bibTeX entries
    var entries = b.getEntries();
    for (var entryKey in entries) {
	if(entries[entryKey]["POSTCODE"].startsWith("@post{")){
      	      var entry = entries[entryKey];
 	      output.append("<h3><div class='posttitle'>" + entry["TITLE"] + "</div></h3>");

	      // find template
	      var tpl = $(".blog_template").clone().removeClass('blog_template');
	       
	      
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
	      
	      POSTCODE =  entry['POSTCODE'];
	      // Display Abstract
	      displayPost(tpl, POSTCODE);
    	    
	      output.append(tpl);	      
	      tpl.show();
	    }
	}  
    // remove old entries
    old.remove();
  }
}

function postShow(POSTCODE, div)
{
  (new BlogDisplay()).displayPost(POSTCODE, div);
}

function page_draw() {
  $(".blog_template").hide();
  postShow($("#blog_input").val(), $("#blog_display"));
}

// check whether or not jquery is present
if (typeof jQuery == 'undefined') {  
  // an interesting idea is loading jquery here. this might be added
  // in the future.
  alert("Please include jquery in all pages using bibtex_js!");
} else {
  // draw bibtex when loaded
  $(document).ready(function () {
    loadFile('https://bitbucket.org/hnemati/test/raw/639ead9c99d4eb65e77d4ed56f728331ced2a5d9/blog.bib');
  });
}
