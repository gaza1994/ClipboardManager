const { clipboard, ipcRenderer } = require('electron');

const copyToClipboard = (element) => {
    let content;

    if (element.querySelector('p')) {
        content = element.querySelector('p').textContent;
        clipboard.writeText(content);
    } else if (element.querySelector('div')) {
        const formattedContent = element.querySelector('div');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = formattedContent.innerHTML;
        content = tempDiv.textContent;
        clipboard.writeText(content);
    } else if (element.querySelector('img')) {
        const imageElement = element.querySelector('img');
        const imagePath = imageElement.getAttribute('src');
        console.log(imagePath)
        clipboard.writeImage(imagePath);
    }

    if (content) {
        console.log('Content copied to clipboard:', content);
        ipcRenderer.send('copied-to-clipboard', content);
    }
}


window.addEventListener('DOMContentLoaded', function () {
    const boxes = Array.from(document.getElementsByClassName('box'));
    let focusedIndex = -1;

    function focusBox(index) {
        if (index >= 0 && index < boxes.length) {
            boxes[index].classList.add('focused');
            boxes[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function unfocusBox(index) {
        if (index >= 0 && index < boxes.length) {
            boxes[index].classList.remove('focused');
        }
    }

    function handleClick(index) {
        if (index >= 0 && index < boxes.length) {
            boxes[index].click();
        }
    }

    function handleKeydown(event) {
        const key = event.key; 

        if (key === 'ArrowUp' || key === 'ArrowLeft') {
            unfocusBox(focusedIndex);
            focusedIndex = (focusedIndex - 1 + boxes.length) % boxes.length;
            focusBox(focusedIndex);
        } else if (key === 'ArrowDown' || key === 'ArrowRight') {
            unfocusBox(focusedIndex);
            focusedIndex = (focusedIndex + 1) % boxes.length;
            focusBox(focusedIndex);
        } else if (key === 'Enter' || key === 'Return') {
            handleClick(focusedIndex);
        }
    }

    window.addEventListener('keydown', handleKeydown);
});
