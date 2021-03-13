![Logo](docs/images/logo.svg)
#### Helps you easily build a form with input processing, validation and formatting.
```
npm install react-superior-forms
```
#### Features include:
* Customizable Input
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
Each step is optional. **Formatting** removes all the junk from the input. **Process** will transform the value into the desired type. **Validate** will check whether the value passes all constraints.
For example, let's say we have a number field with all steps enabled:
```JSX
<NumberInput name="favourite_number" format={true} process={true} validate={'max:10'} defaultValue="b58a"/>
```
* Initial value: "b58a" (string)
* After formatting: "58" (string)
* After processing: 58 (number)

Now the validation can easily proceed with statement: **58 <= 10**
Had we skipped the processing, the value would have remained a string, causing the validation to check whether the length of string **"58"** is less or equal to 10 using statement: **"58".length <= 10**
This flow will help us re-use validations for multiple scenarios, such as arrays, strings, numbers and more!

---
### **This repository is currently in the making. The package is not yet published.**