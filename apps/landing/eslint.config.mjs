import { eslint } from '@eslint/eslintrc'

export default eslint.config({
  extends: ['next/core-web-vitals'],
  rules: {
    'react/no-unescaped-entities': 'off',
  },
}) 