export class InstructionsForDoctors {
    constructor(_drug) {
        this.drug = _drug;
        this.isClosedBtnClicked = false;
    }

    isClosed = () => {
        return this.isClosedBtnClicked;
    }     

    render = (parent) => {
        this.root = document.createElement('div');
        this.root.classList.add('instructions-for-doctors');

        const instructionText = this.drug['instructions_for_doctors'] || '';
        const parts = this.parseInstructions(instructionText);

        parts.forEach(part => {
            const element = this.createElementForPart(part);
            this.root.appendChild(element);
        });

        this.closeBtn = this.createCloseButton();

        this.root.appendChild(this.closeBtn);
        parent.appendChild(this.root);
    }

    createElementForPart = (part) => {
        switch (part.type) {
            case 'image':
                return this.createImageElement(part.src);
            case 'link':
                return this.createLinkElement(part.src);
            default:
                return this.createTextElement(part.content);
        }
    }

    parseInstructions = (instructionText) => {
        const regex = /!\[(image|link):([^\]]+)\]/g;
        let parts = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(instructionText)) !== null) {
            if (match.index > lastIndex) {
                const textBeforeContent = instructionText.slice(lastIndex, match.index).trim();
                if (textBeforeContent) {
                    parts.push({ type: 'text', content: textBeforeContent });
                }
            }
            const partType = match[1];
            const instruction = match[2];

            parts.push({ type:partType, src: instruction }); 
            lastIndex = regex.lastIndex;
        }

        if (lastIndex < instructionText.length) {
            const remainingText = instructionText.slice(lastIndex).trim();
            if (remainingText) {
                parts.push({ type: 'text', content: remainingText });
            }
        }

        return parts;
    }

    createImageElement = (src) => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Image';
        return img;
    }

    createTextElement =  (content) => {
        const p = document.createElement('p');
        p.innerText = content;
        return p;
    }
    
    createLinkElement = (link) => {
        const a = document.createElement('a');
        a.href = link;
        a.innerText = link;
        a.target = '_blank';
        return a;
    }    

    createCloseButton = () => {
        const button = document.createElement('button');
        button.innerText = 'X';
        button.addEventListener('click', () => {
            this.root.style.display = 'none';
            this.isClosedBtnClicked = true;
        });
        return button;
    }
}