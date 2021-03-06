'use strict';

import * as configurer from '../configurer';

export function produces(...mimeTypes) {

    return function(target, key, descriptor) {

        if (descriptor) {
            return configureAction(mimeTypes, descriptor);
        }

        return configureController(mimeTypes, target);
    }
}

function configureController(mimeTypes, target) {

    if (mimeTypes) {
        Object.defineProperty(target, configurer.producesProp, {
            enumerable: false,
            writable: false,
            value: mimeTypes
        });
    }

    return target;
}

function configureAction(mimeTypes, descriptor) {

    if (mimeTypes) {
        let action = descriptor.value;
        Object.defineProperty(action, configurer.producesProp, {
            enumerable: false,
            writable: false,
            value: mimeTypes
        });
    }

    return descriptor;
}
