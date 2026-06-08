document.addEventListener('DOMContentLoaded', () => {
    const renderer = new marked.Renderer();
    renderer.heading = function (tokenOrText, level) {
        const text = typeof tokenOrText === 'string' ? tokenOrText : tokenOrText.text;
        const depth = typeof tokenOrText === 'string' ? level : tokenOrText.depth;
        
        const slug = text.toLowerCase()
                         .replace(/[^\p{L}\p{N}]+/gu, '-')
                         .replace(/^-|-$/g, '');
                         
        return `<h${depth} id="${slug}"><a href="#${slug}" class="heading-anchor" title="Посилання на цей заголовок">${text} <span class="anchor-icon">#</span></a></h${depth}>`;
    };

    marked.setOptions({
        renderer: renderer,
        langPrefix: 'hljs language-',
        highlight: function(code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        }
    });

    let rawContent = document.getElementById('raw-content').textContent;
    const imagesNodes = document.querySelectorAll('#image-data span');
    
    const imageUrls = {};
    imagesNodes.forEach(span => {
        imageUrls[span.dataset.index] = span.dataset.url;
    });

    const imgRegex = /\{(new_)?img(\d+)\}/g;
    
    rawContent = rawContent.replace(imgRegex, (match, isNew, index) => {
        if (imageUrls[index]) {
            return `![Зображення](${imageUrls[index]})`;
        }
        return ''; 
    });

    const renderedHtml = marked.parse(rawContent);
    const container = document.getElementById('rendered-content');
    container.innerHTML = renderedHtml;

    container.querySelectorAll('img').forEach(img => {
        img.addEventListener('click', function() {
            if (typeof window.openModal === 'function') {
                window.openModal(this.src);
            }
        });
    });
});