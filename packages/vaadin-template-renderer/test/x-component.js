export class XComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<div id="content"></div>`;
  }

  connectedCallback() {
    window.Vaadin.templateRendererCallback?.(this);
  }

  get $() {
    return {
      content: this.shadowRoot.querySelector('#content')
    };
  }

  set renderer(renderer) {
    this.__renderer = renderer;
    this.render();
  }

  render() {
    this.__renderer?.(this.$.content);
  }
}

customElements.define('x-component', XComponent);