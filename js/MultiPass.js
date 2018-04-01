	/*
	MultiPass.js - Kestas Kuliukas
	http://kestas.kuliukas.com/MultiPass/
	
	Used along with MultiPass.css and b64_md5.js, used in HTML like this:
	
		<div id="MultiPass">Loading..</div>
		<link rel="stylesheet" type="text/css" href="MultiPass.css" />
		<script type="text/javascript" src="b64_md5.js"></script>
		<script type="text/javascript" src="MultiPass.js"></script>
	
	*/
	
	// The three externally visible event handlers
	var onPassword, onPasswordConfirm, onNameURL;
	
	(function() {
		// Output the HTML
		document.getElementById('MultiPass').innerHTML = 
			'<table class="passwords">'+
			'<tr>'+
				'<td class="label">Password:</td>'+
				'<td class="input"><input id="password" onkeyup="onPassword();" type="password" /></td>'+
				'<td class="output"><input id="confirmCode" type="text" size="5" disabled="true" /></td>'+
			'</tr>'+
			'<tr>'+
				'<td class="label">Confirm:</td>'+
				'<td class="input"><input id="passwordConfirm" onkeyup="onPasswordConfirm();" type="password" /></td>'+
				'<td class="output"><input id="confirmCodeConfirm" type="text" size="5" disabled="true" /></td>'+
			'</tr>'+
			'</table>'+
			'<table class="generated">'+
			'<tr>'+
				'<td class="label">URL/Name:</td>'+
				'<td class="input"><input id="nameURL" onkeyup="onNameURL();" type="text" /></td>'+
				'<td class="output"><input id="generatedPassword" type="text" size="11" readonly="true" /></td>'+
			'</tr>'+
			'</table>';
		
		// Input areas
		var inputs = {
			password: document.getElementById('password'),
			passwordConfirm: document.getElementById('passwordConfirm'),
			nameURL: document.getElementById('nameURL')
		};
		// Output areas
		var outputs = {
			confirmCode: document.getElementById('confirmCode'),
			confirmCodeConfirm: document.getElementById('confirmCodeConfirm'),
			generatedPassword: document.getElementById('generatedPassword')
		};
		
		// Generate a 10-char code from some text
		function hash(txt) {
			// Because of how it was originally implemented the string to be hashed has to be reversed first
			var txtReversed = txt.split("").reverse().join("");
			return b64_md5(txtReversed).substring(0,10); // This function is defined in b64_md5.js
		}
		// Generate a confirm code; the master-password, salted, shortened
		function confirmCode(txt) {
			var fullHash = hash("Multi-Pass Salt - "+txt);
			return fullHash.substring(fullHash.length-4);
		}
		// An input changed; determine if nameURL input needs to be enabled/disabled or 
		// if generatedPassword needs to be generated/cleared.
		function valuesChanged() {
			if( inputs.password.value.length<8 || inputs.password.value != inputs.passwordConfirm.value ) {
				outputs.generatedPassword.value = '';
				inputs.nameURL.disabled=true;
			} else {
				if( inputs.nameURL.value.length == 0 ) {
					outputs.generatedPassword.value = '';
				} else {
					outputs.generatedPassword.value = hash(
						inputs.password.value + inputs.nameURL.value.toLowerCase()
					);
				}
				inputs.nameURL.disabled=false;
			}
		}
		// A master-password changed (either first or second), 
		function passwordChanged(input, output) {
			if( input.value.length < 8 ) {
				// Master-password size smaller than minimum allowed size
				// Provide a masked partial confirm-code, to acknowledge the user input
				var maskedCode='';
				switch(Math.floor(input.value.length*4/8)) {
					case 1: maskedCode='#'; break;
					case 2: maskedCode='##'; break;
					case 3: maskedCode='###'; break;
				}
				output.value=maskedCode;
			} else {
				output.value = confirmCode(input.value);
			}
			valuesChanged();
		}
		
		// onkeypress event handlers: globally accessible, defined here to allow access to functions
		onPassword = function() {
			passwordChanged(inputs.password, outputs.confirmCode);
		};
		onPasswordConfirm = function() {
			passwordChanged(inputs.passwordConfirm, outputs.confirmCodeConfirm);
		};
		onNameURL = function() {
			valuesChanged();
		};
		
	})();
