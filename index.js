#!/usr/bin/env node
import os from "os";
import fs from "fs";
import cliSpinners from 'cli-spinners';
import fetch from "node-fetch";
import prompts from 'prompts';
import CFonts from 'cfonts';
import ora, { oraPromise } from 'ora';
import pkg from 'kleur';
import { exec } from "child_process";
const cRequire = createRequire(import.meta.url);
import { createRequire } from "module";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { version } = cRequire('./package.json');
const { green, red, blue } = pkg;

/**TODO : -  
 * 
 * npm root -g - command for finding root npm library
 * ? - FIX ANSWERING NO WITH ESTABLISHED PROFILE IN SETUP. 
 * ? - 
*/

async function main() {
    switch (process.argv[2]) {
        case '-q': {
            await getLoaderAndQuote();
            process.exit();
        }
        default: {
        }
    }

    displayTitle('tiny');

    let menuChoice = await (prompts(prompt.menu, { onCancel }))
    const { MenuSelection } = menuChoice;

    switch (MenuSelection) {
        case "Quote": {
            await getLoaderAndQuote();
            break;
        }
        case "Setup": {
            let userInfo = checkOS();
            let setupChoice = await (prompts(prompt.setup, { onCancel }))
            const { SetupSelection } = setupChoice;
            //? Once test published switch paths from dev to prod....
            // const npmPath = os.userInfo().homedir + "/AppData/Roaming/npm/node_modules/cli-quotes/"
            const npmPath = "C:/Coding/MyTools/NPM/QuoteDisplay/index.js -q";

            const profileExt = ".ps1";
            const powershellProfileDir = `${os.userInfo().homedir}` + "/Documents/WindowsPowerShell";
            const powershellProfileFile = powershellProfileDir + "/Microsoft.PowerShell_profile";
            const appendLine = "\nnode " + npmPath;

            if (SetupSelection) {
                switch (userInfo.System.Shell) {
                    case "pwsh.exe": {
                        if (checkWinPowershellProfile()) {
                            fs.readFile(powershellProfileFile + profileExt, async function (err, data) {
                                if (err) throw err;
                                if (data.includes(appendLine)) {
                                    let revertChoice = await (prompts(prompt.revert, { onCancel }))
                                    const { RevertSelection } = revertChoice;
                                    if (RevertSelection) {
                                        revertBack(powershellProfileFile, profileExt);
                                    } else {
                                    };
                                } else {
                                    performBackupAndAppendNew(powershellProfileFile, profileExt, appendLine);
                                }
                            })

                        } else {
                            console.log(blue("\nHome Profile directory/file not found, creating Powershell Profile file ..(.ps1)\n"));
                            fs.writeFileSync(powershellProfileFile + profileExt, "");
                            performBackupAndAppendNew(powershellProfileFile, profileExt, appendLine);
                        }
                        break;
                    }
                    default: {
                        console.log("Shell not supported", userInfo);
                    }
                }
            } else {
                // switch (userInfo.System.Shell) {
                //     case "pwsh.exe": {
                //         if (checkWinPowershellProfile()) {
                //             if (checkRevert(powershellProfileFile + profileExt, appendLine)) {
                //                 console.log('shit is def here');
                //                 revertBack(powershellProfileFile, profileExt);
                //             } else {
                //                 console.log("Nothing to revert");
                //             }
                //         } else {
                //             console.log("Profile does not exist.");
                //         };
                //         break;
                //     }
                //     default: {
                //         console.log("Shell not supported", userInfo);
                //     }
                // }
                onCancel();
            }
            break;
        }
        case "About": {
            console.log(red(`
            CLI Quotes ${version} \n`) + '\n' +
                '* Randomized Quotes\n' + '\n' +
                '* Option available to run quote on each terminal session.\n' + '\n' +
                '* To run quote once pass the flag -q.\n'
            )
            break;
        }
        default: {
            onCancel();
        }
    }
};

async function checkRevert(file, line) {
    try {
        fs.readFile(file, async function (err, data) {
            if (err) throw err;
            if (data.includes(line)) {
                return true;
            } else {
                return false;
            }
        })
        return false;
    } catch (err) {
        return false
    }
};

async function handlePowerShell() {

}


const prompt = {
    menu: [{
        type: 'select',
        name: 'MenuSelection',
        message: 'Choose an option',
        choices: [
            { title: '🗨️ Give Me A Quote', description: '', value: 'Quote' },
            { title: 'ℹ️ About', description: '', value: 'About' },
            { title: '🛠️ Setup', description: 'Optional setup', value: 'Setup' },
        ],
        initial: 0,
    }],
    setup: [{
        type: 'confirm',
        name: 'SetupSelection',
        message: 'Do you want to toggle the display of a quote on each new terminal instance?',
        initial: false,
    }],
    revert: [{
        type: 'confirm',
        name: 'RevertSelection',
        message: 'Autorun quotes is enabled, would you like to turn it off?',
        initial: false,
    }]
};

async function getQuote() {
    const response = await (await (fetch("https://api.quotable.io/random"))).json();
    return `${response.content} \n- ${response.author} \n`
};

async function getLoaderAndQuote() {
    console.log("");
    await oraPromise(getQuote(),
        {
            discardStdin: false,
            indent: 0,
            text: 'Loading...',
            spinner: cliSpinners.aesthetic,
            successText: r => r,
            failText: "Error"
        }
    )
};

function executeCommand(command, shell) {
    exec(command, { shell: shell }, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`${stdout}`);
    });
};

function checkWinPowershellProfile() {
    try {
        const powershellProfileDir = `${os.userInfo().homedir}` + "/Documents/WindowsPowerShell"
        if (fs.readdirSync(powershellProfileDir)) {
            if (fs.readFileSync(powershellProfileDir + "/Microsoft.PowerShell_profile.ps1")) {
                return true;
            } else {
                return false;
            }
        };
    } catch (err) {
        return false;
    }
};

function handlePowershell(npmPath, flag) {

};

async function promise(runFunc, msg) {
    return msg
};

async function revertBack(fileName, fileType) {
    await oraPromise(promise(fs.rename(
        fileName + ".bak",
        fileName + fileType,
        (err) => {
            if (err) throw err;
        }
    ), ""),
        {
            discardStdin: false,
            indent: 2,
            text: 'Reverting...',
            spinner: cliSpinners.aesthetic,
            successText: "Reverted from backup!",
            failText: "Error"
        }
    )
};

async function performBackupAndAppendNew(fileName, fileType, appendLine) {
    // fs.readFile(fileName + fileType, async function (err, data) {
    //     if (err) throw err;
    //     if (data.includes(appendLine)) {
    //         let revertChoice = await (prompts(prompt.revert, { onCancel }))
    //         const { RevertSelection } = revertChoice;
    //         if (RevertSelection) {
    //             revertBack(fileName, fileType);
    //         } else {
    //         };
    //     } else {
    //? Rename old profile file with a new extension .bak
    await oraPromise(promise(fs.rename(
        fileName + fileType,
        fileName + ".bak",
        (err) => {
            if (err) throw err;
        }
    ), ""),
        {
            discardStdin: false,
            indent: 2,
            text: 'Backing up...',
            spinner: cliSpinners.aesthetic,
            successText: "Backed up old profile!...(.bak) & created a new one (.ps1)",
            failText: "Error"
        }
    );

    //? Copy data from.bak file into a new profile file
    await oraPromise(promise(fs.copyFileSync(
        fileName + ".bak",
        fileName + fileType
    ), ``),
        {
            discardStdin: false,
            indent: 2,
            text: 'Copying...',
            spinner: cliSpinners.aesthetic,
            successText: `Copied data from .bak to new profile`,
            // successText: `Copied data from .bak to new profile ${fileName.replaceAll("/", `\\`) + fileType}`,
            failText: "Error"
        }
    );

    //? Append the line that will execute the node script
    await oraPromise(promise(fs.appendFileSync(fileName + fileType, appendLine, 'utf8'), ""),
        {
            discardStdin: false,
            indent: 2,
            text: 'Appending...',
            spinner: cliSpinners.aesthetic,
            successText: "Appended run command to profile",
            failText: "Error"
        }
    )
    //? Completion Spinner
    await oraPromise(promise("", ""),
        {
            discardStdin: false,
            indent: 2,
            text: 'Completing',
            spinner: cliSpinners.aesthetic,
            successText: "Completed, open a new terminal session to try it! :)",
            failText: "Error"
        }
    );
};

function checkOS() {
    let userInfo = {
        System: {
            Name: os.userInfo().username,
            Platform: process.platform,
            OS: process.env.OS,
            Shell: ""
        }
    }
    if (userInfo.System.Platform.toLowerCase().includes("win")) {
        userInfo.System.Shell = "pwsh.exe" || "cmd.exe"
    }
    return userInfo;
};

function displayTitle(font) {
    CFonts.say('CLI Quotes', {
        font: font,              // define the font face
        align: 'left',              // define text alignment
        colors: ['red'],         // define all colors
        background: 'transparent',  // define the background color, you can also use `backgroundColor` here as key
        letterSpacing: 1,           // define letter spacing
        lineHeight: 1,              // define the line height
        space: true,                // define if the output text should have empty lines on top and on the bottom
        maxLength: '0',             // define how many character can be on one line
        gradient: ['red', 'blue', 'green'],            // define your two gradient colors
        independentGradient: false, // define if you want to recalculate the gradient for each new line
        transitionGradient: true,  // define if this is a transition between colors directly
        env: 'node'                 // define the environment CFonts is being executed in
    });
};

function onCancel() {
    console.clear();
    console.log(red('Exiting...'));
    process.exit();
};

main();