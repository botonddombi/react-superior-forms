import React from 'react';

import type {InputDefaults} from '../../includes/typings/form';
import {SubmitPhase} from '../../includes/constants/enums';

export type FormContextType = {
    inputDefaults: InputDefaults,

    submitPhase: SubmitPhase,
    submitAttempted: boolean,

    onSubmit: (event: React.SyntheticEvent) => void
};

export const FormContext : React.Context<FormContextType> = React.createContext(null);

type FormDefaultsContextType = {
    method?: string,
    json?: boolean,
    acceptJson?: boolean,
    headers?: {[key: string] : string},
};

export const FormDefaultsContext : React.Context<FormDefaultsContextType> =
React.createContext({});
