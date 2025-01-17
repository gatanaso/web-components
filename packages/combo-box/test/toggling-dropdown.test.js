import { expect } from '@esm-bundle/chai';
import { aTimeout, click, fixtureSync, focusout, isIOS, tap, touchstart } from '@vaadin/testing-helpers';
import { sendKeys } from '@web/test-runner-commands';
import sinon from 'sinon';
import '@vaadin/polymer-legacy-adapter/template-renderer.js';
import './not-animated-styles.js';
import '../vaadin-combo-box.js';
import { createEventSpy, outsideClick } from './helpers.js';

describe('toggling dropdown', () => {
  let comboBox, overlay, input;

  function setInputValue(value) {
    input.value = value;
    input.dispatchEvent(new CustomEvent('input'));
  }

  function clickToggleIcon() {
    tap(comboBox._toggleElement);
  }

  beforeEach(() => {
    comboBox = fixtureSync('<vaadin-combo-box label="Label" items="[1, 2]"></vaadin-combo-box>');
    input = comboBox.inputElement;
    overlay = comboBox.$.dropdown.$.overlay;
  });

  describe('opening', () => {
    it('should open synchronously by clicking label', () => {
      expect(comboBox.opened).to.be.false;
      tap(comboBox.querySelector('[slot="label"]'));
      expect(comboBox.opened).to.be.true;
    });

    it('should not open synchronously by clicking label when autoOpenDisabled is true', () => {
      comboBox.autoOpenDisabled = true;
      expect(comboBox.opened).to.be.false;
      tap(comboBox.querySelector('[slot="label"]'));
      expect(comboBox.opened).to.be.false;
    });

    it('should restore attribute focus-ring if it was initially set before opening and combo-box is focused', () => {
      comboBox.setAttribute('focus-ring', '');
      comboBox.opened = true;
      comboBox.opened = false;
      expect(comboBox.hasAttribute('focus-ring')).to.be.true;
    });

    it('should open synchronously by clicking input', () => {
      expect(comboBox.opened).to.be.false;
      tap(input);
      expect(comboBox.opened).to.be.true;
    });

    it('should not open synchronously by clicking input when autoOpenDisabled is true', () => {
      comboBox.autoOpenDisabled = true;
      expect(comboBox.opened).to.be.false;
      tap(input);
      expect(comboBox.opened).to.be.false;
    });

    it('should open by clicking icon', () => {
      clickToggleIcon();

      expect(comboBox.opened).to.be.true;
    });

    it('should open by clicking icon when autoOpenDisabled is true and input is invalid', () => {
      comboBox.autoOpenDisabled = true;
      input.value = 3;
      input.dispatchEvent(new CustomEvent('input'));

      clickToggleIcon();

      expect(comboBox.opened).to.be.true;
    });

    it('should open on function call', () => {
      comboBox.open();

      expect(comboBox.opened).to.be.true;
    });

    it('should set body `pointer-events: none` on open and restore initial value on close', () => {
      document.body.style.pointerEvents = 'painted';
      comboBox.open();

      expect(getComputedStyle(document.body).pointerEvents).to.be.equal('none');
      expect(getComputedStyle(comboBox).pointerEvents).to.be.equal('auto');

      // The actual overlay part of the overlay moved to body should dispatch pointer events
      expect(getComputedStyle(overlay.$.overlay).pointerEvents).to.be.equal('auto');

      comboBox.close();
      expect(getComputedStyle(document.body).pointerEvents).to.be.equal('painted');
    });

    it('should not close an open popup', () => {
      comboBox.open();

      comboBox.open();

      expect(comboBox.opened).to.be.true;
    });

    it('should be hidden with null items', () => {
      comboBox.items = null;

      comboBox.open();

      expect(comboBox.opened);
      expect(overlay.hidden).to.be.true;
    });

    it('should be hidden with no items', () => {
      comboBox.items = [];

      comboBox.open();

      expect(comboBox.opened);
      expect(overlay.hidden).to.be.true;
    });

    (isIOS ? describe : describe.skip)('after opening', () => {
      beforeEach(() => {
        comboBox.open();
      });

      it('should not set focused attribute on dropdown open', () => {
        expect(comboBox.hasAttribute('focused')).to.be.false;
      });

      it('should not refocus the input field when closed from icon', () => {
        clickToggleIcon();
        expect(comboBox.hasAttribute('focused')).to.be.false;
      });

      it('should focus input on dropdown open after a timeout', async () => {
        await aTimeout(1);
        expect(comboBox.hasAttribute('focused')).to.be.true;
      });

      it('should refocus the input field when closed from icon', async () => {
        clickToggleIcon();
        await aTimeout(1);
        expect(comboBox.hasAttribute('focused')).to.be.true;
      });

      it('should prevent default on overlay mousedown', () => {
        const preventDefaultSpy = sinon.spy();
        const event = createEventSpy('mousedown', preventDefaultSpy);
        overlay.dispatchEvent(event);

        expect(preventDefaultSpy.calledOnce).to.be.true;
      });
    });
  });

  describe('closing', () => {
    (isIOS ? it : it.skip)('should close popup when clicking outside overlay', () => {
      comboBox.open();

      click(document.body);

      expect(comboBox.opened).to.be.false;
    });

    (isIOS ? it.skip : it)('should close popup when clicking outside overlay', () => {
      comboBox.open();

      document.body.click();

      expect(comboBox.opened).to.be.false;
    });

    it('should not close when clicking on the overlay', () => {
      comboBox.open();

      click(overlay);

      expect(comboBox.opened).to.be.true;
    });

    it('should not close popup when clicking on any overlay children', () => {
      comboBox.open();

      comboBox.$.dropdown._scroller.click();

      expect(comboBox.opened).to.be.true;
    });

    it('should close on clicking icon', () => {
      comboBox.open();

      clickToggleIcon();

      expect(comboBox.opened).to.be.false;
    });

    it('should close the overlay when focus is lost', () => {
      comboBox.open();

      focusout(input);

      expect(comboBox.opened).to.equal(false);
    });

    it('should restore focus to the field on outside click', async () => {
      comboBox.focus();
      comboBox.open();
      outsideClick();
      await aTimeout(0);
      expect(document.activeElement).to.equal(input);
    });

    it('should focus the field on outside click', async () => {
      expect(document.activeElement).to.equal(document.body);
      comboBox.open();
      outsideClick();
      await aTimeout(0);
      expect(document.activeElement).to.equal(input);
    });

    describe('virtual keyboard', () => {
      it('should disable virtual keyboard on close', () => {
        comboBox.open();
        comboBox.close();
        expect(input.inputMode).to.equal('none');
      });

      it('should re-enable virtual keyboard on touchstart', () => {
        comboBox.open();
        comboBox.close();
        touchstart(comboBox);
        expect(input.inputMode).to.equal('');
      });

      it('should re-enable virtual keyboard on blur', async () => {
        comboBox.open();
        comboBox.close();
        await aTimeout(0);
        await sendKeys({ press: 'Tab' });
        expect(input.inputMode).to.equal('');
      });
    });

    describe('filtered items are empty', () => {
      it('should close the dropdown on non-existent values', () => {
        comboBox.open();

        // Existent value
        setInputValue('1');
        expect(overlay.opened).to.be.true;
        expect(comboBox.opened).to.be.true;

        // Non-existent value
        setInputValue('3');
        expect(overlay.opened).to.be.false;
        expect(comboBox.opened).to.be.true;
      });

      it('should not commit value the input on dropdown closing', () => {
        comboBox.open();

        setInputValue('3');
        expect(input.value).to.equal('3');
        expect(comboBox.value).to.be.empty;

        focusout(input);
        expect(input.value).to.be.empty;
      });
    });
  });

  describe('disabled', () => {
    beforeEach(() => {
      comboBox.disabled = true;
    });

    it('toggleIcon should not be hidden when disabled', () => {
      expect(getComputedStyle(comboBox._toggleElement).display).not.to.equal('none');
    });

    it('dropdown should not be shown when disabled', () => {
      click(input);
      expect(comboBox.opened).to.be.false;
    });
  });

  describe('read-only', () => {
    beforeEach(() => {
      comboBox.readonly = true;
    });

    it('toggleIcon should not be hidden when read-only', () => {
      expect(getComputedStyle(comboBox._toggleElement).display).not.to.equal('none');
    });

    it('dropdown should not be shown when read-only', () => {
      click(input);
      expect(comboBox.opened).to.be.false;
    });
  });

  describe('empty list', () => {
    it('vaadin-combo-box-overlay should not be attached when filteredItems is empty', () => {
      comboBox.open();
      expect(comboBox.opened).to.be.true;
      expect(document.querySelector('vaadin-combo-box-overlay')).to.be.ok;
      comboBox.close();
      expect(comboBox.opened).to.be.false;
      expect(document.querySelector('vaadin-combo-box-overlay')).not.to.be.ok;

      comboBox.filteredItems = [];
      comboBox.open();
      expect(comboBox.opened).to.be.true;
      expect(document.querySelector('vaadin-combo-box-overlay')).not.to.be.ok;
      comboBox.close();
      expect(comboBox.opened).to.be.false;
    });
  });

  (isIOS ? describe : describe.skip)('external focus (initially)', () => {
    let input, blurSpy;

    beforeEach(() => {
      input = document.createElement('input');
      comboBox.insertAdjacentElement('beforebegin', input);
      input.focus();
      blurSpy = sinon.spy(input, 'blur');
    });

    it('should blur previously focused element when clicking on toggle button', () => {
      clickToggleIcon();
      expect(blurSpy.calledOnce).to.be.true;
    });
  });
});
