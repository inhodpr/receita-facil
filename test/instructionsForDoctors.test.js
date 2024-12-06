import { InstructionsForDoctors } from '../static/js/instructions_for_doctors';

describe('InstructionsForDoctors', () => {
    let mockDrug;
    let parent;

    beforeEach(() => {
        mockDrug = {
            "id": 18,
            "name": "Adrenalina /Epinefrina 1:1000 1mg/ml",
            "quantity": "01 Ampola",
            "instructions": "test",
            "instructions_for_doctors": "",
            "category": "SALA DE PROCEDIMENTOS",
            "route": "Uso Intramuscular",
            "image_url": "https://storage.googleapis.com/receita-facil-support-icons/01%20Via%20de%20uso/vasto%20lateral.png"
        };
        parent = document.createElement('div');
    });

    test.each([
        ['Text with one image and one link', 'Test. ![image:https://receitafacil.com/i1.png] ![link:https://receitafacil.com/] Test.', 1, 1, 2],
        ['Text with no special content', 'Test.', 0, 0,1],
        ['Text with multiple images', 'Test: ![image:https://receitafacil.com/i1.png] and ![image:https://receitafacil.com/i2.png].', 2, 0, 3],
        ['Text with image at the end', 'Test. ![image:https://receitafacil.com/i1.png]', 1, 0, 1],
        ['Text with image in the middle', 'Test ![image:https://receitafacil.com/i1.png] Test', 1, 0, 2],
        ['Text with two consecutive images and one link', 'Test ![image:https://receitafacil.com/i1.png] ![image:https://receitafacil.com/i1.png] ![link:https://receitafacil.com/] Test', 2, 1, 2],
        ['Empty text', '', 0, 0, 0],
        ['Null instructions for doctors', null, 0, 0, 0],
        ['Wrong image instruction shouldn\'t render img tag', 'Test [image:https://receitafacil.com/image1.png]', 0, 0, 1],
    ])(
        'should render the correct number of images and paragraphs for: %s',
        (description, instructionText, expectedImageCount, expectedLinkCount, expectedParagraphCount) => {
            mockDrug.instructions_for_doctors = instructionText;

            const instructions = new InstructionsForDoctors(mockDrug);
            instructions.render(parent);

            const images = parent.querySelectorAll('img');
            const paragraphs = parent.querySelectorAll('p');
            const link = parent.querySelectorAll('a');
            expect(images.length).toBe(expectedImageCount);
            expect(paragraphs.length).toBe(expectedParagraphCount);
            expect(link.length).toBe(expectedLinkCount);
        }
    );

    test('should render a close button', () => {
        const instructions = new InstructionsForDoctors(mockDrug);
        instructions.render(parent);

        const closeButton = parent.querySelector('button');
        expect(closeButton).not.toBeNull();
        expect(closeButton.innerText).toBe('X');
    });

    test('should hide the component when the close button is clicked', () => {
        const instructions = new InstructionsForDoctors(mockDrug);
        instructions.render(parent);

        const closeButton = parent.querySelector('button');
        closeButton.click();

        expect(parent.querySelector('.instructions-for-doctors').style.display).toBe('none');
    });

    test('should mark as closed when the close button is clicked', () => {
        const instructions = new InstructionsForDoctors(mockDrug);
        instructions.render(parent);

        const closeButton = parent.querySelector('button');
        closeButton.click();

        expect(instructions.isClosed()).toBe(true);
    });
});
