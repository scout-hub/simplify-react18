/*
 * @Author: Zhouqi
 * @Date: 2022-04-28 15:14:45
 * @LastEditors: Zhouqi
 * @LastEditTime: 2022-06-12 21:42:28
 */
const {
    build
} = require('esbuild')

const {
    esbuildCommonjs
} = require('@originjs/vite-plugin-commonjs');

build({
    entryPoints: [`./packages/react/index.ts`],
    outfile: './build/simplify-react.global.js',
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

build({
    entryPoints: [`./packages/react-dom/src/index.ts`],
    outfile: './build/simplify-react-dom.global.js',
    bundle: true,
    sourcemap: true,
    format: 'iife',
    globalName: 'ReactDOM',
    external: ['packages/react'],
    plugins: [esbuildCommonjs(['packages/react'])],
    watch: {
        onRebuild(error) {
            console.log('rebuild');
        }
    }
}).then(() => {
    console.log(`watching`)
})