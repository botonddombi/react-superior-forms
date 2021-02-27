import React from 'react';

import {InputValidator, CustomInputValidator} from 'typings/form';

import {InputValidatorTypes} from 'constants/enums';

/**
 * Checks whether an input value is between the boundaries specified in args.
 * @param {Array<string|number>} args An array containing the minimum and maximum.
 * @param {any} value The value to check againts the boundaries.
 * @return {boolean} Whether the value is between the boundaries.
 */
function isBetween(args : Array<string|number>, value : any) : boolean {
    if (args && args.length >= 2) {
        if (Array.isArray(value) || typeof value === 'string') {
            return value.length >= args[0] && value.length <= args[1];
        }

        if (typeof value == 'number') {
            return value >= args[0] && value <= args[1];
        }
    }

    return false;
}

/**
 * Asserts a validation against the current state of an input.
 * @param {InputValidation|CustomInputValidation} validation The validation to assert.
 * @param {any} value The value to test.
 * @return {boolean} Whether the validation was successful or failed.
 */
export function assertValidation(
    validation : InputValidator|CustomInputValidator,
    value : any,
) : boolean {
    switch (validation.type) {
    case InputValidatorTypes.Required:
        if (typeof value === 'string') {
            return value != '';
        }

        if (typeof value === 'boolean' || typeof value === 'number') {
            return true;
        }

        if (Array.isArray(value)) {
            return value.length != 0;
        }
        break;

    case InputValidatorTypes.Email:
        return Boolean(String(value).match(/^\S+@\S+\.\S+$/));

    case InputValidatorTypes.Regex:
        if (validation.arguments && validation.arguments.length) {
            return Boolean(String(value).match(
                new RegExp(validation.arguments[0].replace(/^\/|\/$/g, '')),
            ));
        }
        break;

    case InputValidatorTypes.BetweenRange:
        if (validation.arguments && validation.arguments.length >= 2) {
            return isBetween(validation.arguments, value);
        }
        break;

    case InputValidatorTypes.Minimum:
        if (validation.arguments && validation.arguments.length) {
            return isBetween([validation.arguments[0], Number.MAX_VALUE], value);
        }
        break;

    case InputValidatorTypes.Maximum:
        if (validation.arguments && validation.arguments.length) {
            return isBetween([Number.MIN_VALUE, validation.arguments[0]], value);
        }
        break;

    case InputValidatorTypes.URL:
        return Boolean(String(value).match(
            /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?(\?.*)?$/,
        ));

    case InputValidatorTypes.Custom:
        if (validation.assert) {
            return validation.assert(value);
        }
    }

    return false;
}

/**
 * Gets the message of a validation.
 * @param {FinalInputValidation} validation The input validation to extract the message for.
 * @param {any} value The value to get the validation message for.
 * @return {string|JSX.Element} The message explaining the cause of invalidation.
 */
export function getValidationMessage(
    validation : InputValidator|CustomInputValidator,
    value : any,
) : string|JSX.Element {
    switch (validation.type) {
    case InputValidatorTypes.Required:
        return 'Required';
    case InputValidatorTypes.Email:
        return 'Not an email';
    case InputValidatorTypes.BetweenRange:
        if (validation.arguments && validation.arguments.length >= 2) {
            if (typeof value == 'number') {
                return <span>
                    {'Must be a number between '}
                    <b>{validation.arguments[0]}</b> and <b>{validation.arguments[1]}</b>
                </span>;
            }

            if (typeof value === 'string') {
                return <span>
                    {'Length must be between '}
                    <b>{validation.arguments[0]}</b> and <b>{validation.arguments[1]}</b>
                    {' characters'}
                </span>;
            }

            if (Array.isArray(value)) {
                return <span>
                    {'Must be between '}
                    <b>{validation.arguments[0]}</b> and <b>{validation.arguments[1]}</b>
                    {' entries'}
                </span>;
            }
        }
        break;
    case InputValidatorTypes.Minimum:
        if (validation.arguments && validation.arguments.length) {
            if (typeof value == 'number') {
                return <span>
                    {'Must be at least '}
                    <b>{validation.arguments[0]}</b>
                </span>;
            }

            if (typeof value === 'string') {
                return <span>
                    {'Length must be at least '}
                    <b>{validation.arguments[0]}</b>
                    {' characters'}
                </span>;
            }

            if (Array.isArray(value)) {
                return <span>
                    {'Must be at least '}
                    <b>{validation.arguments[0]}</b>
                    {' entries'}
                </span>;
            }
        }
        break;
    case InputValidatorTypes.Maximum:
        if (validation.arguments && validation.arguments.length) {
            if (typeof value == 'number') {
                return <span>
                    {'Must not exceed '}
                    <b>{validation.arguments[0]}</b>
                </span>;
            }

            if (typeof value === 'string') {
                return <span>
                    {'Length must not be more than '}
                    <b>{validation.arguments[0]}</b>
                    {' characters'}
                </span>;
            }

            if (Array.isArray(value)) {
                return <span>
                    {'Must not be more than '}
                    <b>{validation.arguments[0]}</b>
                    {' entries'}
                </span>;
            }
        }
        break;
    case InputValidatorTypes.URL:
        return 'Not an URL';
    case InputValidatorTypes.Custom:
        if (validation.message) {
            if (typeof validation.message == 'string') {
                return validation.message;
            } else {
                return validation.message(validation, value);
            }
        }
    }

    return 'Incorrect value';
}
