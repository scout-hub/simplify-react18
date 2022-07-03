/*
 * @Author: Zhouqi
 * @Date: 2022-05-15 15:30:55
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-07-03 11:06:41
 */
const typescript = require('@rollup/plugin-typescript');

export default [{
    input: './packages/react/index.ts',
    output: {
        name: 'React',
        format: "iife",
        file: './build/simplify-react.global.js'
    },
    plugins: [
        typescript({
            exclude: /__tests__/
        })
    ],
    onwarn: (msg, warn) => {
        if (!/Circular/.test(msg)) {
            warn(msg)
        }
    },
}, {
    input: './packages/react-dom/index.ts',
    output: {
        name: 'ReactDOM',
        format: "iife",
        file: './build/simplify-react-dom.global.js',
    },
    external: ['packages/react'],
    plugins: [
        typescript({
            exclude: /__tests__/
        }),
        // commonjs()
    ],
    onwarn: (msg, warn) => {
        if (!/Circular/.test(msg)) {
            warn(msg)
        }
    },
}];