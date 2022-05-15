/*
 * @Author: Zhouqi
 * @Date: 2022-05-15 15:30:55
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-15 20:39:25
 */
const typescript = require('@rollup/plugin-typescript');

export default {
    input: './packages/react/src/react.ts',
    output: {
        format: "es",
        file: './packages/react/dist/simplify-react.esm.js'
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
};