/*
this code comes from http://code.google.com/p/bibtex-js/
comments by François Schwarzentruber

this code has been modified and improved by Hamed Nemati
email: hnsnemati@gmail.com
*/

// Issues:
//  no comment handling within strings
//  no string concatenation
//  no variable values yet

// Grammar implemented here:
//  bibtex -> (string | preamble | comment | entry)*;
//  string -> '@STRING' '{' key_equals_value '}';
//  preamble -> '@PREAMBLE' '{' value '}';
//  comment -> '@COMMENT' '{' value '}';
//  entry -> '@' key '{' key ',' key_value_list '}';
//  key_value_list -> key_equals_value (',' key_equals_value)*;
//  key_equals_value -> key '=' value;
//  value -> value_quotes | value_braces | key;
//  value_quotes -> '"' .*? '"'; // not quite
//  value_braces -> '{' .*? '"'; // not quite



/*
 * 
 * 
 * example of template:
 * 
 *    [<span class="tag"></span>]
    <span class="author"></span>.
    <span class="title"></span>.
    <span class="booktitle"></span>
    <span class="if publisher">
	<span class="publisher"></span>.
    </span>
    <span class="if pages">
      p. <span class="pages"></span>.
    </span>
    <span class="if year">
    <span class="year"></span></span>
    </br>
    <span class="if url">
	<a class="url">
	    [download]
	</a>
    </span>
    <a class="bibtexCodeLink">
	    [bibtex]
    </a>
    </br></br>
 * 
 * 
 * 
 * 
 * 
 * 
 */

function Parser() {
/*position in the text that is parsed*/
  this.pos = 0;

/*text that is parsed*/
  this.input = "";
  
  this.entries = {};
  this.strings = {
      JAN: "January",
      FEB: "February",
      MAR: "March",      
      APR: "April",
      MAY: "May",
      JUN: "June",
      JUL: "July",
      AUG: "August",
      SEP: "September",
      OCT: "October",
      NOV: "November",
      DEC: "December"
  };
  this.currentKey = "";

/*this is the tag of the current entry*/
  this.currentEntry = "";
  

  this.setInput = function(t) {
    this.input = t;
  }
  
  this.getEntries = function() {
      return this.entries;
  }

  this.isWhitespace = function(s) {
    return (s == ' ' || s == '\r' || s == '\t' || s == '\n');
  }

  this.match = function(s) {
    this.skipWhitespace();
    if (this.input.substring(this.pos, this.pos+s.length) == s) {
      this.pos += s.length;
    } else {
      throw "Token mismatch, expected " + s + ", found " + this.input.substring(this.pos);
    }
    this.skipWhitespace();
  }

  this.tryMatch = function(s) {
    this.skipWhitespace();
    if (this.input.substring(this.pos, this.pos+s.length) == s) {
      return true;
    } else {
      return false;
    }
    this.skipWhitespace();
  }

/*skip all the whitespaces until something interesting appears*/
  this.skipWhitespace = function() {
    while (this.isWhitespace(this.input[this.pos])) {
      this.pos++;
    }
    if (this.input[this.pos] == "%") {
      while(this.input[this.pos] != "\n") {
        this.pos++;
      }
      this.skipWhitespace();
    }
  }

/*returns the value which is under braces*/
  this.value_braces = function() {
    var bracecount = 0;
    this.match("{");
    var start = this.pos;
    while(true) {
      if (this.input[this.pos] == '}' && this.input[this.pos-1] != '\\') {
        if (bracecount > 0) {
          bracecount--;
        } else {
          var end = this.pos;
          this.match("}");
          return this.input.substring(start, end);
        }
      } else if (this.input[this.pos] == '{') {
        bracecount++;
      } else if (this.pos == this.input.length-1) {
        throw "Unterminated value";
      }
      this.pos++;
    }
  }

/*returns the value which is under quotes*/
  this.value_quotes = function() {
    this.match('"');
    var start = this.pos;
    while(true) {
      if (this.input[this.pos] == '"' && this.input[this.pos-1] != '\\') {
          var end = this.pos;
          this.match('"');
          return this.input.substring(start, end);
      } else if (this.pos == this.input.length-1) {
        throw "Unterminated value:" + this.input.substring(start);
      }
      this.pos++;
    }
  }
  
  
  
  function takeCareAboutAccentsEtc(string)
  {
    return string.replace(/\\c{c}/g, "ç").replace(/\"{a}/g, "ä").replace(/\\'{a}/g, "á").replace("Hamed Nemati and", '').replace("and Hamed Nemati", '');
  }

/*returns the value that has to be read (maybe in {..}, in "..." or juste a character)*/
  this.single_value = function() {
    var start = this.pos;
    if (this.tryMatch("{")) {
      return takeCareAboutAccentsEtc(this.value_braces());
    } else if (this.tryMatch('"')) {
      return takeCareAboutAccentsEtc(this.value_quotes());
    } else {
      var k = this.key();
      if (this.strings[k.toUpperCase()]) {
        return takeCareAboutAccentsEtc(this.strings[k]);
      } else if (k.match("^[0-9]+$")) {
        return takeCareAboutAccentsEtc(k);
      } else {
        throw "Value expected:" + this.input.substring(start);
      }
    }
  }
  

/*read several value in one (separated with #)*/
  this.value = function() {
    var values = [];
    values.push(this.single_value());
    while (this.tryMatch("#")) {
      this.match("#");
      values.push(this.single_value());
    }
    return values.join("");
  }

/*read a key (for instance "author", "publisher", "title")*/
  this.key = function() {
    var start = this.pos;
    while(true) {
      if (this.pos == this.input.length) {
        throw "Runaway key";
      }
    
      if (this.input[this.pos].match("[a-zA-Z0-9_:\\./-]")) {
        this.pos++
      } else {
        return this.input.substring(start, this.pos).toUpperCase();
      }
    }
  }

/*read a "key = value" expression
returns an array of the form [ key, val ]*/
  this.key_equals_value = function() {
    var key = this.key();
    if (this.tryMatch("=")) {
      this.match("=");
      var val = this.value();
      return [ key, val ];
    } else {
      throw "... = value expected, equals sign missing:" + this.input.substring(this.pos);
    }
  }

/*read a list of "key = value" expressions*/
  this.key_value_list = function() {
    var kv = this.key_equals_value();
    this.entries[this.currentEntry][kv[0]] = kv[1];
    while (this.tryMatch(",")) {
      this.match(",");
      // fixes problems with commas at the end of a list
      if (this.tryMatch("}")) {
        break;
      }
      kv = this.key_equals_value();
      this.entries[this.currentEntry][kv[0]] = kv[1];
    }
	//this.entries[this.currentEntry]["author"] = "me";
  }


/* the key is already read, this function reads what is next after the key */
  this.entry_body = function() {
    this.currentEntry = this.key() + Math.random().toString();
    this.entries[this.currentEntry] = new Object(); 
    this.entries[this.currentEntry]["TAG"] = this.currentEntry;
    this.match(",");
    this.key_value_list();
  }

  this.directive = function () {
    this.match("@");
    return "@"+this.key();
  }

  this.string = function () {
    var kv = this.key_equals_value();
    this.strings[kv[0].toUpperCase()] = kv[1];
  }

  this.preamble = function() {
    this.value();
  }

  this.comment = function() {
    this.value(); // this is wrong
  }

  this.entry = function() {
    this.entry_body();
  }

  this.metadata = function(id) {
    while(this.tryMatch("@")) {
      this.posBegin = this.pos;
      var d = this.directive().toUpperCase();
      this.match("{");
      if (d == "@STRING") {
        this.string();
      } else if (d == "@PREAMBLE") {
        this.preamble();
      } else if (d == "@COMMENT") {
        this.comment();
      } else {
        this.entry();
	this.entries[this.currentEntry][id] = this.input.substring(this.posBegin, this.pos + 1);
      }
      this.match("}");
    }
  }
}

function doCORSRequest(options, printResult) {
  var overlay = new ItpOverlay();
  if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      x = new XMLHttpRequest();
  }
  else {
      // code for IE6, IE5
      x = new ActiveXObject("Microsoft.XMLHTTP");
  }
  x.open(options.method, options.url, true);
  x.onload = x.onerror = function() {
  printResult(
    (x.responseText || '')
   );
  };
  
  x.onloadstart = function(e) {
    overlay.show("body");
  };
  
  x.onloadend = function(e) {
    overlay.hide("body");
    page_draw();
  };
  
  x.send(options.data);
}

// function loadBib() {
//   var xmlhttp;
//   var overlay = new ItpOverlay();
//   if (window.XMLHttpRequest) {
//     xmlhttp = new XMLHttpRequest();
//   } else {
//     // code for older browsers
//     xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
//   }
//   xmlhttp.onreadystatechange = function() {
//     if (this.readyState == 4 && this.status == 200) {
//       document.getElementById('bibtex_input').innerHTML =
//       this.responseText;
//     }
//   };
//   xmlhttp.onloadstart = function(e) {
//     overlay.show("body");
//   };
//   
//   xmlhttp.onloadend = function(e) {
//     overlay.hide("body");
//     bibtex_js_draw();
//   };
//   
//   xmlhttp.open("GET", "https://raw.githubusercontent.com/hnemati/hnemati.github.io/master/biblio.bib", true);
//   xmlhttp.send();
// }

function loadFile(address) {
// Bind event
  var outputField = document.getElementById('blog_input');
  doCORSRequest({
   method: 'GET',
   url: address,
  }, function printResult(result) {
       outputField.value = result;
     })
};

