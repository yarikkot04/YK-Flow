const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImg');

let scale = 1;
let panning = false;
let pointX = 0; let pointY = 0;
let startX = 0; let startY = 0;

function setTransform() {
    modalImg.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
}

window.openModal = function(src) {
    modalImg.src = src;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; 
    
    scale = 1; pointX = 0; pointY = 0;
    setTransform();
}

window.closeModal = function() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) window.closeModal();
    });
}

window.zoomImage = function(factor) {
    scale *= factor;
    scale = Math.min(Math.max(0.5, scale), 10);
    setTransform();
};

if (modalImg) {
    modalImg.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.wheelDelta ? e.wheelDelta : -e.deltaY;
        (delta > 0) ? (scale *= 1.1) : (scale /= 1.1);
        scale = Math.min(Math.max(0.5, scale), 10);
        setTransform();
    });

    modalImg.addEventListener('mousedown', (e) => {
        e.preventDefault();
        panning = true;
        startX = e.clientX - pointX;
        startY = e.clientY - pointY;
    });

    modalImg.addEventListener('mousemove', (e) => {
        if (!panning) return;
        pointX = e.clientX - startX;
        pointY = e.clientY - startY;
        setTransform();
    });

    window.addEventListener('mouseup', () => { panning = false; });
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('article.post-card').forEach(card => {
        const rawContentNode = card.querySelector('.markdown-content');
        const excerptNode = card.querySelector('.post-excerpt');
        
        if (rawContentNode && excerptNode) {
            let rawText = rawContentNode.textContent;
            
            rawText = rawText.replace(/\{(new_)?img\d+\}/g, '');
            rawText = rawText.replace(/```[\s\S]*?```/g, '');
            
            let html = marked.parse(rawText);
            
            let tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            let cleanText = tempDiv.textContent || tempDiv.innerText || "";
            
            cleanText = cleanText.trim();
            if (cleanText.length > 100) {
                cleanText = cleanText.substring(0, 100) + '...';
            }
            
            excerptNode.textContent = cleanText;
        }
    });

    if (typeof marked !== 'undefined') {
        marked.setOptions({
            highlight: function(code, lang) {
                const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                return hljs.highlight(code, { language }).value;
            }
        });

        document.querySelectorAll('.post-card').forEach(card => {
            const renderedNode = card.querySelector('.rendered-content');
            const rawContentNode = card.querySelector('.markdown-content');
            if(renderedNode && rawContentNode) {
                const rawContent = rawContentNode.textContent;
                renderedNode.innerHTML = marked.parse(rawContent);
            }
        });
    }
});