/* eslint-disable require-jsdoc, no-unused-vars, max-len */

import React from 'react';
import ReactDOM from 'react-dom';

import './global.scss';

import Form, {FormBuilder, InputTypes, NumberInput, TextInput, EmailInput, PasswordInput} from '../src/js/main';

// const form = <Form
//     route="/test"
// >
//     <label>Username:</label>
//     <TextInput name="username" defaultValue={'123'}/>

//     <label>Number:</label>
//     <NumberInput name="favourite_number" process={true} format={true} defaultValue={'123'}/>

//     <label>Email:</label>
//     <EmailInput
//         name="email"
//         defaultValue={'info@yahoo.com'}
//         process={true}
//         format={true}
//         validate={true}
//     />

//     <label>Password:</label>
//     <PasswordInput name="password"/>
// </Form>;

const form = <FormBuilder
    route="/test"
    inputGroups={[
        {
            legend: 'My first input group',
            className: 'my-group',
            name: 'group-name',
            inputs: [
                {
                    label: 'Username',
                    name: 'username',
                    type: InputTypes.Text,
                    wrapperClassName: 'my-wrapper',
                    className: 'my-input',
                    before: <h1>Hello world!</h1>,
                    defaultValue: 'test',
                    // onChange: (value) => console.log(value),
                    // onValidate: (validators) => console.log(validators),
                },
                {
                    label: 'Email',
                    name: 'email',
                    type: InputTypes.Email,
                    defaultValue: 'info@yahoo.com',
                    className: 'email-input',
                    validate: true,
                    format: true,
                    process: true,
                    // onChange: (value) => console.log(value),
                    // onValidate: (validators) => console.log(validators),
                },
            ],
            inputGroups: [
                {
                    legend: 'My first nested input group',
                    className: 'my-nested-group',
                    inputs: [
                        {
                            label: 'Username',
                            name: 'username',
                            type: InputTypes.Text,
                            wrapperClassName: 'my-wrapper',
                            className: 'my-input',
                            before: <h1>Hello world!</h1>,
                            defaultValue: 'test',
                            // onChange: (value) => console.log(value),
                            // onValidate: (validators) => console.log(validators),
                        },
                    ],
                },
            ],
        },
    ]}
/>;

ReactDOM.render(form, document.body.appendChild(document.createElement('div')));
