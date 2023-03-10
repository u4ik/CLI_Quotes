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
const cRequire = createRequire(import.meta.url); // construct the require method
import { createRequire } from "module"; // Bring in the ability to create the 'require' method
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { version } = cRequire('./package.json')
const { green, red, blue } = pkg;

/**TODO : -  
 * 
 * npm root -g - command for finding root npm library
 * ?    - Delete 
 * ?        - REQUIREMENTS - 
 * ?            - remove quote execution from ps1.
 * ? - 
*/

async function main() {
    switch (process.argv[2]) {
        case '-q': {
            console.log(await getQuote());
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
            console.log('\n', await getQuote(), '\n');
            break;
        }
        case "Setup": {
            let userInfo = checkOS();
            let setupChoice = await (prompts(prompt.setup, { onCancel }))
            const { SetupSelection } = setupChoice;
            if (SetupSelection) {
                switch (userInfo.System.Shell) {
                    case "pwsh.exe": {
                        //? Once test published switch paths from dev to prod....
                        // const npmPath = os.userInfo().homedir + "/AppData/Roaming/npm/node_modules/cli-quotes/"
                        const npmPath = "C:/Coding/MyTools/NPM/QuoteDisplay/index.js -q";
                        const profileExt = ".ps1"
                        const powershellProfileDir = `${os.userInfo().homedir}` + "/Documents/WindowsPowerShell";
                        const appendLine = "\nnode " + npmPath;
                        if (checkWinPowershellProfile()) {
                            performBackupAndAppendNew(powershellProfileDir + "/Microsoft.PowerShell_profile", profileExt, appendLine);
                        } else {
                            console.log(blue("\nHome Profile directory/file not found, creating Powershell Profile file ..(.ps1)\n"));
                            fs.writeFileSync(`${os.userInfo().homedir}` + "/Documents/WindowsPowerShell" + "/Microsoft.PowerShell_profile.ps1", "");
                            performBackupAndAppendNew(powershellProfileDir + "/Microsoft.PowerShell_profile", profileExt, appendLine);
                        }
                        break;
                    }
                    default: {
                        console.log("Shell not supported", userInfo);
                    }
                }
            } else {
                main();
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
        message: 'Do you want to display a quote at the start of each terminal session?',
        initial: false,
    }],
    revert: [{
        type: 'confirm',
        name: 'RevertSelection',
        message: 'Autorun quotes already enabled, would you like to turn it off?',
        initial: false,
    }]
};

async function getQuote() {
    const response = await (await (fetch("https://api.quotable.io/random"))).json();
    return `${response.content} \n- ${response.author}`
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

async function promise(runFunc, msg) {
    return msg
}

async function revertBack(fileName, fileType) {
    await oraPromise(promise(fs.rename(
        fileName + ".bak",
        fileName + fileType,
        (err) => {
            if (err) throw err;
        }
    ), "Reverted to original profile"),
        {
            discardStdin: false,
            text: 'Reverting...',
            spinner: cliSpinners.aesthetic,
            successText: "Reverted back to original state!",
            failText: "Error"
        }
    )
}

async function performBackupAndAppendNew(fileName, fileType, appendLine) {
    fs.readFile(fileName + fileType, async function (err, data) {
        if (err) throw err;
        if (data.includes(appendLine)) {
            let revertChoice = await (prompts(prompt.revert, { onCancel }))
            const { RevertSelection } = revertChoice;
            if (RevertSelection) {
                revertBack(fileName, fileType);
            } else {
            };
        } else {

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
            ), ``)
                ,
                {
                    discardStdin: false,
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
                    text: 'Completing',
                    spinner: cliSpinners.aesthetic,
                    successText: "Completed, open a new terminal and try it",
                    failText: "Error"
                }
            );
        }
    });
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