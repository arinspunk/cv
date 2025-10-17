/**
 * Markdown Converter Module
 * Converts blog post HTML to Markdown format
 */

const MarkdownConverter = (() => {
	
	/**
	 * Convert HTML element to Markdown syntax
	 * @param {HTMLElement} element - DOM element to convert
	 * @param {number} index - Index for ordered lists
	 * @returns {string} Markdown formatted text
	 */
	const convertElement = (element, index = 0) => {
		const tag = element.tagName.toLowerCase();
		const text = element.textContent.trim();
		
		switch (tag) {
			case 'h1':
				return `# ${text}\n\n`;
			
			case 'h2':
				return `## ${text}\n\n`;
			
			case 'h3':
				return `### ${text}\n\n`;
			
			case 'p':
				return convertInlineElements(element) + '\n\n';
			
			case 'a':
				return `[${text}](${element.href})`;
			
			case 'code':
				return `\`${text}\``;
			
			case 'pre':
				return convertCodeBlock(element);
			
			case 'em':
				return `*${text}*`;
			
			case 'strong':
				return `**${text}**`;
			
			case 'img':
				return `![${element.alt || ''}](${element.src})\n\n`;
			
			default:
				return '';
		}
	};
	
	/**
	 * Convert code blocks with special handling for prompt class
	 * @param {HTMLElement} pre - Pre element containing code
	 * @returns {string} Markdown code block
	 */
	const convertCodeBlock = (pre) => {
		const code = pre.querySelector('code');
		const content = code ? code.textContent : pre.textContent;
		return `\`\`\`\n${content}\n\`\`\`\n\n`;
	};
	
	/**
	 * Convert inline elements within paragraphs
	 * @param {HTMLElement} element - Paragraph or text container
	 * @returns {string} Markdown with inline formatting
	 */
	const convertInlineElements = (element) => {
		let result = '';
		
		element.childNodes.forEach(node => {
			if (node.nodeType === Node.TEXT_NODE) {
				result += node.textContent;
			} else if (node.nodeType === Node.ELEMENT_NODE) {
				const tag = node.tagName.toLowerCase();
				
				switch (tag) {
					case 'a':
						result += `[${node.textContent}](${node.href})`;
						break;
					case 'code':
						result += `\`${node.textContent}\``;
						break;
					case 'em':
						result += `*${node.textContent}*`;
						break;
					case 'strong':
						result += `**${node.textContent}**`;
						break;
					default:
						result += node.textContent;
				}
			}
		});
		
		return result;
	};
	
	/**
	 * Convert list items to Markdown
	 * @param {HTMLElement} list - UL or OL element
	 * @returns {string} Markdown list
	 */
	const convertList = (list) => {
		const isOrdered = list.tagName.toLowerCase() === 'ol';
		let result = '';
		
		list.querySelectorAll('li').forEach((li, index) => {
			const text = convertInlineElements(li);
			result += isOrdered 
				? `${index + 1}. ${text}\n` 
				: `- ${text}\n`;
		});
		
		return result + '\n';
	};
	
	/**
	 * Extract and convert blog post content to Markdown
	 * @param {HTMLElement} container - Content container element
	 * @returns {string} Complete Markdown document
	 */
	const extractContent = (container) => {
		let markdown = '';
		
		container.childNodes.forEach(node => {
			if (node.nodeType !== Node.ELEMENT_NODE) return;
			
			const tag = node.tagName.toLowerCase();
			
			if (tag === 'ul' || tag === 'ol') {
				markdown += convertList(node);
			} else if (tag === 'img') {
				markdown += convertElement(node);
			} else if (tag === 'pre') {
				markdown += convertCodeBlock(node);
			} else if (['h1', 'h2', 'h3', 'p'].includes(tag)) {
				markdown += convertElement(node);
			}
		});
		
		return markdown.trim();
	};
	
	/**
	 * Generate filename from post title and date
	 * @returns {string} Sanitized filename with .md extension
	 */
	const generateFilename = () => {
		const titleElement = document.querySelector('.h1--blog');
		const timeElement = document.querySelector('time');
		
		if (!titleElement) return 'post.md';
		
		// Sanitize title
		let filename = titleElement.textContent
			.trim()
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '') // Remove diacritics
			.replace(/[^a-z0-9]+/g, '-')      // Replace non-alphanumeric with dash
			.replace(/^-+|-+$/g, '');          // Remove leading/trailing dashes
		
		// Add date if available
		if (timeElement) {
			const date = timeElement.getAttribute('datetime');
			if (date) {
				const dateStr = date.split(' ')[0].replace(/-/g, '');
				filename += `-${dateStr}`;
			}
		}
		
		return `${filename}.md`;
	};
	
	/**
	 * Download markdown content as file
	 * @param {string} content - Markdown content
	 * @param {string} filename - Filename for download
	 */
	const downloadMarkdown = (content, filename) => {
		const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		
		link.href = url;
		link.download = filename;
		link.click();
		
		// Cleanup
		setTimeout(() => URL.revokeObjectURL(url), 100);
	};
	
	/**
	 * Main conversion function - extracts post and triggers download
	 */
	const convertAndDownload = () => {
		try {
			// Get post title
			const titleElement = document.querySelector('.h1--blog');
			const title = titleElement ? `# ${titleElement.textContent.trim()}\n\n` : '';
			
			// Get post content
			const container = document.querySelector('.c-info__content');
			if (!container) {
				console.error('Content container not found');
				return;
			}
			
			const content = extractContent(container);
			const markdown = title + content;
			const filename = generateFilename();
			
			downloadMarkdown(markdown, filename);
		} catch (error) {
			console.error('Error converting to markdown:', error);
		}
	};
	
	// Public API
	return {
		convert: convertAndDownload
	};
	
})();

