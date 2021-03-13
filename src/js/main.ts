import Form from './tsx/form';
import FormBuilder from './tsx/form-builder';

import {
    Input,
    NumberInput,
    TextInput,
    EmailInput,
    PasswordInput,
} from './tsx/form/layout/input-types';

import {InputTypes} from 'constants/enums';

import InputGroup from './tsx/form-builder/layout/input-group';
import InputGroupRepeater from './tsx/form-builder/layout/input-group-repeater';

import SubmitButton from './tsx/form/layout/buttons/submit-button';
import SubmitStatus from './tsx/form/layout/status/submit-status';

export default Form;
export {
    Form,
    FormBuilder,

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
