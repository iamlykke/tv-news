import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = [
    ...nextVitals,
    ...nextTs,
    {
        rules: {
            '@next/next/no-img-element': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            // Данные в админке грузятся в useEffect — правило React Compiler тут даёт ложные срабатывания
            'react-hooks/set-state-in-effect': 'off',
        },
    },
    {
        ignores: ['.next/**', 'node_modules/**', 'src/generated/**', 'next-env.d.ts'],
    },
];

export default eslintConfig;
