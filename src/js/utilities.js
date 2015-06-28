var confirm, alert, normalizeNewlines, limitStrLen;

(function() {
	"use strict";

	// Extend the keyCode constants with values only needed in this app
	$.extend(keyCode, {
		N: 78,
		O: 79,
		S: 83,
		T: 84,
		W: 87,
		Y: 89,
		Z: 90,
		1: 49,
		2: 50,
		3: 51,
		4: 52,
		5: 53,
		6: 54,
		7: 55,
		8: 56,
		9: 57,
		F4: 115,
		PGUP: 33,
		PGDOWN: 34,
		ARROWLEFT: 37,
		ARROWRIGHT: 39
	});

	confirm = function(text, buttons) {
		return new Promise(function(resolvePromise, rejectPromise) {
			rejectPromise = rejectPromise.bind(null, confirm.REJECTION_MSG);

			if (typeof buttons == "undefined") buttons = [new confirm.Button(confirm.Button.CANCEL_BUTTON), new confirm.Button(confirm.Button.OK_BUTTON)];

			var modal = new Modal({
				content: text,
				buttons: buttons.join(""),

				onInit: function() {
					var modal = this;

					modal.el.on("close.modal", function() { rejectPromise() });

					modal.buttonsEls.filter("[data-action=\"cancel\"]").on("click", function(e) {
						e.preventDefault();
						rejectPromise();
						modal.close();
					});

					modal.buttonsEls.filter("[data-action=\"confirm\"]").on("click", function(e) {
						e.preventDefault();
						resolvePromise($(e.target).data("value"));
						modal.close();
					});
				}
			});

			modal.show();
		});
	};

	confirm.REJECTION_MSG = "User closed confirm modal.";

	confirm.Button = (function() {
		// Yes, I'm using a constructor to return a string (well, a String obj). "new Button()" looks cool, and it's abstracted enough that we don't care what's underneath.
		var Button = function(options) {
				return new String("<a href=\"#\" class=\""+ options.class +"\" data-action=\""+ options.dataAction +"\" data-value=\""+ options.dataValue +"\">"+ options.text +"</a>");
			},

			ButtonConfig = function(options) {
				$.extend(this, options);
			};

		ButtonConfig.prototype.extend = function(options) {
			return $.extend({}, this, options);
		};

		// Sets of options
		Button.CANCEL_BUTTON = new ButtonConfig({
			class: "button",
			dataAction: "cancel",
			text: "Cancel"
		});
		Button.OK_BUTTON = new ButtonConfig({
			class: "button button-primary",
			dataAction: "confirm",
			text: "Ok"
		});

		return Button;
	})();

	alert = function(text) {
		var modal = new Modal({
			content: text,
			buttons: new confirm.Button(confirm.Button.OK_BUTTON),

			onInit: function() {
				var modal = this;

				modal.buttonsEls.on("click", function(e) {
					e.preventDefault();
					modal.close();
				});
			}
		});

		modal.show();
	};

	// The editor regularly compares files' contents to detect changes, and different line break format will mess with the result.
	// Chrome (and all browsers) already normalize line breaks as LF characters inside a form element's API value (which is 
	// W3C lingo for "an element's `value` IDL attribute") (see http://www.w3.org/TR/html5/forms.html#attr-textarea-wrap). Hence,
	// normalizing line breaks in text that doesn't get through that native normalization (text that doesn't get in and out
	// the editor's textarea) seems like the sanest way to go.
	normalizeNewlines = function(str) {
		return String(str).replace(/\r/g, "");
	};

	// Since promises swallow uncaught errors and rejections, another way had to be found to keep an eye on them: .done()
	// When using promises, you should *always* either return the promise (to continue chaining), or end the chain with .done()
	// .done()'s sole purpose is to (re)throw errors for any uncaught error or rejection. It doesn't return anything so that you can only use it to end a chain.
	// It's a temporary failsafe while the spec keeps evolving, hopefully in a way that solves this issue in the first place, like Mozilla has done with Promise.jsm.
	// Make sure to throw errors and reject promises with Error objects to get a stack trace.
	// One issue with this implementation is that keeping track of chaining can be become hard when storing promises inside variables to pick up chaining somewhere 
	// else. You'll have to make the effort to keep track of that and end all chains with .done() nonetheless. Mozilla's approach is superior in that it hooks to GC to 
	// keep track of promises even outside of a chain, but you need access to the innards of a browser for that.
	// One other implementation idea would be to create a wrapper around promises in the form of a regular object with isResolved and isRejected properties, internally 
	// updated by the wrapper's .then() and .catch() methods. That'd allow to Object.observe() these changes and keep an eye on all promises without boilerplate method 
	// like .done() and without access to the browser's internals.
	Promise.prototype.done = function() {
		this.catch(function(e) {
			console.error("Uncaught error or rejection inside Promise", e);
		});
	};

	// Limit the length of a string by, if it's longer than intended, remove text from the middle and inserting an ellipsis
	limitStrLen = function(str, length) {
		if (str.length > length) length = length / 2 - 1, str = str.substr(0, length) +"…"+ str.substr(-length);

		return str;
	};
})();