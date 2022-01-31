/* eslint-disable no-unused-vars */
export enum InputTypes {
    Email = 'email',
    Password = 'password',
    Text = 'text',
    Number = 'number',

    Checkbox = 'checkbox',
    Switch = 'switch',
    File = 'file',

    Custom = 'custom'
}

export enum InputValidatorTypes {
    Required = 'required',

    Email = 'email',
    Number = 'number',
    Regex = 'regex',

    BetweenRange = 'between',
    Minimum = 'min',
    Maximum = 'max',

    URL = 'url',
    Custom = 'custom',

    External = 'external',
}

export enum InputFormatterTypes {
    Email = 'email',

    DiscardRegex = 'regex_discard',

    Maximum = 'max',

    Number = 'number',

    Numeric = 'numeric',
    Alphanumeric = 'alphanumeric',

    Custom = 'custom',
}

export enum InputEventTypes {
    Change = 'change',
    Validate = 'validate',
}

export enum SubmitPhase {
    Stale = 'stale',
    Loading = 'loading',
    Success = 'success',
    Fail = 'fail',
}
