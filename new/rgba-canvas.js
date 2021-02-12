
class DrawCall {

    apply(drawCallParameter){

    }

    draw(t) {
        console.log('draw')
    }
}

class RgbaCanvas extends HTMLElement  {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        const canvas = document.createElement('canvas');
        this.shadowRoot.append(canvas);
        this.drawCalls = [];
        setTimeout(() => this.init());
    }

    init() {
        this.children(this)
            .forEach(node => this.handleNode(node));

        const animate = (t) => {
            this.drawCalls.forEach(drawCall => drawCall.draw(t));
            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }

    children(node) {
        return [...node.childNodes]
            .filter(node => node.nodeName !== '#text');
    }

    handleNode(node) {
        if (node.nodeName.toLowerCase() === 'draw-call')
            this.addDrawCall(node)
    }

    addDrawCall(drawCallParams) {
        const drawCall = new DrawCall();
        this.drawCalls.push(drawCall);
        this.children(drawCallParams)
            .forEach(drawCallParameter => drawCall.apply(drawCallParameter))
    }
}

customElements.define('rgba-canvas', RgbaCanvas);



