import {CustomInputFormatter, InputFormatter} from '../../../includes/typings/form';

import {InputFormatterTypes, InputTypes} from '../../constants/enums';

/**
 * Formats the input value based on the formatter.
 * @param  {InputFormatter} formatter The formatter to use.
 * @param  {any} value The input value to format.
 * @param  {InputTypes} type The input type that can alter the format process.
 * @return {any} The formatted value.
 */
export function format(
    formatter: InputFormatter|CustomInputFormatter,
    value: any,
    type : InputTypes,
) : any {
    switch (formatter.type) {
    case InputFormatterTypes.Email:
        return String(value).replace(/[^a-zA-Z0-9@.\-!#$%&'*+-/=?^_`{|}~]/g, '');
    case InputFormatterTypes.DiscardRegex:
        if (formatter.arguments && formatter.arguments.length) {
            return String(value).replace(
                new RegExp(formatter.arguments[0].replace(/^\/|\/$/g, ''), 'g'),
                '',
            );
        }
        break;
    case InputFormatterTypes.Maximum:
        if (formatter.arguments && formatter.arguments.length) {
            if (type === InputTypes.Number && value !== '') {
                return Math.min(formatter.arguments[0], value);
            }

            if (typeof value === 'string') {
                return value.substr(0, formatter.arguments[0]);
            }

            if (Array.isArray(value)) {
                return value.slice(0, formatter.arguments[0]);
            }
        }
        break;
    case InputFormatterTypes.Number:
        return String(value).replace(/[^0-9.+-]/g, '').replace(/^0+(.+)$/g, '$1');
    case InputFormatterTypes.Numeric:
        return String(value).replace(/[^0-9]/g, '');
    case InputFormatterTypes.Alphanumeric:
        return String(value).replace(/[^a-zA-Z0-9]/g, '');
    case InputFormatterTypes.Custom:
        if (formatter.format) {
            return formatter.format(value);
        }
        break;
    }

    return value;
}
