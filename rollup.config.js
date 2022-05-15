/*
 * @Author: Zhouqi
 * @Date: 2022-05-15 15:30:55
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-15 15:31:10
 */
/*
 * @Author: Zhouqi
 * @Date: 2022-03-27 14:27:34
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-03 15:24:29
 */
const {
    terser
} = require('rollup-plugin-terser');
const typescript = require('@rollup/plugin-typescript');

export default {
    input,
    output: {
        format: "es",
        file: ouputFile
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