// check whether or not jquery is present
if (typeof jQuery == 'undefined') {  
  // an interesting idea is loading jquery here. this might be added
  // in the future.
  alert("Please include jquery!");
} else {
  (function(i,s,o,g,r,a,m){i['AfsAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
     m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
   })(window,document,'script','misc/stat.js','aa');
   aa('create', '01000624', 'auto');
   aa('set','autotrack','dataset');
   aa('send', 'pageview');
}

