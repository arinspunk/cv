const siteBody = document.querySelector('.body')

let totalWidth = window.innerWidth
	header     = document.querySelector('.c-header')


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Detect Scroll Down/Up
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

let scrollPos = 0 // Initial state
// adding scroll event
window.addEventListener('scroll', function(){
	if (window.pageYOffset>250) {
		// detects new state and compares it with the new one
		// Scroll up
		if ((document.body.getBoundingClientRect()).top > scrollPos) {
			header.classList.remove('c-header--hide')
		}
		// Scroll down
		else {
			header.classList.add('c-header--hide')
		}
		// saves the new position for iteration.
		scrollPos = (document.body.getBoundingClientRect()).top
	} else {}
})


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Detect when element appears in viewport 
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function inViewport(element){
	// Get the elements position relative to the viewport
	let bb = element.getBoundingClientRect()
	// Check if the element is outside the viewport
	// Then invert the returned value because you want to know the opposite
	return !(bb.top > innerHeight || bb.bottom < 0)
}
let myElement = document.getElementsByClassName('appears')
// Listen for the scroll event
document.addEventListener( 'scroll', event => {
	var i;
 	for (i = 0; i < myElement.length; i++) {
 		if( inViewport(myElement[i]) ){
			myElement[i].classList.add('appears--in')
		}
		else {}
	}
})