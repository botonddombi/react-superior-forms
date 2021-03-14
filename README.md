![Logo](docs/images/logo.svg)
#### Helps you easily build a form with input processing, validation and formatting.
```
npm install react-superior-forms
```
#### Features include:
* [Customizable Input](#3-2-input)
* Basic Inputs (Text, Email, Number, Password)
* [Grouping](#lets-put-the-fields-into-groups)
* [Repeaters](#lets-repeat-these-fields)
* AJAX Submit & Loader
* Validation (including the displayal of messages)
* Full customization using **hooks**, **events** and **options API**
* Form Builder API (**JSON** -> *Form*)
#### Aims for customizable UI with classes, includes minimal CSS.
# 1. Introduction:
A basic form to create a user:
```JSX
import Form, {TextInput, NumberInput, SubmitButton} from 'react-superior-forms';

<Form route="/create/user" json={true}>
    <label>Username</label>
    <TextInput name="username"/>

    <label>Favourite Number</label>
    <NumberInput name="favourite_number" process={true}/>

    <SubmitButton/>
</Form>;
```
Example request:
```JS
{username: "edward_baldwin", favourite_number: 10}
```
---
## Let's put the fields into groups!
```JSX
import Form, {InputGroup, TextInput, NumberInput, SubmitButton} from 'react-superior-forms';

<Form route="/create/user" json={true}>
    <InputGroup name="user">
        <label>Username</label>
        <TextInput name="username"/>
    </InputGroup>

    <InputGroup name="user_preferences">
        <label>Favourite Number</label>
        <NumberInput name="favourite_number" process={true}/>
    </InputGroup>

    <SubmitButton/>
</Form>;
```
Example request:
```JS
{user: {username: "edward_baldwin"}, user_preferences: {favourite_number: 10}}
```
---
## Let's repeat these fields!
```JSX
import Form, {InputGroupRepeater, TextInput, NumberInput, SubmitButton} from 'react-superior-forms';

<Form route="/create/users" json={true}>
    <InputGroupRepeater name="users" entries={2} minEntries={1} maxEntries={5}>
        <label>Username</label>
        <TextInput name="username"/>

        <label>Favourite Number</label>
        <NumberInput name="favourite_number" process={true}/>
    </InputGroupRepeater>

    <SubmitButton/>
</Form>;
```
Example request:
```JS
{
    users: [
        {username: "edward_baldwin", favourite_number: 10},
        {username: "gordo_stevens", favourite_number: 22}
    ]
}
```
# 2. Format, Process, Validate
It is important to understand the concept **react-superior-forms** uses to manage the values of the inputs.
Each step is optional. **Formatting** removes all the junk from the input value. **Processing** will transform the value into the desired type. **Validating** will check whether the value passes all constraints.
\
\
For example, let's say we have a number field with all steps enabled:
```JSX
<NumberInput name="favourite_number" format={true} process={true} validate={'max:10'} defaultValue="b58a"/>
```
* Initial value: "b58a" (string)
* After formatting: "58" (string)
* After processing: 58 (number)

Now the validation can easily proceed with statement: **58 <= 10**\
Had we skipped the processing, the value would have remained a string, causing the validation to check whether the length of string **"58"** is less or equal to 10 using statement: **"58".length <= 10**\
This flow will help us re-use validations for multiple scenarios, such as arrays, strings, numbers and more!

# 3. Components
## 3.1. Form
The **<Form\/>** component, just like the native **<form\/>** element, is responsible for collecting all input data of its childrens and handling the submit event.\
The **<Form\/>** component only recognizes the **<Input\/>** components as *inputs*, and will ignore all other native elements such as **<input\/>, <select\/>, <textarea\/>, etc.**\
\
The submit data is available in both *JSON* and *FormData*.
### Example usage:
```JSX
import Form from 'react-superior-forms';

<Form
    route="/user/3/update"
    method="PATCH"
    json={true}
>
...
</Form>
```
### Example rendered element:
```HTML
<form class="rsf-form">
...
</form>

or

<form class="rsf-form rsf-form--invalid">
...
any invalid input (recursively)
...
</form>
```
### Parameters:
| Parameter | Description | Type | Example value(s) | Default |
| - | - | - | - | - |
| route | The endpoint to submit the data to | string | "/test" | "/" |
| method | The method used when submitting the data | string | "GET", "POST", "PATCH", etc. | "POST" |
| json | Whether to submit the data in JSON (also sets the Content-type header to application/json) | boolean | false = submits FormData<br/>true = submits JSON | false |
| headers | The headers to send with the submitted request | object | {'X-CSRF-TOKEN': csrfToken} | null |
| className | The classname to append to the list of classes. | string | "my-form" | null |
| onSuccess | The function to call when the submit results in success (Status is 200) | function | (event, data) => console.log(event, data) | null | 
| onFail | The function to call when the submit results in failure (Status is not 200) | function | (event, data) => console.log(event, data) | null | 
| onSend | The function to call before sending the XHR | function | (data) => console.log(data) | null |
| onSubmit | The function to call when trying to submit | function | () => console.log('Trying to submit!') | null |
| inputDefaults | The default props the **<Input\/>** components will inherit. | object | {validate : true, hideValidateMessage: true, required: true, disabled: true, process: true, format: true}<br/>Check out the **<Input/\>** props here. | null |

# 3.2. Input
The **<Input\/>** component is recognized as an input of the **<Form\/>** component and will be included in the submitted data if the **disabled** property is not set to *false*.\
This component should only be used when creating a custom input of your own choice. A handful of inputs were already created to help you skip this process. Check out the **basic inputs**.\
\
To create a custom input, pass your custom input component as the *component* property.\
This *component* will inherit a handful of properties passed to the **<Input\>** component (e.g. name, value, type, disabled, required, className) plus the current value of the input, and the *onChange* function which should be called whenever your input component's value has changed.

### Example usage:
```JSX
import Form, {Input} from 'react-superior-forms';

function YourCustomInputComponent(props){
    return <input type="text" disabled={props.disabled} onChange={props.onChange}/>
}

<Form>
    <Input name="custom_stuff" component={<YourCustomInputComponent/>} disabled={true}/>
</Form>
```

---
### **This repository is currently in the making. The package is not yet published.**