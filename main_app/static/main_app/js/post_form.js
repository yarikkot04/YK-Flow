document.addEventListener('DOMContentLoaded', () => {
    const postForm = document.getElementById('post-form');
    const isEditing = postForm.dataset.isEditing === 'true';
    const originalTextarea = document.querySelector('[name="content"]');

    window.imagePrefix = isEditing ? "new_img" : "img";

    function loadExistingBlocks() {
        if (!isEditing || !originalTextarea || originalTextarea.value.trim() === '') {
            addBlock('text');
            return;
        }

        let content = originalTextarea.value;
        const codeRegex = /```([\w-]*)\n([\s\S]*?)```/g;
        const imgRegex = /\{(new_)?img\d+\}/g; 
        const markdownImgRegex = /!\[.*?\]\(.*?\)/g; 

        const codeBlocks = [];
        content = content.replace(codeRegex, (match, lang, code) => {
            codeBlocks.push({ lang, code: code.trim() });
            return `___CODE_BLOCK_${codeBlocks.length - 1}___`;
        });

        const imgBlocks = [];
        content = content.replace(imgRegex, (match) => {
            imgBlocks.push(match);
            return `___IMG_BLOCK_${imgBlocks.length - 1}___`;
        });
        content = content.replace(markdownImgRegex, (match) => {
            imgBlocks.push(match);
            return `___IMG_BLOCK_${imgBlocks.length - 1}___`;
        });

        const parts = content.split(/\n\s*\n/);
        parts.forEach(part => {
            let trimmedPart = part.trim();
            if (!trimmedPart) return;

            const codeMatch = trimmedPart.match(/^___CODE_BLOCK_(\d+)___$/);
            if (codeMatch) {
                const blockData = codeBlocks[parseInt(codeMatch[1])];
                addBlock('code', blockData.code, blockData.lang);
                return;
            }

            const imgMatch = trimmedPart.match(/^___IMG_BLOCK_(\d+)___$/);
            if (imgMatch) {
                addBlock('image', imgBlocks[parseInt(imgMatch[1])]);
                return;
            }

            let restoredText = trimmedPart;
            codeBlocks.forEach((block, idx) => {
                restoredText = restoredText.replace(`___CODE_BLOCK_${idx}___`, `\`\`\`${block.lang}\n${block.code}\n\`\`\``);
            });
            imgBlocks.forEach((block, idx) => {
                restoredText = restoredText.replace(`___IMG_BLOCK_${idx}___`, block);
            });

            addBlock('text', restoredText);
        });
    }

    loadExistingBlocks();

    postForm.addEventListener('submit', (e) => {
        try {
            compileBlocks();
            const contentField = document.querySelector('[name="content"]');
            
            if (!contentField || contentField.value.trim() === '') {
                e.preventDefault();
                alert('Помилка: Пост не може бути порожнім! Заповніть хоча б один текстовий блок.');
                return;
            }

            const fileInputs = document.querySelectorAll('input[type="file"][name="images"]');
            fileInputs.forEach(input => {
                if (!input.files || input.files.length === 0) {
                    input.removeAttribute('name');
                }
            });

        } catch (err) {
            console.error("Помилка збирання блоків:", err);
            e.preventDefault();
            alert('Сталася внутрішня помилка конструктора. Перевірте консоль браузера.');
        }
    });

    document.getElementById('block-editor').addEventListener('keydown', function(e) {
        if (e.target.tagName.toLowerCase() === 'textarea' && e.target.classList.contains('block-data')) {
            const el = e.target;
            
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = el.selectionStart;
                const end = el.selectionEnd;
                el.value = el.value.substring(0, start) + "    " + el.value.substring(end);
                el.selectionStart = el.selectionEnd = start + 4;
            }

            if (e.key === 'Enter') {
                const lines = el.value.substring(0, el.selectionStart).split('\n');
                const lastLine = lines[lines.length - 1];
                const match = lastLine.match(/^(\s*)([*-]|\d+\.)\s+(.*)$/);
                
                if (match) {
                    e.preventDefault();
                    const indent = match[1];
                    const bullet = match[2];
                    const content = match[3];

                    if (!content.trim()) {
                        el.value = el.value.substring(0, el.selectionStart - lastLine.length) + el.value.substring(el.selectionEnd);
                        el.selectionStart = el.selectionEnd = el.value.length;
                        return;
                    }

                    let nextBullet = bullet;
                    if (/\d+\./.test(bullet)) {
                        nextBullet = (parseInt(bullet) + 1) + '.';
                    }

                    const insertText = '\n' + indent + nextBullet + ' ';
                    const start = el.selectionStart;
                    el.value = el.value.substring(0, start) + insertText + el.value.substring(el.selectionEnd);
                    el.selectionStart = el.selectionEnd = start + insertText.length;
                }
            }
        }
    });
});

window.formatText = function(btn, type) {
    const block = btn.closest('.editor-block');
    const textarea = block.querySelector('textarea.block-data');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let prefix = '';
    let suffix = '';
    let placeholder = '';

    switch (type) {
        case 'h1':
            prefix = '# '; suffix = ''; placeholder = 'Головний заголовок';
            if (start > 0 && text[start - 1] !== '\n') prefix = '\n# ';
            break;
        case 'h2':
            prefix = '## '; suffix = ''; placeholder = 'Заголовок 2 рівня';
            if (start > 0 && text[start - 1] !== '\n') prefix = '\n## ';
            break;
        case 'h3':
            prefix = '### '; suffix = ''; placeholder = 'Заголовок 3 рівня';
            if (start > 0 && text[start - 1] !== '\n') prefix = '\n### ';
            break;
        case 'bold':
            prefix = '**'; suffix = '**'; placeholder = 'жирний текст';
            break;
        case 'italic':
            prefix = '*'; suffix = '*'; placeholder = 'курсив';
            break;
        case 'link':
            const url = prompt('Введіть посилання (URL):', 'https://');
            if (!url) return;
            prefix = '['; suffix = `](${url})`; placeholder = 'текст посилання';
            break;
        case 'ul':
            prefix = '- '; suffix = ''; placeholder = 'пункт списку';
            if (start > 0 && text[start - 1] !== '\n') prefix = '\n- ';
            break;
        case 'ol':
            prefix = '1. '; suffix = ''; placeholder = 'перший пункт';
            if (start > 0 && text[start - 1] !== '\n') prefix = '\n1. ';
            break;
    }

    const insertText = selectedText || placeholder;
    const replacement = prefix + insertText + suffix;
    
    textarea.value = text.substring(0, start) + replacement + text.substring(end);
    textarea.focus();
    
    if (selectedText) {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    } else {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + placeholder.length);
    }
};

window.previewImage = function(input) {
    const container = input.closest('.editor-block').querySelector('.image-preview-container');
    const img = container.querySelector('img');
    const fileName = container.querySelector('.file-name');
    const label = input.closest('label');

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            img.src = e.target.result;
            fileName.textContent = input.files[0].name;
            container.style.display = 'block';
            label.querySelector('strong').textContent = '🔄 Змінити фото';
        }
        reader.readAsDataURL(input.files[0]);
    } else {
        container.style.display = 'none';
        label.querySelector('strong').textContent = 'Натисніть, щоб обрати фото';
    }
};

window.addBlock = function(type, content = '', lang = '') {
    const editor = document.getElementById('block-editor');
    const block = document.createElement('div');
    block.className = 'editor-block';
    block.dataset.type = type;

    let html = `
        <div class="block-controls">
            <span class="block-type-badge">${type === 'text' ? 'Текст' : type === 'code' ? 'Фрагмент коду' : 'Фотографія'}</span>
            <div class="block-actions">
                <button type="button" onclick="moveBlock(this, -1)" title="Вгору">▲</button>
                <button type="button" onclick="moveBlock(this, 1)" title="Вниз">▼</button>
                <button type="button" class="delete-btn" onclick="this.closest('.editor-block').remove()" title="Видалити">✖</button>
            </div>
        </div>
    `;

    if (type === 'text') {
        html += `
            <div class="text-format-toolbar">
                <button type="button" class="format-btn" onclick="formatText(this, 'h1')" title="Заголовок 1">H1</button>
                <button type="button" class="format-btn" onclick="formatText(this, 'h2')" title="Заголовок 2">H2</button>
                <button type="button" class="format-btn" onclick="formatText(this, 'h3')" title="Заголовок 3">H3</button>
                <span style="border-left: 1px solid var(--border); margin: 0 4px;"></span>
                <button type="button" class="format-btn" onclick="formatText(this, 'bold')" title="Жирний"><b>B</b></button>
                <button type="button" class="format-btn" onclick="formatText(this, 'italic')" title="Курсив"><i>I</i></button>
                <button type="button" class="format-btn" onclick="formatText(this, 'link')" title="Посилання">🔗</button>
                <button type="button" class="format-btn" onclick="formatText(this, 'ul')" title="Маркований список">• Список</button>
                <button type="button" class="format-btn" onclick="formatText(this, 'ol')" title="Нумерований список">1. Список</button>
            </div>
            <textarea class="form-control block-data" rows="4" placeholder="Почніть писати тут...">${content}</textarea>
        `;
    } 
    else if (type === 'code') {
        html += `
            <input type="text" class="form-control block-lang" placeholder="Мова (напр. python, js, html)" value="${lang}" style="margin-bottom: 10px; width: 200px;">
            <textarea class="form-control block-data" rows="5" placeholder="Вставте ваш код...">${content}</textarea>
        `;
    } 
    else if (type === 'image') {
        let previewSrc = '';
        let previewDisplay = 'none';
        let imageInfoMsg = '';
        
        if (content) {
            const urlMatch = content.match(/!\[.*?\]\((.*?)\)/);
            if (urlMatch) {
                previewSrc = urlMatch[1];
                previewDisplay = 'block';
                imageInfoMsg = `<span style="color: var(--royal-purple); font-size: 0.85rem; display:block; margin-top: 10px;">✅ Збережене фото. Натисніть кнопку вище, щоб замінити його.</span>`;
            }
        }

        const safeContent = content.replace(/'/g, "&apos;").replace(/"/g, "&quot;");

        html += `
            <div style="padding: 15px; text-align: center; border: 2px dashed var(--royal-purple); border-radius: 8px; background: rgba(120, 81, 169, 0.05);">
                <label style="cursor: pointer; display: block; margin: 0;">
                    <span style="font-size: 2rem;">📷</span><br>
                    <strong>${content ? '🔄 Змінити фото' : 'Натисніть, щоб обрати фото'}</strong><br>
                    <span style="color: var(--text-muted); font-size: 0.8rem;">(Файл буде завантажено автоматично)</span>
                    <input type="file" name="images" accept="image/*" style="display: none;" onchange="previewImage(this)">
                </label>
                ${imageInfoMsg}
                <div class="image-preview-container" style="display: ${previewDisplay}; margin-top: 15px;">
                    <img src="${previewSrc}" style="max-width: 100%; max-height: 200px; border-radius: 8px; box-shadow: var(--shadow-sm);">
                    <br><span class="file-name" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 5px; display: inline-block;"></span>
                </div>
                <input type="hidden" class="block-old-img" value="${safeContent}">
            </div>
        `;
    }

    block.innerHTML = html;
    editor.appendChild(block);
}

window.moveBlock = function(btn, direction) {
    const block = btn.closest('.editor-block');
    const parent = block.parentNode;

    if (direction === -1 && block.previousElementSibling) {
        parent.insertBefore(block, block.previousElementSibling);
    } else if (direction === 1 && block.nextElementSibling) {
        parent.insertBefore(block.nextElementSibling, block);
    }
}

window.compileBlocks = function() {
    const blocks = document.querySelectorAll('.editor-block');
    const originalTextarea = document.querySelector('[name="content"]');
    let finalMarkdown = [];
    let imageIndex = 1;

    blocks.forEach(block => {
        const type = block.dataset.type;
        
        if (type === 'text') {
            const dataElement = block.querySelector('.block-data');
            if (dataElement && dataElement.value.trim() !== '') {
                finalMarkdown.push(dataElement.value.trim());
            }
        } 
        else if (type === 'code') {
            const lang = block.querySelector('.block-lang').value || 'text';
            const dataElement = block.querySelector('.block-data');
            const code = dataElement ? dataElement.value : '';
            if (code.trim() !== '') {
                finalMarkdown.push(`\n\`\`\`${lang}\n${code.trim()}\n\`\`\`\n`);
            }
        } 
        else if (type === 'image') {
            const fileInput = block.querySelector('input[type="file"]');
            const oldImgInput = block.querySelector('.block-old-img');
            
            if (fileInput && fileInput.files && fileInput.files.length > 0) {
                finalMarkdown.push(`\n{${window.imagePrefix}${imageIndex}}\n`);
                imageIndex++;
            } 
            else if (oldImgInput && oldImgInput.value) {
                    finalMarkdown.push(`\n${oldImgInput.value}\n`);
            }
        }
    });

    if (originalTextarea) {
        originalTextarea.value = finalMarkdown.join('\n\n');
    }
}

window.togglePreview = function() {
    const previewContainer = document.getElementById('preview-container');
    const editorBlocks = document.getElementById('block-editor');
    const addMenu = document.querySelector('.add-block-menu');
    const previewBtn = document.getElementById('preview-toggle-btn');

    if (previewContainer.style.display === 'none') {
        compileBlocks();
        let rawContent = document.querySelector('[name="content"]').value;
        
        let newImgIndex = 1;
        const imgBlocks = document.querySelectorAll('.editor-block[data-type="image"]');
        imgBlocks.forEach(block => {
            const fileInput = block.querySelector('input[type="file"]');
            const previewImg = block.querySelector('.image-preview-container img');
            
            if (fileInput && fileInput.files && fileInput.files.length > 0) {
                const placeholder = `{${window.imagePrefix}${newImgIndex}}`;
                rawContent = rawContent.replace(placeholder, `![Прев'ю зображення](${previewImg.src})`);
                newImgIndex++;
            }
        });

        const renderer = new marked.Renderer();
        renderer.heading = function (tokenOrText, level) {
            const text = typeof tokenOrText === 'string' ? tokenOrText : tokenOrText.text;
            const depth = typeof tokenOrText === 'string' ? level : tokenOrText.depth;
            
            const slug = text.toLowerCase().replace(/[\s\W_]+/g, '-').replace(/(^-|-$)/g, '');
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

        previewContainer.innerHTML = marked.parse(rawContent) || '<p style="color: var(--text-muted); text-align: center;">Пост порожній. Додайте контент для перегляду.</p>';
        
        editorBlocks.style.display = 'none';
        addMenu.style.display = 'none';
        previewContainer.style.display = 'block';
        
        previewBtn.innerHTML = '{% trans "Повернутися до редагування" %}';
        previewBtn.classList.replace('btn-outline', 'btn-save');
    } else {
        editorBlocks.style.display = 'flex';
        addMenu.style.display = 'flex';
        previewContainer.style.display = 'none';
        
        previewBtn.innerHTML = '{% trans "Попередній перегляд" %}';
        previewBtn.classList.replace('btn-save', 'btn-outline');
    }
};