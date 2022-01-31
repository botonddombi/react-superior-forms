module.exports = {
    env: {
        'browser': true,
        'es2021': true,
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'google',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        'ecmaFeatures': {
            'jsx': true,
        },
        'ecmaVersion': 12,
        'sourceType': 'module',
    },
    plugins: [
        'react',
        '@typescript-eslint',
    ],
    rules: {
        'indent': ['error', 4],
        'max-len': [
            'error',
            {
                'code': 100,
                'comments': 120,
                'ignoreRegExpLiterals': true,
                'ignoreTemplateLiterals': true,
            },
        ],
    },
    settings: {
        'react': {
            'version': 'detect',
        },
    },
    globals: {
        React: true,
        JSX: true,
    },
};
