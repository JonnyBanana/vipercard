
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { UI512PresenterInterface } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512ElementsBase.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementsApp.js';
/* auto */ import { UI512ElTextField } from '../../ui512/elements/ui512ElementsTextField.js';
/* auto */ import { EventDetails } from '../../ui512/menu/ui512Events.js';

export interface UI512PresenterWithMenuInterface extends UI512PresenterInterface {
    app: UI512Application;

    rawEvent(d: EventDetails): void;
    canInteract(el: O<UI512Element>): boolean;
    canSelectTextInField(el: O<UI512ElTextField>): boolean;
}
