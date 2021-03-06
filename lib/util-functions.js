'use strict'
const { spawn } = require('child_process')
const { ENV } = require('./constants')
const { BasicCustomError } = require('./CustomError')

function previousEnv(env) {
    const stage = {
        [ENV.DLVR]: {
            before: ENV.BUILD,
        },
        [ENV.TEST]: {
            before: ENV.DLVR,
        },
        [ENV.PROD]: {
            before: ENV.TEST,
        },
    }
    return stage[env].before
}

async function childProcess(...args) {
    // @ts-ignore
    const cp = spawn(...args)
    return new Promise((resolve, reject) => {
        cp.on('error', err => {
            reject(err)
        })

        cp.on('close', exitCode => {
            if (exitCode === 0) {
                resolve({ stdout, stderr, exitCode })
            } else {
                // console.error("ChildProcess: " + args + ".\nOn close with non-zero exist code: " + exitCode);
                reject(new BasicCustomError({ stdout, stderr, exitCode }, `Error encountered for command! (${args})`))
            }
        })
        cp.on('exit', exitCode => {
            if (exitCode === 0) {
                return resolve({ stdout, stderr, exitCode })
            } else {
                reject(new BasicCustomError({ stdout, stderr, exitCode }, `Error encountered for command! (${args})`))
            }
        })

        let stdout = ''
        let stderr = ''
        // @ts-ignore
        cp.stderr.on('data', data => {
            stderr += data
        })
        // @ts-ignore
        cp.stdout.on('data', data => {
            stdout += data
        })
    })
} // end childProcess()

module.exports = { childProcess, previousEnv }
