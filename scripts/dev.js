/*
 * @Author: Zhouqi
 * @Date: 2022-04-28 15:14:45
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-05-15 15:32:57
 */
const {
    build
} = require('esbuild')

build({
    entryPoints: [``],
    outfile: '',
    bundle: true,
    sourcemap: true,
    format: 'iife',
    globalName: 'React',
    watch: {
        onRebuild(error) {
            console.log('rebuild');
        }
    }
}).then(() => {
    console.log(`watching`)
})