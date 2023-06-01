/*
 * @Author: Zhouqi
 * @Date: 2022-05-15 15:30:55
 * @LastEditors: Zhouqi
 * @LastEditTime: 2023-03-15 09:18:16
 */
const typescript = require('@rollup/plugin-typescript');

export default [{
    input: './packages/react/index.ts',
    output: {
        name: 'React',
        format: "iife",
        file: './build/simplify-react.global.js',
        sourcemap: true,
    },
    plugins: [
        typescript({
            exclude: /__tests__/
        })
    ],
    onwarn: (msg, warn) => {
        if(!/Circular/.test(msg)) {
            warn(msg)
        }
    },
}, {
    input: './packages/react-dom/index.ts',
    output: {
        name: 'ReactDOM',
        format: "iife",
        file: './build/simplify-react-dom.global.js',
        sourcemap: true,
    },
    external: ['packages/react'],
    plugins: [
        typescript({
            exclude: /__tests__/
        }),
        // commonjs()
    ],
    onwarn: (msg, warn) => {
        if(!/Circular/.test(msg)) {
            warn(msg)
        }
    },
}];