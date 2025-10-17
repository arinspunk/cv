const footerYear = document.querySelector('.c-footer__year');
footerYear.textContent += ` ${new Date().getFullYear()}`;
const currentYear = document.querySelectorAll('.c-history__current-year');
currentYear.forEach(element => {
	element.textContent += `${new Date().getFullYear().toString().slice(-2)}`;
});

const inViewport = (element) => {
	const { top, bottom } = element.getBoundingClientRect();
	const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
	return !(top > viewportHeight || bottom < 0);
}

let scrollPos = 0;
const handleHeaderScroll = () => {
	const header = document.querySelector('header');
	const currentScrollPos = window.pageYOffset;
	const isScrollingUp = currentScrollPos < scrollPos;

	if (currentScrollPos > 250) {
		header.classList.toggle('c-header--hide', !isScrollingUp);
	}

	scrollPos = currentScrollPos;
};

const handleAppearScroll = () => {
	const myElements = document.getElementsByClassName('appears');
	Array.from(myElements).forEach(element => {
		if (inViewport(element)) {
			element.classList.add('appears--in');
		} else {
			element.classList.remove('appears--in');
		}
	});
};

const handleHistoryScroll = () => {
	const historyBlocks = document.querySelectorAll('.c-history__block');
	historyBlocks.forEach(element => {
		const child = element.querySelector('.c-history__subtitle');
		const { top: distanceFromTop, bottom: distanceFromBottom } = element.getBoundingClientRect();
		if (distanceFromTop <= 60 && distanceFromBottom >= 136) {
			child.classList.add('c-history__subtitle--fixed');
			child.classList.remove('c-history__subtitle--fixed-out');
		} else if (distanceFromTop <= 60 && distanceFromBottom >= 80) {
			child.classList.add('c-history__subtitle--fixed-out');
		} else {
			child.classList.remove('c-history__subtitle--fixed');
			child.classList.remove('c-history__subtitle--fixed-out');
		}
	});
};

let scrollTimeout;
const handleScroll = () => {
	handleHeaderScroll();
	handleAppearScroll();
	handleHistoryScroll();
};
document.addEventListener('scroll', () => {
	if (scrollTimeout) {
		window.cancelAnimationFrame(scrollTimeout);
	}
	scrollTimeout = window.requestAnimationFrame(handleScroll);
});

// Markdown download button
const downloadButton = document.getElementById('downloadMarkdown');
if (downloadButton) {
	downloadButton.addEventListener('click', () => {
		if (typeof MarkdownConverter !== 'undefined') {
			MarkdownConverter.convert();
		} else {
			console.error('MarkdownConverter not loaded');
		}
	});
}