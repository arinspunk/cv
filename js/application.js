// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Footer Copyright Year 
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const footerYear = document.querySelector('.c-footer__year');
footerYear.textContent += new Date().getFullYear();


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Detect Scroll Down/Up
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// let scrollPos = 0 // Initial state
// // adding scroll event
// window.addEventListener('scroll', function(){
// 	if (window.pageYOffset>250) {
// 		// detects new state and compares it with the new one
// 		// Scroll up
// 		if ((document.body.getBoundingClientRect()).top > scrollPos) {
// 			header.classList.remove('c-header--hide')
// 		}
// 		// Scroll down
// 		else {
// 			header.classList.add('c-header--hide')
// 		}
// 		// saves the new position for iteration.
// 		scrollPos = (document.body.getBoundingClientRect()).top
// 	} else {}
// })

/*

Initializing the header variable at the beginning, outside the event listener, to avoid performing a DOM query every time the event is triggered.
Destructuring the body and pageYOffset variables to make the code more concise and readable.
Destructuring the top property from the result of getBoundingClientRect() to avoid multiple calls to that function, and storing the result in a isScrollingUp variable to make the code more readable.
Using a ternary operator to conditionally add or remove the c-header--hide class on the header element, instead of an if...else statement.
Removing the empty else block, since it doesn't have any effect on the behavior of the script.

*/

let scrollPos = 0;
const header = document.querySelector('header');

window.addEventListener('scroll', function() {
  const { body } = document;
  const { pageYOffset } = window;
  const { top } = body.getBoundingClientRect();
  const isScrollingUp = top > scrollPos;

  if (pageYOffset > 250) {
    isScrollingUp ? header.classList.remove('c-header--hide') : header.classList.add('c-header--hide');
    scrollPos = top;
  }
});


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Detect when element appears in viewport 
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// function inViewport(element){
// 	// Get the elements position relative to the viewport
// 	let bb = element.getBoundingClientRect()
// 	// Check if the element is outside the viewport
// 	// Then invert the returned value because you want to know the opposite
// 	return !(bb.top > innerHeight || bb.bottom < 0)
// }
// let myElement = document.getElementsByClassName('appears')
// // Listen for the scroll event
// document.addEventListener( 'scroll', event => {
// 	var i;
//  	for (i = 0; i < myElement.length; i++) {
//  		if( inViewport(myElement[i]) ){
// 			myElement[i].classList.add('appears--in')
// 		}
// 		else {}
// 	}
// })

/*

Cache frequently accessed variables: Instead of calling getBoundingClientRect() on each element every time inViewport() is called, you can cache the results in a variable to improve performance.

Use requestAnimationFrame instead of scroll event: The scroll event can be fired many times per second, leading to performance issues, especially on mobile devices. Using requestAnimationFrame can help throttle the number of function calls to only when the browser is ready to paint the screen.

Use classList.toggle() instead of classList.add() and classList.remove(): The classList.toggle() method can simplify the code by toggling the appears--in class on and off with a single method call.

*/

function inViewport(element){
	// Cache frequently accessed variables
	const bb = element.getBoundingClientRect();
	const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
	// Check if the element is outside the viewport
	// Then invert the returned value because you want to know the opposite
	return !(bb.top > viewportHeight || bb.bottom < 0);
}

const myElements = document.getElementsByClassName('appears');
const handleScroll = () => {
  const visibleElements = Array.from(myElements).filter(inViewport);
  visibleElements.forEach(element => element.classList.toggle('appears--in', true));
}

// Throttle scroll event with requestAnimationFrame
let scrollTimeout;
document.addEventListener('scroll', () => {
  if (scrollTimeout) {
    window.cancelAnimationFrame(scrollTimeout);
  }
  scrollTimeout = window.requestAnimationFrame(handleScroll);
});


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Fixed titles if it block is in viewport 
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// get the element you want to add the class to
const historyBlocks = document.querySelectorAll('.c-history__block');

// add a scroll event listener to the window
window.addEventListener('scroll', function() {
	historyBlocks.forEach(element => {
		const child = element.querySelector('.c-history__subtitle');
		// get the distance from the top of the viewport to the element
		let distanceFromTop = element.getBoundingClientRect().top;
		let distanceFromBottom = element.getBoundingClientRect().bottom;
		// check if the element is 40px from the top of the viewport
		if (distanceFromTop <= 60 && distanceFromBottom >= 136) {
			// add the class to the element
			child.classList.add('c-history__subtitle--fixed');
			child.classList.remove('c-history__subtitle--fixed-out');
		} else if (distanceFromTop <= 60 && distanceFromBottom >= 80){
			child.classList.add('c-history__subtitle--fixed-out');
		} else {
			child.classList.remove('c-history__subtitle--fixed');
			child.classList.remove('c-history__subtitle--fixed-out');
		}
	});
});