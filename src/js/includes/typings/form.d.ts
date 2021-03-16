import { InputFormatterTypes, InputValidatorTypes } from 'constants/enums';
import {InputHandle} from '../../tsx/form/layout/input';
import {InputGroupHandle} from '../../tsx/form-builder/layout/input-group';
import {InputGroupRepeaterHandle} from '../../tsx/form-builder/layout/input-group-repeater';

export type Formatter = boolean | string | ((value: any) => any) | InputFormatter | CustomInputFormatter  | Array<string|((value: any) => any)|InputFormatter|CustomInputFormatter>;

export type InputFormatter = {
    type?: Exclude<InputFormatterTypes, InputFormatterTypes.Custom>,
    arguments?: Array<any>
}

export type CustomInputFormatter = {
    type: InputFormatterTypes.Custom,
    format: (value : any) => any
};

export type Validator = string | ((value: any) => any) | InputValidator | CustomInputValidator | Array<string|InputValidator|CustomInputValidator>;

export type InputValidator = {
    type?: Exclude<InputValidatorTypes, InputValidatorTypes.Custom>,
    arguments?: Array<any>
}

export type CustomInputValidator = {
    type: InputValidatorTypes.Custom,
    arguments?: Array<any>
    message: string | ((validation: InputValidator|CustomInputValidator, value: any) => string|JSX.Element),
    assert: (value: any) => boolean
};

export type InputDefaults = {
    validate?: boolean | Validator,
    hideValidateMessage?: boolean,

    required?: boolean,
    disabled?: boolean,

    process?: boolean | ((value : any) => any),
    format?: Formatter
};

export type InputComponents = InputHandle|InputGroupHandle|InputGroupRepeaterHandle;