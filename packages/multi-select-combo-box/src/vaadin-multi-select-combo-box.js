/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
import '@vaadin/input-container/src/vaadin-input-container.js';
import './vaadin-multi-select-combo-box-internal.js';
import './vaadin-multi-select-combo-box-tokens.js';
import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { ElementMixin } from '@vaadin/component-base/src/element-mixin.js';
import { processTemplates } from '@vaadin/component-base/src/templates.js';
import { InputControlMixin } from '@vaadin/field-base/src/input-control-mixin.js';
import { InputController } from '@vaadin/field-base/src/input-controller.js';
import { LabelledInputController } from '@vaadin/field-base/src/labelled-input-controller.js';
import { inputFieldShared } from '@vaadin/field-base/src/styles/input-field-shared-styles.js';
import { registerStyles, ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';
import { MultiSelectComboBoxMixin } from './vaadin-multi-select-combo-box-mixin.js';

registerStyles('vaadin-multi-select-combo-box', inputFieldShared, { moduleId: 'vaadin-multi-select-combo-box-styles' });

/**
 * `<vaadin-multi-select-combo-box>` is a web component that wraps `<vaadin-combo-box>` and extends
 * its functionality to allow selecting multiple items, in addition to basic features.
 *
 * ```html
 * <vaadin-multi-select-combo-box id="comboBox"></vaadin-multi-select-combo-box>
 * ```
 *
 * ```js
 * const comboBox = document.querySelector('#comboBox');
 * comboBox.items = ['apple', 'banana', 'lemon', 'orange'];
 * comboBox.selectedItems = ['lemon', 'orange'];
 * ```
 *
 * ### Styling
 *
 * The following shadow DOM parts are available for styling:
 *
 * Part name            | Description
 * ---------------------|----------------
 * `label`              | The label element
 * `input-field`        | The element that wraps prefix, value and suffix
 * `clear-button`       | The clear button
 * `error-message`      | The error message element
 * `helper-text`        | The helper text element wrapper
 * `readonly-container` | The element used to represent readonly mode
 * `required-indicator` | The `required` state indicator element
 * `toggle-button`      | The toggle button
 *
 * The following state attributes are available for styling:
 *
 * Attribute           | Description
 * --------------------|-----------------
 * `disabled`          | Set to a disabled element
 * `has-value`         | Set when the element has a value
 * `has-label`         | Set when the element has a label
 * `has-helper`        | Set when the element has helper text or slot
 * `has-error-message` | Set when the element has an error message
 * `invalid`           | Set when the element is invalid
 * `focused`           | Set when the element is focused
 * `focus-ring`        | Set when the element is keyboard focused
 * `readonly`          | Set to a readonly element
 *
 * ### Tokens
 *
 * To change how selected items are presented, apply styles to the following components:
 *
 * - `<vaadin-multi-select-combo-box-tokens>` - Wrapper for a list of tokens.
 * - `<vaadin-multi-select-combo-box-token>` - An individual token element.
 *
 * ### Internal components
 *
 * In addition to `<vaadin-multi-select-combo-box>` and tokens, the following internal
 * components are themable:
 *
 * - `<vaadin-multi-select-combo-box-overlay>` - has the same API as `<vaadin-overlay>`.
 * - `<vaadin-multi-select-combo-box-item>` - has the same API as `<vaadin-item>`.
 * - `<vaadin-input-container>` - an internal element wrapping the input.
 *
 * Note: the `theme` attribute value set on `<vaadin-multi-select-combo-box>` is
 * propagated to these components.
 *
 * See [Styling Components](https://vaadin.com/docs/latest/ds/customization/styling-components) documentation.
 *
 * @fires {Event} change - Fired when the user commits a value change.
 * @fires {CustomEvent} custom-values-set - Fired when the user sets a custom value.
 * @fires {CustomEvent} filter-value-changed - Fired when the `filterValue` property changes.
 * @fires {CustomEvent} invalid-changed - Fired when the `invalid` property changes.
 * @fires {CustomEvent} selected-items-changed - Fired when the `selectedItems` property changes.
 *
 * @extends HTMLElement
 * @mixes ElementMixin
 * @mixes ThemableMixin
 * @mixes InputControlMixin
 * @mixes MultiSelectComboBoxMixin
 */
class MultiSelectComboBox extends MultiSelectComboBoxMixin(
  InputControlMixin(ThemableMixin(ElementMixin(PolymerElement)))
) {
  static get is() {
    return 'vaadin-multi-select-combo-box';
  }

  static get template() {
    return html`
      <style>
        [hidden] {
          display: none !important;
        }
      </style>
      <div class="vaadin-multi-select-combo-box-container">
        <div part="label">
          <slot name="label"></slot>
          <span part="required-indicator" aria-hidden="true" on-click="focus"></span>
        </div>

        <div part="readonly-container" hidden$="[[!readonly]]">
          [[_getReadonlyValue(selectedItems, itemLabelPath, compactMode, readonlyValueSeparator)]]
        </div>

        <vaadin-multi-select-combo-box-internal
          id="comboBox"
          items="[[items]]"
          item-id-path="[[itemIdPath]]"
          item-label-path="[[itemLabelPath]]"
          item-value-path="[[itemValuePath]]"
          disabled="[[disabled]]"
          readonly="[[readonly]]"
          hidden$="[[readonly]]"
          auto-open-disabled="[[autoOpenDisabled]]"
          allow-custom-value="[[allowCustomValues]]"
          data-provider="[[dataProvider]]"
          filter="{{filterValue}}"
          filtered-items="[[filteredItems]]"
          page-size="[[pageSize]]"
          renderer="[[renderer]]"
          theme$="[[theme]]"
          on-combo-box-item-selected="_onComboBoxItemSelected"
          on-change="_onComboBoxChange"
          on-custom-value-set="_onCustomValueSet"
        >
          <vaadin-input-container
            part="input-field"
            readonly="[[readonly]]"
            disabled="[[disabled]]"
            invalid="[[invalid]]"
            theme$="[[theme]]"
          >
            <vaadin-multi-select-combo-box-tokens
              id="tokens"
              compact-mode="[[compactMode]]"
              compact-mode-label-generator="[[compactModeLabelGenerator]]"
              items="[[selectedItems]]"
              item-label-path="[[itemLabelPath]]"
              slot="prefix"
              on-item-removed="_onItemRemoved"
              on-mousedown="_preventBlur"
            ></vaadin-multi-select-combo-box-tokens>
            <slot name="input"></slot>
            <div id="clearButton" part="clear-button" slot="suffix"></div>
            <div id="toggleButton" class="toggle-button" part="toggle-button" slot="suffix"></div>
          </vaadin-input-container>
        </vaadin-multi-select-combo-box-internal>

        <div part="helper-text">
          <slot name="helper"></slot>
        </div>

        <div part="error-message">
          <slot name="error-message"></slot>
        </div>
      </div>
    `;
  }

  static get properties() {
    return {
      /**
       * Set true to prevent the overlay from opening automatically.
       * @attr {boolean} auto-open-disabled
       */
      autoOpenDisabled: Boolean,

      /**
       * Path for the value of the item. If `items` is an array of objects,
       * this property is used as a string value for the selected item.
       * @attr {string} item-value-path
       */
      itemValuePath: String,

      /**
       * Path for the id of the item, used to detect whether the item is selected.
       * @attr {string} item-id-path
       */
      itemIdPath: {
        type: String
      },

      /**
       * The list of selected items.
       * Note: modifying the selected items creates a new array each time.
       */
      selectedItems: {
        type: Array,
        value: () => [],
        notify: true
      },

      /**
       * When true, the list of selected items is kept ordered in ascending lexical order.
       *
       * When `itemLabelPath` is specified, corresponding property is used for ordering.
       * Otherwise the items themselves are compared using `localCompare`.
       */
      ordered: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },

      /**
       * Number of items fetched at a time from the data provider.
       * @attr {number} page-size
       */
      pageSize: {
        type: Number,
        value: 50,
        observer: '_pageSizeChanged'
      },

      /**
       * Function that provides items lazily. Receives two arguments:
       *
       * - `params` - Object with the following properties:
       *   - `params.page` Requested page index
       *   - `params.pageSize` Current page size
       *   - `params.filter` Currently applied filter
       *
       * - `callback(items, size)` - Callback function with arguments:
       *   - `items` Current page of items
       *   - `size` Total number of items.
       */
      dataProvider: {
        type: Object,
        observer: '_dataProviderChanged'
      },

      /**
       * The join separator used for the 'display value' when in read-only mode.
       * @attr {string} readonly-value-separator
       */
      readonlyValueSeparator: {
        type: String,
        value: ', '
      },

      /**
       * When true, the user can input a value that is not present in the items list.
       * @attr {boolean} allow-custom-values
       */
      allowCustomValues: {
        type: Boolean,
        value: false
      },

      /**
       * Custom function for rendering the content of every item.
       * Receives three arguments:
       *
       * - `root` The `<vaadin-multi-select-combo-box-item>` internal container DOM element.
       * - `comboBox` The reference to the `<vaadin-combo-box>` element.
       * - `model` The object with the properties related with the rendered
       *   item, contains:
       *   - `model.index` The index of the rendered item.
       *   - `model.item` The item.
       */
      renderer: Function,

      /**
       * Filtering string the user has typed into the input field.
       * @attr {string} filter-value
       */
      filterValue: {
        type: String,
        value: '',
        notify: true
      },

      /**
       * A subset of items, filtered based on the user input. Filtered items
       * can be assigned directly to omit the internal filtering functionality.
       * The items can be of either `String` or `Object` type.
       */
      filteredItems: Array
    };
  }

  static get observers() {
    return [
      '_selectedItemsChanged(selectedItems, selectedItems.*)',
      '_updateItems(ordered, compactMode, itemLabelPath, selectedItems, selectedItems.*)'
    ];
  }

  /**
   * Used by `ClearButtonMixin` as a reference to the clear button element.
   * @protected
   * @return {!HTMLElement}
   */
  get clearElement() {
    return this.$.clearButton;
  }

  /**
   * @protected
   * @return {boolean}
   */
  get _hasValue() {
    return Boolean(this.selectedItems && this.selectedItems.length);
  }

  /** @protected */
  ready() {
    super.ready();

    this.addController(
      new InputController(this, (input) => {
        this._setInputElement(input);
        this._setFocusElement(input);
        this.stateTarget = input;
        this.ariaTarget = input;
      })
    );
    this.addController(new LabelledInputController(this.inputElement, this._labelController));

    processTemplates(this);
  }

  /**
   * Returns true if the current input value satisfies all constraints (if any).
   * @return {boolean}
   */
  checkValidity() {
    return this.required ? this._hasValue : true;
  }

  /**
   * Override method inherited from `InputMixin` to forward the input to combo-box.
   * @protected
   * @override
   */
  _inputElementChanged(input) {
    super._inputElementChanged(input);

    if (input) {
      this.$.comboBox._setInputElement(input);
    }
  }

  /**
   * Override method inherited from `FocusMixin` to validate on blur.
   * @param {boolean} focused
   * @protected
   */
  _setFocused(focused) {
    super._setFocused(focused);

    if (!focused) {
      this.validate();
    }
  }

  /** @private */
  _updateItems(ordered, compactMode, itemLabelPath, selectedItems) {
    // Set title when in compact mode to indicate which items are selected.
    this.title = compactMode ? this._getDisplayValue(selectedItems, itemLabelPath, ', ') : undefined;

    if (ordered && !compactMode) {
      this._sortSelectedItems(selectedItems);
    }
  }

  /** @private */
  _pageSizeChanged(pageSize, oldPageSize) {
    if (Math.floor(pageSize) !== pageSize || pageSize <= 0) {
      this.pageSize = oldPageSize;
      console.error('"pageSize" value must be an integer > 0');
    }
  }

  /** @private */
  _selectedItemsChanged() {
    this.toggleAttribute('has-value', this._hasValue);

    // Re-render tokens
    this.__updateTokens();

    // Re-render scroller
    this.$.comboBox.$.dropdown._scroller.__virtualizer.update();

    // Wait for tokens to render
    requestAnimationFrame(() => {
      this.$.comboBox.$.dropdown._setOverlayWidth();
    });
  }

  /** @private */
  _getReadonlyValue(selectedItems, itemLabelPath, compactMode, readonlyValueSeparator) {
    return compactMode
      ? this._getCompactModeLabel(selectedItems)
      : this._getDisplayValue(selectedItems, itemLabelPath, readonlyValueSeparator);
  }

  /** @private */
  _getDisplayValue(selectedItems, itemLabelPath, valueSeparator) {
    return selectedItems.map((item) => this._getItemLabel(item, itemLabelPath)).join(valueSeparator);
  }

  /** @private */
  _findIndex(item, selectedItems, itemIdPath) {
    if (itemIdPath && item) {
      for (let index = 0; index < selectedItems.length; index++) {
        if (selectedItems[index] && selectedItems[index][itemIdPath] === item[itemIdPath]) {
          return index;
        }
      }
      return -1;
    }

    return selectedItems.indexOf(item);
  }

  /** @private */
  __clearInput() {
    this.inputElement.value = '';
  }

  /** @private */
  __removeItem(item) {
    const itemsCopy = [...this.selectedItems];
    itemsCopy.splice(itemsCopy.indexOf(item), 1);
    this.__updateSelection(itemsCopy);
  }

  /** @private */
  __selectItem(item) {
    const itemsCopy = [...this.selectedItems];

    const index = this._findIndex(item, itemsCopy, this.itemIdPath);
    if (index !== -1) {
      itemsCopy.splice(index, 1);
    } else {
      itemsCopy.push(item);
    }

    this.__updateSelection(itemsCopy);

    // Avoid firing `value-changed` event.
    this.$.comboBox._focusedIndex = -1;

    // Avoid firing `custom-value-set` event.
    if (this.allowCustomValues) {
      this.__clearInput();
    }
  }

  /** @private */
  _sortSelectedItems(selectedItems) {
    this.selectedItems = selectedItems.sort((item1, item2) => {
      const item1Str = String(this._getItemLabel(item1, this.itemLabelPath));
      const item2Str = String(this._getItemLabel(item2, this.itemLabelPath));
      return item1Str.localeCompare(item2Str);
    });

    this.__updateTokens();
  }

  /** @private */
  __updateSelection(selectedItems) {
    this.selectedItems = selectedItems;

    this.validate();

    this.dispatchEvent(new CustomEvent('change', { bubbles: true }));
  }

  /** @private */
  __updateTokens() {
    this.$.tokens.requestUpdate();
  }

  /**
   * Override method inherited from `ClearButtonMixin` and clear items.
   * @protected
   * @override
   */
  _onClearButtonClick(event) {
    event.stopPropagation();

    this.__updateSelection([]);
  }

  /**
   * Override an event listener from `KeyboardMixin`.
   * @param {KeyboardEvent} event
   * @protected
   * @override
   */
  _onKeyDown(event) {
    const count = this.items.length;
    if (event.key === 'Backspace' && count && this.inputElement.value === '') {
      this.__removeItem(this.items[count - 1]);
    }
  }

  /** @private */
  _onComboBoxChange() {
    const item = this.$.comboBox.selectedItem;
    if (item) {
      this.__selectItem(item);
    }
  }

  /** @private */
  _onComboBoxItemSelected(event) {
    this.__selectItem(event.detail.item);
  }

  /** @private */
  _onCustomValueSet(event) {
    // Do not set combo-box value
    event.preventDefault();

    this.__clearInput();

    this.dispatchEvent(
      new CustomEvent('custom-values-set', {
        detail: event.detail,
        composed: true,
        bubbles: true
      })
    );
  }

  /** @private */
  _onItemRemoved(event) {
    this.__removeItem(event.detail.item);
  }

  /** @private */
  _preventBlur(event) {
    // Prevent mousedown event to keep the input focused
    // and keep the overlay opened when clicking a token.
    event.preventDefault();
  }
}

customElements.define(MultiSelectComboBox.is, MultiSelectComboBox);

export { MultiSelectComboBox };