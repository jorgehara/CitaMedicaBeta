import typescript from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'

export default {
    input: 'src/app.ts',
    output: {
        file: 'dist/app.js',
        format: 'esm',
        sourcemap: true
    },
    external: [
        'express',
        'cors',
        'dotenv',
        'axios',
        '@builderbot/bot',
        '@builderbot/provider-baileys',
        '@builderbot/database-mongo',
        'date-fns',
        'date-fns-tz'
    ],
    onwarn: (warning) => {
        if (warning.code === 'UNRESOLVED_IMPORT') return
    },
    plugins: [
        resolve({
            preferBuiltins: true,
            extensions: ['.ts', '.js', '.json']
        }),
        commonjs(),
        json(),
        typescript({
            tsconfig: './tsconfig.json'
        })
    ]
}
