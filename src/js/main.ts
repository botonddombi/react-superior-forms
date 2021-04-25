import Form from './tsx/form';
import FormBuilder from './tsx/form-builder';

import {
    Input,
    NumberInput,
    TextInput,
    EmailInput,
    PasswordInput,
} from './tsx/form/layout/input-types';

import {InputTypes} from './includes/constants/enums';

import InputGroup from './tsx/form-builder/layout/input-group';
import InputGroupRepeater from './tsx/form-builder/layout/input-group-repeater';

import SubmitButton from './tsx/form/layout/buttons/submit-button';
import SubmitStatus from './tsx/form/layout/status/submit-status';

import {FormDefaultsContext} from './tsx/form/context';

export default Form;
export {
    Form,
    FormBuilder,

    FormDefaultsContext,

    InputTypes,

    Input,

    InputGroup,
    InputGroupRepeater,

    NumberInput,
    TextInput,
    EmailInput,
    PasswordInput,

    SubmitButton,

    SubmitStatus,
};
