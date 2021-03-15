/* eslint-disable require-jsdoc, no-unused-vars, max-len */

import React from 'react';
import ReactDOM from 'react-dom';

import './global.scss';

import Form, {FormBuilder, InputTypes, InputGroup, InputGroupRepeater, NumberInput, TextInput, EmailInput, PasswordInput, SubmitButton, SubmitStatus, Input} from '../src/js/main';

// const form =
// <Form route="/create/user" json={true}>
//     <label>Username</label>
//     <TextInput name="name" validate={'max:50'} format={true}/>

//     <label>Favourite Number</label>
//     <TextInput name="favourite_number" validate={true} format={true} process={true}/>

//     <SubmitButton/>
// </Form>;

// const form =
// <Form route="/create/user" json={true}>
//     {/* <InputGroup name="user">
//         <label>Username</label>
//         <TextInput name="name" validate={'max:50'} format={true}/>
//     </InputGroup> */}
//     <InputGroup name="user_preferences">
//         <label>Favourite Number</label>
//         <NumberInput name="favourite_number" validate={true} process={true}/>
//     </InputGroup>

//     <SubmitButton/>
// </Form>;

// const form =
// <Form route="/create/users" json={true}>
//     <InputGroupRepeater name="users" legend={'User'} entries={1} minEntries={1} maxEntries={5}>
//         <label>Username</label>
//         <TextInput name="name"/>

//         <label>Favourite Number</label>
//         <NumberInput name="favourite_number" validate={true} format={true} process={true}/>
//     </InputGroupRepeater>

//     <SubmitButton/>
// </Form>;

// import Form, {Input} from 'react-superior-forms';

// function YourCustomInputComponent(props: any) {
//     return <input type="text" disabled={props.disabled} onChange={props.onChange}/>;
// }

// const form = <Form route="asd">
//     <Input name="custom_stuff" type={InputTypes.Number} component={<YourCustomInputComponent/>} validate={true}/>
// </Form>;

// const form = <Form
//     route="/create-users"
//     json={true}
// >
//     <InputGroupRepeater
//         name="users"
//         entries={2}
//         maxEntries={4}
//         defaultValue={
//             [
//                 {username: 'botika'},
//                 {username: 'lacika', favourite_number: 35},
//             ]
//         }
//         legend={(props) => <>Your {props.index + 1}. User</>}
//     >
//         <label>Username</label>
//         <TextInput name="username" process={true} format={true} validate={true} required={true}/>
//         <label>Number:</label>
//         <NumberInput name="favourite_number" validate={true} required={true}/>
//     </InputGroupRepeater>

//     <SubmitButton/>
//     <SubmitStatus/>
// </Form>;

function YourCustomInputComponent(props: any) {
    return <input type="text" disabled={props.disabled} onChange={(ev) => props.onChange(ev.target.value)} value={props.value ?? ''}/>;
}

const form = <Form route="/example">
    <Input name="custom_stuff" component={<YourCustomInputComponent/>} disabled={Math.random() >= 0.5}/>
    <SubmitButton/>
</Form>;

// const form = <Form
//     route="/test"
// >
//     <InputGroupRepeater
//         name="apple"
//         entries={3}
//         defaultValue={[{'username': 'botika'}, {'username': 'lacika'}]}
//         legend={'Entry'}
//         // legend={(props) => <>Entry {props.index + 1}.</>}
//     >
//         <label>Username</label>
//         <TextInput name="username"/>
//         <InputGroup name="banana" /* defaultValue={{'favourite_number': '999'}}*/>
//             <label>Number:</label>
//             <NumberInput name="favourite_number" process={true} format={true} validate={'min:10'} defaultValue={'999'}/>
//         </InputGroup>
//     </InputGroupRepeater>
//     {/* <hr/>
//     <InputGroup name="banana" defaultValue={{'favourite_number': '999'}}>
//         <label>Number:</label>
//         <NumberInput name="favourite_number" process={true} format={true} validate={'min:10'}/>
//     </InputGroup>
//     <hr/>
//     <label>Username:</label>
//     <TextInput name="username" defaultValue={'123'}/>
//     <label>Number:</label>
//     <NumberInput name="favourite_number" process={true} format={true} defaultValue={'123'} validate={'min:10'}/> */}
// </Form>;


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

// const form = <FormBuilder
//     route="/test"
//     inputGroups={[
//         {
//             repeater: {
//                 entries: 1,
//                 legend: 'Entry',
//             },
//             legend: 'My first input group',
//             className: 'my-group',
//             name: 'group-name',
//             inputs: [
//                 {
//                     label: 'Username',
//                     name: 'username',
//                     type: InputTypes.Text,
//                     wrapperClassName: 'my-wrapper',
//                     className: 'my-input',
//                     before: <h1>Hello world!</h1>,
//                     defaultValue: 'test',
//                     // onChange: (value) => console.log(value),
//                     // onValidate: (validators) => console.log(validators),
//                 },
//                 {
//                     label: 'Email',
//                     name: 'email',
//                     type: InputTypes.Email,
//                     defaultValue: 'info@yahoo.com',
//                     className: 'email-input',
//                     validate: true,
//                     format: true,
//                     process: true,
//                     // onChange: (value) => console.log(value),
//                     // onValidate: (validators) => console.log(validators),
//                 },
//             ],
//             inputGroups: [
//                 {
//                     legend: 'My first nested input group',
//                     className: 'my-nested-group',
//                     name: 'sub-group-name',
//                     inputs: [
//                         {
//                             label: 'Username',
//                             name: 'username',
//                             type: InputTypes.Text,
//                             wrapperClassName: 'my-wrapper',
//                             className: 'my-input',
//                             before: <h1>Hello world!</h1>,
//                             defaultValue: '',
//                             required: true,
//                             validate: true,
//                             // onChange: (value) => console.log(value),
//                             // onValidate: (validators) => console.log(validators),
//                         },
//                     ],
//                 },
//             ],
//         },
//     ]}
// />;

ReactDOM.render(form, document.body.appendChild(document.createElement('div')));
