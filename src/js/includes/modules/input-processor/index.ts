import {InputTypes} from '../../constants/enums';

/**
 * Processes an input value according to the input type or process setting/function.
 * @param {boolean|function} processor The processor to use.
 * @param {any} value The input value to process.
 * @param  {InputTypes} type The input type that can alter the processing.
 * @return {any} The processed value.
 */
export function process(
    processor: boolean | ((value : any) => any),
    value: any,
    type: InputTypes,
) : any {
    if (processor === true) {
        switch (type) {
        case InputTypes.Number:
        case InputTypes.Switch:
            return Number(value);
        }
    } else {
        if (typeof processor === 'function') {
            return processor(value);
        }
    }

    return value;
}
