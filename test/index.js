const test = require('ava')
const webpack = require('webpack')
const path = require('path')
const fs = require('fs')
const shortid = require('shortid')

test('loads css files correctly', t => {
  return runWebpack().then((out, stats) => {
    t.regex(out, /p.jsx-(\d+){color:red;}/)
  })
})

test('does not create a unique class if global option is active', t => {
  return runWebpack({ global: true }).then((out, stats) => {
    t.regex(out, /p{color:red;}/)
  })
})

// test helper

function runWebpack(options = {}) {
  const outDir = path.join(__dirname, 'output')
  const outFile = `${shortid.generate()}.js`

  return new Promise((resolve, reject) => {
    webpack(
      {
        mode: 'development',
        entry: path.join(__dirname, 'fixtures/index.js'),
        output: {
          path: outDir,
          filename: outFile
        },
        resolveLoader: {
          alias: {
            'styled-components-css-loader': path.join(__dirname, '../index.js')
          }
        },
        module: {
          rules: [
            {
              test: /\.css$/,
              use: [
                {
                  loader: 'babel-loader',
                  options: {
                    babelrc: false,
                    plugins: [
                      require.resolve(
                        'babel-plugin-transform-es2015-modules-commonjs'
                      ),
                      require.resolve('styled-jsx/babel')
                    ]
                  }
                },
                {
                  loader: 'styled-components-css-loader',
                  options
                }
              ]
            }
          ]
        }
      },
      (err, stats) => {
        if (err) reject(err)
        const out = path.join(outDir, outFile)
        const content = fs.readFileSync(out, 'utf8')
        fs.unlinkSync(out)
        resolve(content, stats)
      }
    )
  })
}
