document.addEventListener('DOMContentLoaded', () => {
  const postForm = document.getElementById('post-form');
  const isEditing = postForm.dataset.isEditing === 'true';
  const originalTextarea = document.querySelector('[name="content"]');
  
  if (isEditing && originalTextarea && originalTextarea.value.trim() !== '') {
      addBlock('text', originalTextarea.value);
      window.imagePrefix = "new_img"; 
  } else {
      window.imagePrefix = "img";
      addBlock('text');
  }

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
});

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

function addBlock(type, content = '') {
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
      html += `<textarea class="form-control block-data" rows="4" placeholder="Почніть писати тут...">${content}</textarea>`;
  } 
  else if (type === 'code') {
      html += `
          <input type="text" class="form-control block-lang" placeholder="Мова (напр. python, js, html)" style="margin-bottom: 10px; width: 200px;">
          <textarea class="form-control block-data" rows="5" placeholder="Вставте ваш код..."></textarea>
      `;
  } 
  else if (type === 'image') {
      html += `
          <div style="padding: 15px; text-align: center; border: 2px dashed var(--royal-purple); border-radius: 8px; background: rgba(120, 81, 169, 0.05);">
              <label style="cursor: pointer; display: block; margin: 0;">
                  <span style="font-size: 2rem;">📷</span><br>
                  <strong>Натисніть, щоб обрати фото</strong><br>
                  <span style="color: var(--text-muted); font-size: 0.8rem;">(Файл буде завантажено автоматично)</span>
                  <input type="file" name="images" accept="image/*" style="display: none;" onchange="previewImage(this)">
              </label>
              <div class="image-preview-container" style="display: none; margin-top: 15px;">
                  <img src="" style="max-width: 100%; max-height: 200px; border-radius: 8px; box-shadow: var(--shadow-sm);">
                  <br><span class="file-name" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 5px; display: inline-block;"></span>
              </div>
          </div>
      `;
  }
  
  block.innerHTML = html;
  editor.appendChild(block);
}

function moveBlock(btn, direction) {
  const block = btn.closest('.editor-block');
  const parent = block.parentNode;
  
  if (direction === -1 && block.previousElementSibling) {
      parent.insertBefore(block, block.previousElementSibling);
  } else if (direction === 1 && block.nextElementSibling) {
      parent.insertBefore(block.nextElementSibling, block);
  }
}

function compileBlocks() {
  const blocks = document.querySelectorAll('.editor-block');
  const originalTextarea = document.querySelector('[name="content"]');
  let finalMarkdown = [];
  let imageIndex = 1;
  
  blocks.forEach(block => {
      const type = block.dataset.type;
      
      if (type === 'text') {
          const dataElement = block.querySelector('.block-data');
          if (dataElement && dataElement.value.trim() !== '') {
              finalMarkdown.push(dataElement.value);
          }
      } 
      else if (type === 'code') {
          const lang = block.querySelector('.block-lang').value || 'text';
          const dataElement = block.querySelector('.block-data');
          const code = dataElement ? dataElement.value : '';
          if (code.trim() !== '') {
              finalMarkdown.push(`\n\`\`\`${lang}\n${code}\n\`\`\`\n`);
          }
      } 
      else if (type === 'image') {
          const fileInput = block.querySelector('input[type="file"]');
          if (fileInput && fileInput.files && fileInput.files.length > 0) {
              finalMarkdown.push(`\n{${window.imagePrefix}${imageIndex}}\n`);
              imageIndex++;
          }
      }
  });
  
  if (originalTextarea) {
      originalTextarea.value = finalMarkdown.join('\n\n');
  }
}