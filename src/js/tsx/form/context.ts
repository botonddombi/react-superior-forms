import React from 'react';

import type {InputDefaults} from 'typings/form';
import {SubmitPhase} from 'constants/enums';

export type FormContextType = {
    inputDefaults: InputDefaults,

    submitPhase: SubmitPhase,
    submitAttempted: boolean,

    onSubmit: (event: React.SyntheticEvent) => void
};

export const FormContext : React.Context<FormContextType> = React.createContext(null);
